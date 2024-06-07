import { defineChain } from 'viem';
import {
  mainnet,
  holesky,
  arbitrum as arbitrumOne,
  arbitrumNova,
  sepolia,
  arbitrumSepolia,
} from 'viem/chains';

/**
 * Defines the Nitro Testnode L1 chain.
 * @constant
 * @type {Chain}
 * @property {number} id - The chain ID
 * @property {string} network - The network name
 * @property {string} name - The chain name
 * @property {Object} nativeCurrency - The native currency of the chain
 * @property {string} nativeCurrency.name - The name of the native currency
 * @property {string} nativeCurrency.symbol - The symbol of the native currency
 * @property {number} nativeCurrency.decimals - The decimals of the native currency
 * @property {Object} rpcUrls - The RPC URLs for the chain
 * @property {Object} rpcUrls.default - The default RPC URLs
 * @property {Array<string>} rpcUrls.default.http - The default HTTP RPC URLs
 * @property {Object} rpcUrls.public - The public RPC URLs
 * @property {Array<string>} rpcUrls.public.http - The public HTTP RPC URLs
 * @property {boolean} testnet - Indicates if the chain is a testnet
 */
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

/**
 * Defines the Nitro Testnode L2 chain.
 * @constant
 * @type {Chain}
 * @property {number} id - The chain ID
 * @property {string} network - The network name
 * @property {string} name - The chain name
 * @property {Object} nativeCurrency - The native currency of the chain
 * @property {string} nativeCurrency.name - The name of the native currency
 * @property {string} nativeCurrency.symbol - The symbol of the native currency
 * @property {number} nativeCurrency.decimals - The decimals of the native currency
 * @property {Object} rpcUrls - The RPC URLs for the chain
 * @property {Object} rpcUrls.default - The default RPC URLs
 * @property {Array<string>} rpcUrls.default.http - The default HTTP RPC URLs
 * @property {Object} rpcUrls.public - The public RPC URLs
 * @property {Array<string>} rpcUrls.public.http - The public HTTP RPC URLs
 * @property {boolean} testnet - Indicates if the chain is a testnet
 */
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

/**
 * Defines the Nitro Testnode L3 chain.
 * @constant
 * @type {Chain}
 * @property {number} id - The chain ID
 * @property {string} network - The network name
 * @property {string} name - The chain name
 * @property {Object} nativeCurrency - The native currency of the chain
 * @property {string} nativeCurrency.name - The name of the native currency
 * @property {string} nativeCurrency.symbol - The symbol of the native currency
 * @property {number} nativeCurrency.decimals - The decimals of the native currency
 * @property {Object} rpcUrls - The RPC URLs for the chain
 * @property {Object} rpcUrls.default - The default RPC URLs
 * @property {Array<string>} rpcUrls.default.http - The default HTTP RPC URLs
 * @property {Object} rpcUrls.public - The public RPC URLs
 * @property {Array<string>} rpcUrls.public.http - The public HTTP RPC URLs
 * @property {boolean} testnet - Indicates if the chain is a testnet
 */
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
 * List of supported chains.
 * @constant
 * @type {Array<Chain>}
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