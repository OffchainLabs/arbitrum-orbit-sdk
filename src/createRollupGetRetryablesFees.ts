import { PublicClient, Address } from 'viem';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { defaults as createRollupDefaults } from './createRollupDefaults';

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

type Params = {
  nativeToken?: Address;
  maxFeePerGasForRetryables?: bigint;
};

export async function createRollupGetRetryablesFees(
  publicClient: PublicClient,
  { nativeToken, maxFeePerGasForRetryables }: Params,
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

  const templateInbox = isCustomFeeTokenAddress(nativeToken)
    ? erc20TemplateInbox
    : ethTemplateInbox;

  return await publicClient.readContract({
    abi: deployHelperABI,
    address: deployHelperAddress,
    functionName: 'getDeploymentTotalCost',
    args: [
      templateInbox,
      maxFeePerGasForRetryables ?? createRollupDefaults.maxFeePerGasForRetryables,
    ],
  });
}
