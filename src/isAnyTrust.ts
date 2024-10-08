import { Address, Chain, PublicClient, Transport, decodeFunctionData, getAbiItem } from 'viem';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { rollupCreatorABI as rollupCreatorV1Dot1ABI } from './contracts/RollupCreator/v1.1';

const createRollupABI = getAbiItem({ abi: rollupCreatorABI, name: 'createRollup' });
const createRollupV1Dot1ABI = getAbiItem({ abi: rollupCreatorV1Dot1ABI, name: 'createRollup' });

function parseConfig(config: { chainConfig: string }): boolean {
  return JSON.parse(config.chainConfig).arbitrum.DataAvailabilityCommittee;
}

export async function isAnyTrust<TChain extends Chain>({
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

  let result: boolean | null = null;
  // try parsing from multiple RollupCreator versions
  [
    // v2.1
    createRollupABI,
    // v1.1
    createRollupV1Dot1ABI,
  ].forEach((abi) => {
    try {
      const {
        args: [{ config }],
      } = decodeFunctionData({
        abi: [abi],
        data: transaction.input,
      });

      result = parseConfig(config);
    } catch (error) {
      // do nothing
    }
  });

  if (result === null) {
    throw new Error(
      `[isAnyTrust] failed to decode input data for transaction ${createRollupTransactionHash}`,
    );
  }

  return result;
}
