type LooksLikeChain = {
  id: number;
};

export const customChains: LooksLikeChain[] = [];

export function registerCustomParentChain(chain: LooksLikeChain) {
  customChains.push(chain);
}
