import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';

/**
 * Returns the default number of confirmation blocks required for a transaction,
 * based on the parent chain provided.
 *
 * @param {ParentChainId | PublicClient} parentChainIdOrPublicClient - The parent chain ID or the public client instance.
 * @returns {bigint} - The default number of confirmation blocks.
 */
export function getDefaultConfirmPeriodBlocks(
  parentChainIdOrPublicClient: ParentChainId | PublicClient,
): bigint {
  const isMainnet = parentChainIsMainnet(validateParentChain(parentChainIdOrPublicClient));

  if (!isMainnet) {
    return 150n;
  }

  return 45_818n;
}
