import { ChainConfig, ChainConfigArbitrumParams } from './types/ChainConfig';

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
 * Prepares the chain configuration by merging provided parameters with default values.
 *
 * @param {PrepareChainConfigParams} params - The parameters for preparing the chain configuration.
 * @param {number} params.chainId - The chain ID.
 * @param {Object} [params.clique] - Optional clique parameters.
 * @param {number} [params.clique.period=0] - The period of the clique.
 * @param {number} [params.clique.epoch=0] - The epoch of the clique.
 * @param {Object} params.arbitrum - The Arbitrum-specific parameters.
 * @param {string} params.arbitrum.InitialChainOwner - The initial chain owner address.
 * @param {boolean} [params.arbitrum.EnableArbOS=true] - Whether to enable ArbOS.
 * @param {boolean} [params.arbitrum.AllowDebugPrecompiles=false] - Whether to allow debug precompiles.
 * @param {boolean} [params.arbitrum.DataAvailabilityCommittee=false] - Whether to enable the Data Availability Committee.
 * @param {number} [params.arbitrum.InitialArbOSVersion=20] - The initial ArbOS version.
 * @param {number} [params.arbitrum.GenesisBlockNum=0] - The genesis block number.
 * @param {number} [params.arbitrum.MaxCodeSize=24576] - The maximum code size.
 * @param {number} [params.arbitrum.MaxInitCodeSize=49152] - The maximum init code size.
 *
 * @returns {ChainConfig} The prepared chain configuration.
 *
 * @example
 * const chainConfig = prepareChainConfig({
 *   chainId: 1,
 *   clique: { period: 15, epoch: 30000 },
 *   arbitrum: { InitialChainOwner: '0xYourAddress' }
 * });
 */
export function prepareChainConfig(params: PrepareChainConfigParams): ChainConfig {
  return {
    ...defaults,
    ...params,
    clique: { ...defaults.clique, ...params.clique },
    arbitrum: { ...defaults.arbitrum, ...params.arbitrum },
  };
}
