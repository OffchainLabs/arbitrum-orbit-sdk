import {
  Chain,
  PublicClient,
  Transport,
  Address,
  encodeFunctionData,
  decodeFunctionResult,
} from 'viem';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { defaults as createRollupDefaults } from './createRollupDefaults';
import { applyPercentIncrease } from './utils/gasOverrides';

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
  nativeToken?: Address;
  maxFeePerGasForRetryables?: bigint;
};

export async function createRollupGetRetryablesFees<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
  { nativeToken, maxFeePerGasForRetryables }: CreateRollupGetRetryablesFeesParams,
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

  const inbox = isCustomFeeTokenAddress(nativeToken) ? erc20TemplateInbox : ethTemplateInbox;
  const maxFeePerGas = maxFeePerGasForRetryables ?? createRollupDefaults.maxFeePerGasForRetryables;

  const baseFee = await publicClient.getGasPrice();
  const baseFeeWithBuffer = applyPercentIncrease({ base: baseFee, percentIncrease: 20n });

  const { data: result } = await publicClient.call({
    data: encodeFunctionData({
      abi: deployHelperABI,
      functionName: 'getDeploymentTotalCost',
      args: [inbox, maxFeePerGas],
    }),
    to: deployHelperAddress,
    maxFeePerGas: baseFeeWithBuffer,
    // todo:fix
  } as any);

  return decodeFunctionResult({
    abi: deployHelperABI,
    functionName: 'getDeploymentTotalCost',
    data: result!,
  });
}
