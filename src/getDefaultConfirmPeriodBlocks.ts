import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';
import { base } from './chains';

export function getDefaultConfirmPeriodBlocks(
  parentChainIdOrPublicClient: ParentChainId | PublicClient,
): bigint {
  const parentChainId = validateParentChain(parentChainIdOrPublicClient);

  const isMainnet = parentChainIsMainnet(parentChainId);
  const confirmPeriodBlocks = isMainnet ? 45_818n : 150n;

  if (parentChainId === base.id) {
    // For Arbitrum L2s built on top of Ethereum, or Arbitrum L3s built on top of an Arbitrum L2, `block.number` always returns the L1 block number.
    // L1 blocks are produced every 12 seconds.
    //
    // For Arbitrum L3s built on top of an OP Stack L2, `block.number` will return the L2 block number.
    // L2 blocks in OP Stack chains are produced every 2 seconds, which is 6 times more frequent, so we have to multiply the result by 6 to achieve the same.
    return confirmPeriodBlocks * 6n;
  }

  return confirmPeriodBlocks;
}
