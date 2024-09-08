import { Chain } from 'viem';

type LooksLikeChain = {
  id: number;
};

export const customChains: Chain[] = [];

export function registerCustomParentChain(chain: LooksLikeChain) {
  customChains.push(chain as Chain);
}
