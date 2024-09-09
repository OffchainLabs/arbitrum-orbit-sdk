import { Client, Transport, Chain } from 'viem';

import { tokenBridgeCreatorAddress } from '../contracts/TokenBridgeCreator';
import { validateParentChain } from '../types/ParentChain';

export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  // check if it's a custom parent chain
  if (client.chain?.contracts?.tokenBridgeCreator?.address) {
    return client.chain?.contracts?.tokenBridgeCreator?.address;
  }

  if (!tokenBridgeCreatorAddress[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreatorAddress[chainId];
}
