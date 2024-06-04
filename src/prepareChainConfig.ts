import { ChainConfig, ChainConfigArbitrumParams } from './types/ChainConfig';

/**
 * The `defaults` object contains default values for various blockchain
 * parameters such as block numbers and flags. It also includes default settings
 * for the Arbitrum chain configuration. The `prepareChainConfig` function
 * merges these default values with any user-provided parameters to create a
 * complete `ChainConfig` object.
 */
export const defaults = {
  homesteadBlock: 0,
  daoForkBlock: null,
  daoForkSupport: true,
  eip150Block: 0,
  eip150Hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  eip155Block: 0,
  eip158Block: 0,
  byzantiumBlock: 0,
  constantinopleBlock: 0,
  petersburgBlock: 0,
  istanbulBlock: 0,
  muirGlacierBlock: 0,
  berlinBlock: 0,
  londonBlock: 0,
  clique: {
    period: 0,
    epoch: 0,
  },
  arbitrum: {
    EnableArbOS: true,
    AllowDebugPrecompiles: false,
    DataAvailabilityCommittee: false,
    InitialArbOSVersion: 20,
    GenesisBlockNum: 0,
    MaxCodeSize: 24_576,
    MaxInitCodeSize: 49_152,
  },
};

export type PrepareChainConfigParams = Pick<ChainConfig, 'chainId'> &
  Partial<Omit<ChainConfig, 'chainId' | 'arbitrum'>> & {
    arbitrum: Pick<ChainConfigArbitrumParams, 'InitialChainOwner'> &
      Partial<Omit<ChainConfigArbitrumParams, 'InitialChainOwner'>>;
  };

/**
 * prepareChainConfig prepares a ChainConfig object by merging default values
 * with the provided parameters, including chainId and arbitrum configuration.
 * It returns a ChainConfig object with the finalized configuration settings.
 */
export function prepareChainConfig(params: PrepareChainConfigParams): ChainConfig {
  return {
    ...defaults,
    ...params,
    clique: { ...defaults.clique, ...params.clique },
    arbitrum: { ...defaults.arbitrum, ...params.arbitrum },
  };
}
