import { defineChain } from 'viem';
import {
  mainnet,
  holesky,
  arbitrum as arbitrumOne,
  arbitrumNova,
  sepolia,
  arbitrumSepolia,
} from 'viem/chains';

const nitroTestnodeL1 = defineChain({
  id: 1_337,
  network: 'Nitro Testnode L1',
  name: 'nitro-testnode-l1',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

const nitroTestnodeL2 = defineChain({
  id: 412_346,
  network: 'Nitro Testnode L2',
  name: 'nitro-testnode-l2',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8547'],
    },
    public: {
      http: ['http://127.0.0.1:8547'],
    },
  },
  testnet: true,
});

// the L3 deployed as part of the nitro-testnode framework uses a custom fee token
const nitroTestnodeL3 = defineChain({
  id: 333333,
  network: 'Nitro Testnode L3',
  name: 'nitro-testnode-l3',
  nativeCurrency: { name: 'AppTestToken', symbol: 'APP', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:3347'],
    },
    public: {
      http: ['http://127.0.0.1:3347'],
    },
  },
  testnet: true,
});

/**
 * The `chains` variable contains an array of various blockchain configurations,
 * including mainnet, testnet, and local nitro-testnode chains. Each chain
 * object includes information such as network name, native currency details,
 * RPC URLs, and testnet status. It provides a convenient way to access and
 * reference different blockchain configurations within the application.
 */
export const chains = [
  // mainnet
  mainnet,
  arbitrumOne,
  arbitrumNova,
  // testnet
  sepolia,
  holesky,
  arbitrumSepolia,
  // local nitro-testnode
  nitroTestnodeL1,
  nitroTestnodeL2,
  nitroTestnodeL3,
] as const;

export {
  // mainnet
  mainnet,
  arbitrumOne,
  arbitrumNova,
  // testnet
  sepolia,
  holesky,
  arbitrumSepolia,
  // local nitro-testnode
  nitroTestnodeL1,
  nitroTestnodeL2,
  nitroTestnodeL3,
};
