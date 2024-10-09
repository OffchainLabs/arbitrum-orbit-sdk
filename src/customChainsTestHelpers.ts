import { Chain } from 'viem';

export function createExampleCustomParentChain({ id }: { id: number }) {
  return {
    id,
    name: `Custom Parent Chain (${id})`,
    network: `custom-parent-chain-${id}`,
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
    contracts: {
      rollupCreator: {
        address: '0x1000000000000000000000000000000000000000',
      },
      tokenBridgeCreator: {
        address: '0x2000000000000000000000000000000000000000',
      },
    },
  } satisfies Chain;
}
