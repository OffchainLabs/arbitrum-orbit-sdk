import { Client, Transport, Chain } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { getParentChainBlockTime } from './getParentChainBlockTime';

// todo: get from abi
export type BufferConfig = {
  threshold: bigint;
  max: bigint;
  replenishRateInBasis: bigint;
};

export function getDefaultBufferConfig<TChain extends Chain | undefined>(
  parentChainIdOrClient: ParentChainId | Client<Transport, TChain>,
): BufferConfig {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } =
    validateParentChain(parentChainIdOrClient);

  if (parentChainIsCustom) {
    throw new Error(
      `[getDefaultBufferConfig] can't provide defaults for custom parent chain with id ${parentChainId}`,
    );
  }

  const blocksPerMinute = 60 / getParentChainBlockTime(parentChainId);

  return {
    // 2 hours
    threshold: BigInt(2 * 60 * blocksPerMinute),
    // 2 days
    max: BigInt(2 * 24 * 60 * blocksPerMinute),
    // 5%
    replenishRateInBasis: BigInt(500),
  };
}
