import { Address, Chain, PublicClient, Transport, decodeFunctionData, getAbiItem } from 'viem';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { rollupCreatorV1Dot2ABI } from './contracts';

const createRollupABI = getAbiItem({ abi: rollupCreatorV1Dot2ABI, name: 'createRollup' });

// todo: make it work with RollupCreator v2.1
export async function isAnyTrust<TChain extends Chain | undefined>({
  rollup,
  publicClient,
}: {
  rollup: Address;
  publicClient: PublicClient<Transport, TChain>;
}) {
  const createRollupTransactionHash = await createRollupFetchTransactionHash({
    rollup,
    publicClient,
  });

  const transaction = await publicClient.getTransaction({
    hash: createRollupTransactionHash,
  });
  const {
    args: [{ config }],
  } = decodeFunctionData({
    abi: [createRollupABI],
    data: transaction.input,
  });
  const chainConfig = JSON.parse(config.chainConfig);
  return chainConfig.arbitrum.DataAvailabilityCommittee;
}
