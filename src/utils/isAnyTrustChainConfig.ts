import { ChainConfig } from '../types/ChainConfig';

/**
 * Checks if there is any trust chain configuration present in the provided
 * {@link ChainConfig} object.
 */
export function isAnyTrustChainConfig(chainConfig: ChainConfig) {
  return chainConfig.arbitrum.DataAvailabilityCommittee;
}
