import { PublicClient } from 'viem';
import { providers } from 'ethers';

/**
 * Converts a Viem PublicClient to an Ethers.js StaticJsonRpcProvider.
 *
 * This function takes a Viem PublicClient and transforms it into an Ethers.js
 * StaticJsonRpcProvider. It ensures that the chain information is defined and
 * constructs a network object which includes chainId, name, and optionally the
 * ENS registry address.
 *
 * @param {PublicClient} publicClient - The Viem PublicClient instance to convert.
 * @throws Will throw an error if the chain information is undefined.
 * @returns {providers.StaticJsonRpcProvider} The corresponding Ethers.js StaticJsonRpcProvider.
 *
 * @example
 * const viemClient = new PublicClient({
 *   chain: {
 *     id: 1,
 *     name: 'mainnet',
 *     rpcUrls: { default: { http: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID'] } },
 *     contracts: { ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' } }
 *   }
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
