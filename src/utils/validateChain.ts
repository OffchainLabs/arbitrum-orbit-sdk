import { PublicClient } from 'viem';
import { chains } from '../chains';

type ChainId = (typeof chains)[number]['id'];

/**
 * Checks if the provided chain ID is valid.
 *
 * @param {number | undefined} chainId - The chain ID to validate.
 * @returns {boolean} - Returns true if the chain ID is valid, otherwise false.
 */
function isValidChainId(chainId: number | undefined): chainId is ChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(chainId));
}

/**
 * Validates the provided chain ID or PublicClient instance.
 *
 * @param {number | PublicClient} chainIdOrPublicClient - The chain ID or PublicClient instance to validate.
 * @returns {ChainId} - Returns the validated chain ID.
 * @throws {Error} - Throws an error if the chain ID is not supported.
 */
export function validateChain(chainIdOrPublicClient: number | PublicClient): ChainId {
  const chainId =
    typeof chainIdOrPublicClient === 'number'
      ? chainIdOrPublicClient
      : chainIdOrPublicClient.chain?.id;

  if (!isValidChainId(chainId)) {
    throw new Error(`Chain not supported: ${chainId}`);
  }

  return chainId;
}
