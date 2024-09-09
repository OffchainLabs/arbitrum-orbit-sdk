import { Chain } from 'viem';

export function createCustomChain({ id }: { id: number }): Chain {
  return {
    id,
    name: `Custom Chain (${id})`,
    network: `custom-chain-${id}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      public: {
        http: ['http://localhost:3000'],
      },
      default: {
        http: ['http://localhost:3000'],
      },
    },
  };
}
