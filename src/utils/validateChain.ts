import { PublicClient } from 'viem';
import { chains } from '../chains';

type ChainId = (typeof chains)[number]['id'];

/**
 * Checks if the provided chain ID is valid.
 *
 * @param {number | undefined} chainId - The chain ID to validate.
 * @returns {boolean} True if the chain ID is valid, otherwise false.
 */
function isValidChainId(chainId: number | undefined): chainId is ChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(chainId));
}

/**
 * Validates the provided chain ID or PublicClient and ensures that it is a
 * supported chain within the system. Returns a {@link ChainId}.
 *
 * @param {number | PublicClient} chainIdOrPublicClient - The chain ID or PublicClient to validate.
 * @returns {ChainId} The validated chain ID.
 * @throws {Error} If the chain ID is not supported.
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
