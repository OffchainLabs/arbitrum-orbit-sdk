import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';

/**
 * Get the default confirm period blocks based on the parent chain.
 *
 * @param {ParentChainId | PublicClient} parentChainIdOrPublicClient - The parent chain ID or the public client.
 * @returns {bigint} The default number of confirm period blocks.
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
