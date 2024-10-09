import { Chain } from 'viem';
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

import { generateChainId } from './utils';

export function testHelper_createCustomParentChain(params?: { id?: number }) {
  const chainId = params?.id ?? generateChainId();
  const rollupCreator = privateKeyToAddress(generatePrivateKey());
  const tokenBridgeCreator = privateKeyToAddress(generatePrivateKey());

  return {
    id: chainId,
    name: `Custom Parent Chain (${chainId})`,
    network: `custom-parent-chain-${chainId}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      public: {
        // have to put a valid rpc here so using arbitrum sepolia
        http: ['https://sepolia-rollup.arbitrum.io/rpc'],
      },
      default: {
        // have to put a valid rpc here so using arbitrum sepolia
        http: ['https://sepolia-rollup.arbitrum.io/rpc'],
      },
    },
    contracts: {
      rollupCreator: { address: rollupCreator },
      tokenBridgeCreator: { address: tokenBridgeCreator },
    },
  } satisfies Chain;
}
