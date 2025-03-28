import { Client, Transport, Chain } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { getParentChainBlockTime } from './getParentChainBlockTime';

export function getDefaultValidatorAfkBlocks<TChain extends Chain | undefined>(
  parentChainIdOrClient: ParentChainId | Client<Transport, TChain>,
): bigint {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } =
    validateParentChain(parentChainIdOrClient);

  if (parentChainIsCustom) {
    throw new Error(
      `[getDefaultValidatorAfkBlocks] can't provide defaults for custom parent chain with id ${parentChainId}`,
    );
  }

  const blocksPerMinute = 60 / getParentChainBlockTime(parentChainId);

  // 28 days
  return BigInt(28 * 24 * 60 * blocksPerMinute);
}
