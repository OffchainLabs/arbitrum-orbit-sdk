import { Chain } from 'viem';

export const arbitrumLocal: Chain = {
  id: 412_346,
  name: 'Arbitrum Local',
  network: 'arbitrum-local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8547'],
    },
    public: {
      http: ['http://127.0.0.1:8547'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'http://127.0.0.1:4000',
    },
  },
};
