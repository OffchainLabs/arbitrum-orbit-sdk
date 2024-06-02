import { Chain, PublicClient } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChain } from '../types/ParentChain';

/**
 * Returns the address of the rollup creator for a given public client.
 *
 * @param {PublicClient} client - The public client instance.
 * @returns {string} - The address of the rollup creator.
 * @throws {Error} - If the parent chain is not supported.
 */
export function getRollupCreatorAddress(client: PublicClient) {
  const chainId = validateParentChain(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
}

/**
 * Returns the address of the token bridge creator for a specific chain based on the provided PublicClient.
 *
 * @param {PublicClient} client - The public client instance.
 * @returns {string} - The address of the token bridge creator.
 * @throws {Error} - If the parent chain is not supported.
 */
export function getTokenBridgeCreatorAddress(client: PublicClient) {
  const chainId = validateParentChain(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
}

/**
 * Returns the URL of the block explorer for a given {@link Chain}.
 *
 * @param {Chain} chain - The chain instance.
 * @returns {string | undefined} - The URL of the block explorer or undefined if not available.
 */
export function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}
