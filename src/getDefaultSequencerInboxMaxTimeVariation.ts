import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { base, baseSepolia } from './chains';

export type SequencerInboxMaxTimeVariation = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};

/**
 * getDefaultSequencerInboxMaxTimeVariation returns a {@link
 * SequencerInboxMaxTimeVariation} object with delay and future blocks and
 * seconds based on the parent chain ID or PublicClient provided. The variation
 * values differ depending on the parent chain being either base or baseSepolia.
 */
export function getDefaultSequencerInboxMaxTimeVariation(
  parentChainIdOrPublicClient: ParentChainId | PublicClient,
): SequencerInboxMaxTimeVariation {
  const parentChainId = validateParentChain(parentChainIdOrPublicClient);

  const delaySeconds = 60 * 60 * 24 * 4; // 4 days;
  const futureSeconds = 60 * 60; // 1 hour;

  if (parentChainId === base.id || parentChainId === baseSepolia.id) {
    // For Arbitrum L3s built on top of an OP Stack L2, `block.number` will return the L2 block number.
    // L2 blocks in OP Stack chains are produced every 2 seconds.
    return {
      delayBlocks: BigInt(delaySeconds / 2),
      futureBlocks: BigInt(futureSeconds / 2),
      delaySeconds: BigInt(delaySeconds),
      futureSeconds: BigInt(futureSeconds),
    };
  }

  return {
    delayBlocks: BigInt(delaySeconds / 12),
    futureBlocks: BigInt(futureSeconds / 12),
    delaySeconds: BigInt(delaySeconds),
    futureSeconds: BigInt(futureSeconds),
  };
}
