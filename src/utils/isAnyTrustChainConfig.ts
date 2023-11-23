import { ChainConfig } from '../types/ChainConfig';

export function isAnyTrustChainConfig(chainConfig: ChainConfig) {
  return chainConfig.arbitrum.DataAvailabilityCommittee;
}
