import { PublicClient } from 'viem';

type JsonRpcResult = {
  jsonrpc: '2.0';
  id: 1;
  result: string;
};

/**
 * Returns the client version of the provided PublicClient or RPC URL.
 *
 * @param {PublicClient | string} publicClientOrRpcUrl - The PublicClient instance or RPC URL string.
 * @returns {Promise<string>} - A promise that resolves to the client version string.
 * @throws {Error} - Throws an error if the RPC URL is invalid.
 */
export async function getClientVersion(
  publicClientOrRpcUrl: PublicClient | string,
): Promise<string> {
  const rpcUrl =
    typeof publicClientOrRpcUrl === 'string'
      ? publicClientOrRpcUrl
      : publicClientOrRpcUrl.chain?.rpcUrls.default.http[0];

  if (typeof rpcUrl === 'undefined') {
    throw new Error(`[getClientVersion] invalid rpc url: ${rpcUrl}`);
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'web3_clientVersion',
      params: [],
      id: 1,
    }),
  });

  return ((await response.json()) as unknown as JsonRpcResult).result;
}
