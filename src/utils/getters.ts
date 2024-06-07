import { Chain, PublicClient } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChain } from '../types/ParentChain';

/**
 * Retrieves the Rollup Creator contract address for the specified PublicClient.
 *
 * @param {PublicClient} client - The public client instance connected to the parent chain.
 * @returns {string} - The Rollup Creator contract address.
 * @throws {Error} - If the parent chain is not supported.
 */
export function getRollupCreatorAddress(client: PublicClient): string {
  const chainId = validateParentChain(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
}

/**
 * Retrieves the Token Bridge Creator contract address for the specified PublicClient.
 *
 * @param {PublicClient} client - The public client instance connected to the parent chain.
 * @returns {string} - The Token Bridge Creator contract address.
 * @throws {Error} - If the parent chain is not supported.
 */
export function getTokenBridgeCreatorAddress(client: PublicClient): string {
  const chainId = validateParentChain(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
}

/**
 * Retrieves the block explorer URL for the specified chain.
 *
 * @param {Chain} chain - The chain object containing block explorer information.
 * @returns {string | undefined} - The URL of the default block explorer, or undefined if not available.
 */
export function getBlockExplorerUrl(chain: Chain): string | undefined {
  return chain.blockExplorers?.default.url;
}
