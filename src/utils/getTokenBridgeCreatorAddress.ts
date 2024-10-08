import { Client, Transport, Chain, ChainContract } from 'viem';

import { tokenBridgeCreatorAddress } from '../contracts/TokenBridgeCreator';
import { validateParentChain } from '../types/ParentChain';

export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } = validateParentChain(client);

  if (parentChainIsCustom) {
    const customParentChainTokenBridgeCreator = client.chain?.contracts?.tokenBridgeCreator as
      | ChainContract
      | undefined;

    // check if it's a custom parent chain with the factory address provided

    if (!customParentChainTokenBridgeCreator?.address) {
      throw new Error('invalid token bridge creator address provided');
    }

    return customParentChainTokenBridgeCreator?.address;
  }

  return tokenBridgeCreatorAddress[parentChainId];
}
