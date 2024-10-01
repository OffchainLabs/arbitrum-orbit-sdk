import { Client, Transport, Chain, ChainContract } from 'viem';

import { tokenBridgeCreatorAddress } from '../contracts/TokenBridgeCreator';
import { validateParentChain } from '../types/ParentChain';

export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const customParentChainTokenBridgeCreator = client.chain?.contracts?.tokenBridgeCreator as
    | ChainContract
    | undefined;

  // check if it's a custom parent chain with the factory address provided
  if (customParentChainTokenBridgeCreator?.address) {
    return customParentChainTokenBridgeCreator?.address;
  }

  const chainId = validateParentChain(client);

  if (!tokenBridgeCreatorAddress[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreatorAddress[chainId];
}
