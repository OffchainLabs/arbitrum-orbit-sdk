import { Client, Transport, Chain } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';
import { getParentChainBlockTime } from './getParentChainBlockTime';

export function getDefaultChallengeGracePeriodBlocks<TChain extends Chain | undefined>(
  parentChainIdOrClient: ParentChainId | Client<Transport, TChain>,
): bigint {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } =
    validateParentChain(parentChainIdOrClient);

  if (parentChainIsCustom) {
    throw new Error(
      `[getDefaultChallengeGracePeriodBlocks] can't provide defaults for custom parent chain with id ${parentChainId}`,
    );
  }

  const isMainnet = parentChainIsMainnet(parentChainId);
  const blocksPerMinute = 60 / getParentChainBlockTime(parentChainId);

  return isMainnet
    ? // 2 days
      BigInt(2 * 24 * 60 * blocksPerMinute)
    : // 10 minutes
      BigInt(30 * blocksPerMinute);
}
