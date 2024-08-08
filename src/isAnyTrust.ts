import { Address, Chain, PublicClient, Transport, decodeFunctionData, getAbiItem } from 'viem';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { rollupCreatorABI as rollupCreatorV1Dot1ABI } from './contracts/RollupCreator/v1.1.0';

const createRollupABI = getAbiItem({ abi: rollupCreatorABI, name: 'createRollup' });
const createRollupV1Dot1ABI = getAbiItem({ abi: rollupCreatorV1Dot1ABI, name: 'createRollup' });

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
    // try parsing for RollupCreator v1.1
    const {
      args: [{ config }],
    } = decodeFunctionData({
      abi: [createRollupV1Dot1ABI],
      data: transaction.input,
    });
    return parseConfig(config);
  }
}
