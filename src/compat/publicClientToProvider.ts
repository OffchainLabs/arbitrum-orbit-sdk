import { PublicClient } from 'viem';
import { providers } from 'ethers';

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;

  console.log({ transport: transport.url });
  const transportUrl = chain?.rpcUrls.default.http[0] ?? 'http://localhost:8545';

  if (typeof chain === 'undefined') {
    throw new Error(`[publicClientToProvider] chain is undefined`);
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  return new providers.StaticJsonRpcProvider(transportUrl, network);
}
