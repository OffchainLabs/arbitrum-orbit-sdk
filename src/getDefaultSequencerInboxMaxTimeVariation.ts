import { ParentChainId } from './types/ParentChain';

export type SequencerInboxMaxTimeVariation = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};

export function getDefaultSequencerInboxMaxTimeVariation(
  parentChainId: ParentChainId,
): SequencerInboxMaxTimeVariation {
  return {
    delayBlocks: BigInt(5_760),
    futureBlocks: BigInt(48),
    delaySeconds: BigInt(86_400),
    futureSeconds: BigInt(3_600),
  };
}
