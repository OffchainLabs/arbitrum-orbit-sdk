import { ChainConfig } from '../types/ChainConfig';

/**
 * Checks if there is any trust chain configuration present in the given {@link
 * ChainConfig} object.
 *
 * @param {ChainConfig} chainConfig - The chain configuration object to be checked.
 * @returns {boolean} - Returns true if there is a Data Availability Committee configuration, false otherwise.
 */
export function isAnyTrustChainConfig(chainConfig: ChainConfig): boolean {
  return chainConfig.arbitrum.DataAvailabilityCommittee;
}
