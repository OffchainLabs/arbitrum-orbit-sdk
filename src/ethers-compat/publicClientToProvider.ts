import { PublicClient } from 'viem';
import { providers } from 'ethers';

/**
 * Converts a Viem PublicClient instance to an Ethers.js provider.
 *
 * @param {PublicClient} publicClient - The Viem PublicClient instance to convert.
 * @returns {providers.StaticJsonRpcProvider} - The Ethers.js StaticJsonRpcProvider.
 * @throws {Error} If the chain property is undefined in the publicClient.
 *
 * @example
 * const viemClient = new PublicClient({
 *   chain: {
 *     id: 1,
 *     name: 'mainnet',
 *     rpcUrls: { default: { http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'] } },
 *     contracts: { ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' } },
 *   },
 * });
 * const ethersProvider = publicClientToProvider(viemClient);
 */
export function publicClientToProvider(publicClient: PublicClient) {
  const { chain } = publicClient;

  if (typeof chain === 'undefined') {
    throw new Error(`[publicClientToProvider] "chain" is undefined`);
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  return new providers.StaticJsonRpcProvider(chain.rpcUrls.default.http[0], network);
}
