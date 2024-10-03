import {
  Chain,
  PublicClient,
  Transport,
  Address,
  CallParameters,
  EstimateGasParameters,
  encodeFunctionData,
  decodeFunctionResult,
} from 'viem';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { defaults as createRollupDefaults } from './createRollupDefaults';
import { applyPercentIncrease } from './utils/gasOverrides';
import { createRollupDefaultRetryablesFees } from './constants';

const deployHelperABI = [
  {
    inputs: [
      { internalType: 'contract IInboxBase', name: 'inbox', type: 'address' },
      { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
    ],
    name: 'getDeploymentTotalCost',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const bridgeCreatorABI = [
  {
    inputs: [],
    name: 'erc20BasedTemplates',
    outputs: [
      { internalType: 'contract IBridge', name: 'bridge', type: 'address' },
      { internalType: 'contract ISequencerInbox', name: 'sequencerInbox', type: 'address' },
      { internalType: 'contract IInboxBase', name: 'inbox', type: 'address' },
      { internalType: 'contract IRollupEventInbox', name: 'rollupEventInbox', type: 'address' },
      { internalType: 'contract IOutbox', name: 'outbox', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethBasedTemplates',
    outputs: [
      { internalType: 'contract IBridge', name: 'bridge', type: 'address' },
      { internalType: 'contract ISequencerInbox', name: 'sequencerInbox', type: 'address' },
      { internalType: 'contract IInboxBase', name: 'inbox', type: 'address' },
      { internalType: 'contract IRollupEventInbox', name: 'rollupEventInbox', type: 'address' },
      { internalType: 'contract IOutbox', name: 'outbox', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type CreateRollupGetRetryablesFeesParams = {
  account: Address;
  nativeToken?: Address;
  maxFeePerGasForRetryables?: bigint;
};

export async function createRollupGetRetryablesFees<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { account, nativeToken, maxFeePerGasForRetryables }: CreateRollupGetRetryablesFeesParams,
): Promise<bigint> {
  const [deployHelperAddress, bridgeCreatorAddress] = await Promise.all([
    publicClient.readContract({
      abi: rollupCreatorABI,
      address: getRollupCreatorAddress(publicClient),
      functionName: 'l2FactoriesDeployer',
    }),
    publicClient.readContract({
      abi: rollupCreatorABI,
      address: getRollupCreatorAddress(publicClient),
      functionName: 'bridgeCreator',
    }),
  ]);

  const [ethBasedTemplates, erc20BasedTemplates] = await Promise.all([
    publicClient.readContract({
      abi: bridgeCreatorABI,
      address: bridgeCreatorAddress,
      functionName: 'ethBasedTemplates',
    }),
    publicClient.readContract({
      abi: bridgeCreatorABI,
      address: bridgeCreatorAddress,
      functionName: 'erc20BasedTemplates',
    }),
  ]);

  const [, , ethTemplateInbox] = ethBasedTemplates;
  const [, , erc20TemplateInbox] = erc20BasedTemplates;

  const isCustomGasToken = isCustomFeeTokenAddress(nativeToken);

  const inbox = isCustomGasToken ? erc20TemplateInbox : ethTemplateInbox;
  const maxFeePerGas = maxFeePerGasForRetryables ?? createRollupDefaults.maxFeePerGasForRetryables;

  const baseFeeWithBuffer = applyPercentIncrease({
    base: await publicClient.getGasPrice(),
    // for custom gas token chains, retryable fees don't scale with parent base fee, so there's no need for any buffer
    // for eth chains, add 30% buffer in case of a spike
    percentIncrease: isCustomGasToken ? undefined : 30n,
  });

  const callParams: CallParameters = {
    account,
    data: encodeFunctionData({
      abi: deployHelperABI,
      functionName: 'getDeploymentTotalCost',
      args: [inbox, maxFeePerGas],
    }),
    to: deployHelperAddress,
    maxFeePerGas: baseFeeWithBuffer,
  };

  // calculate the gas necessary for the call, otherwise it's inflated and the call will fail
  //
  // https://github.com/wevm/viem/discussions/862#discussioncomment-6398745
  const gasWithBuffer = applyPercentIncrease({
    base: await publicClient.estimateGas(callParams as unknown as EstimateGasParameters<TChain>),
    percentIncrease: 30n,
  });

  const { data: result } = await publicClient.call({
    ...callParams,
    gas: gasWithBuffer,
  });

  return decodeFunctionResult({
    abi: deployHelperABI,
    functionName: 'getDeploymentTotalCost',
    data: result!,
  });
}

export async function createRollupGetRetryablesFeesWithDefaults<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { account, nativeToken, maxFeePerGasForRetryables }: CreateRollupGetRetryablesFeesParams,
): Promise<bigint> {
  try {
    return await createRollupGetRetryablesFees(publicClient, {
      account,
      nativeToken,
      maxFeePerGasForRetryables,
    });
  } catch (error) {
    console.error(
      `[createRollupGetRetryablesFeesWithDefaults] Failed to fetch retryables fees, falling back to defaults.\n\n${error}`,
    );
    return createRollupDefaultRetryablesFees;
  }
}
