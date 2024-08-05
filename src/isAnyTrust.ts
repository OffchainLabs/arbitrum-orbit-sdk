import { Address, Chain, PublicClient, Transport, decodeFunctionData, getAbiItem } from 'viem';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { rollupCreator, rollupCreatorV1Dot2ABI } from './contracts';

const createRollupABI = getAbiItem({ abi: rollupCreator.abi, name: 'createRollup' });
const createRollupV1Dot2ABI = getAbiItem({ abi: rollupCreatorV1Dot2ABI, name: 'createRollup' });

function parseConfig(config: { chainConfig: string }): boolean {
  return JSON.parse(config.chainConfig).arbitrum.DataAvailabilityCommittee;
}

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

  try {
    // try parsing for RollupCreator v2.1
    const {
      args: [{ config }],
    } = decodeFunctionData({
      abi: [createRollupABI],
      data: transaction.input,
    });
    return parseConfig(config);
  } catch (error) {
    // try parsing for RollupCreator v1.2
    const {
      args: [{ config }],
    } = decodeFunctionData({
      abi: [createRollupV1Dot2ABI],
      data: transaction.input,
    });
    return parseConfig(config);
  }
}
