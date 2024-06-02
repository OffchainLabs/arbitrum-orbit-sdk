import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';

export type SequencerInboxMaxTimeVariation = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};

/**
 * Retrieves the default maximum time variation for the sequencer inbox.
 *
 * @param {ParentChainId | PublicClient} parentChainIdOrPublicClient - The parent chain ID or PublicClient.
 *   If a ParentChainId is provided, it will be validated.
 *   If a PublicClient is provided, it will be used to determine the parent chain ID.
 *
 * @returns {SequencerInboxMaxTimeVariation} - An object containing delayBlocks, futureBlocks, delaySeconds, and futureSeconds values.
 *
 * @example
 * const parentChainId = 1n; // Example parent chain ID
 * const timeVariation = getDefaultSequencerInboxMaxTimeVariation(parentChainId);
 * console.log(timeVariation);
 * // Output:
 * // {
 * //   delayBlocks: 28800n,
 * //   futureBlocks: 300n,
 * //   delaySeconds: 345600n,
 * //   futureSeconds: 3600n
 * // }
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
