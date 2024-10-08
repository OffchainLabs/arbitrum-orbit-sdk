import { Client, Transport, Chain } from 'viem';

import { tokenBridgeCreatorAddress } from '../contracts/TokenBridgeCreator';
import { validateParentChain } from '../types/ParentChain';

export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const { chainId } = validateParentChain(client);

  if (!tokenBridgeCreatorAddress[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreatorAddress[chainId];
}
