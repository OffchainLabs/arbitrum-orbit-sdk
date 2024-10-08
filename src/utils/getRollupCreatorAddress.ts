import { Client, Transport, Chain, ChainContract, Address } from 'viem';

import { rollupCreatorAddress } from '../contracts/RollupCreator';
import { validateParentChain } from '../types/ParentChain';

export function getRollupCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
): Address {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } = validateParentChain(client);

  if (parentChainIsCustom) {
    const customParentChainRollupCreator = client.chain?.contracts?.rollupCreator as
      | ChainContract
      | undefined;

    // check if it's a custom parent chain with the factory address provided

    if (!customParentChainRollupCreator?.address) {
      throw new Error('invalid rollup creator address provided');
    }

    return customParentChainRollupCreator?.address;
  }

  return rollupCreatorAddress[parentChainId];
}
