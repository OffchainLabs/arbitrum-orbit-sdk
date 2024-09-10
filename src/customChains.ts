import { Chain, ChainContract, Client } from 'viem';

export type CustomParentChain = Chain & {
  contracts: {
    rollupCreator: ChainContract;
    tokenBridgeCreator: ChainContract;
  };
};

export const customChains: Chain[] = [];

export function registerCustomParentChain(chain: CustomParentChain) {
  // todo: don't duplicate
  customChains.push(chain);
}

export function isCustomParentChain(clientOrChainOrChainId: Client | Chain | number): boolean {
  let chainId = -1;

  if (typeof clientOrChainOrChainId === 'number') {
    chainId = clientOrChainOrChainId;
  } else if (typeof (clientOrChainOrChainId as Chain).id === 'number') {
    chainId = (clientOrChainOrChainId as Chain).id;
  } else if (typeof (clientOrChainOrChainId as Client).chain?.id === 'number') {
    chainId = (clientOrChainOrChainId as Client).chain!.id;
  }

  return customChains.map((chain) => chain.id).includes(chainId);
}
