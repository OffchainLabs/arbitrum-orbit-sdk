import { Address, Chain, ChainContract } from 'viem';

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
