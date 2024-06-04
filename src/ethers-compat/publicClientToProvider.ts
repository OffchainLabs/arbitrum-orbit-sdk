import { PublicClient, Transport, Chain } from 'viem';
import { providers } from 'ethers';

// based on https://wagmi.sh/react/ethers-adapters#reference-implementation
export function publicClientToProvider<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
) {
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
