import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';

export type SequencerInboxMaxTimeVariation = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};

/**
 * Returns the default maximum time variation for the sequencer inbox.
 *
 * Validates the parent chain and calculates the delay and future blocks
 * and seconds based on fixed time intervals.
 *
 * @param {ParentChainId | PublicClient} parentChainIdOrPublicClient - The parent chain ID or public client
 * @returns {SequencerInboxMaxTimeVariation} - The default sequencer inbox max time variation
 */
export function getDefaultSequencerInboxMaxTimeVariation(
  parentChainIdOrPublicClient: ParentChainId | PublicClient,
): SequencerInboxMaxTimeVariation {
  validateParentChain(parentChainIdOrPublicClient);

  const delaySeconds = 60 * 60 * 24 * 4; // 4 days;
  const delayBlocks = delaySeconds / 12;

  const futureSeconds = 60 * 60; // 1 hour;
  const futureBlocks = futureSeconds / 12;

  return {
    delayBlocks: BigInt(delayBlocks),
    futureBlocks: BigInt(futureBlocks),
    delaySeconds: BigInt(delaySeconds),
    futureSeconds: BigInt(futureSeconds),
  };
}
