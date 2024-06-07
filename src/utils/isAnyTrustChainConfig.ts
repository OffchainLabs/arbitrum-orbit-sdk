import { ChainConfig } from '../types/ChainConfig';

/**
 * Checks if the given ChainConfig is for an AnyTrust chain.
 *
 * @param {ChainConfig} chainConfig - The chain configuration object.
 * @returns {boolean} - Returns true if the chainConfig is for an AnyTrust chain, otherwise false.
 */
export function isAnyTrustChainConfig(chainConfig: ChainConfig): boolean {
  return chainConfig.arbitrum.DataAvailabilityCommittee;
}
