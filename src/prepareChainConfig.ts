import { ChainConfig, ChainConfigArbitrumParams } from './types/ChainConfig';

/**
 * The defaults object contains default values for various blockchain
 * parameters, such as block numbers and configuration settings. It includes
 * values for Ethereum mainnet hard forks like Homestead, Constantinople, and
 * Istanbul, as well as specific settings for the Arbitrum layer 2 solution. The
 * prepareChainConfig function utilizes these defaults to create a complete
 * ChainConfig object with the specified parameters.
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
 * Merges the default chain configuration with the provided parameters.
 *
 * This function takes in specific configurations for the Clique and Arbitrum
 * consensus algorithms and returns a complete {@link ChainConfig} object with
 * the updated values.
 *
 * @param {PrepareChainConfigParams} params - The parameters to merge with defaults.
 * @param {number} params.chainId - The chain ID.
 * @param {Object} [params.clique] - Clique consensus parameters.
 * @param {number} [params.clique.period] - The period of the clique consensus.
 * @param {number} [params.clique.epoch] - The epoch of the clique consensus.
 * @param {Object} params.arbitrum - Arbitrum-specific parameters.
 * @param {string} params.arbitrum.InitialChainOwner - The initial chain owner for Arbitrum.
 * @param {boolean} [params.arbitrum.EnableArbOS] - Enable ArbOS.
 * @param {boolean} [params.arbitrum.AllowDebugPrecompiles] - Allow debug precompiles.
 * @param {boolean} [params.arbitrum.DataAvailabilityCommittee] - Data availability committee.
 * @param {number} [params.arbitrum.InitialArbOSVersion] - Initial ArbOS version.
 * @param {number} [params.arbitrum.GenesisBlockNum] - Genesis block number.
 * @param {number} [params.arbitrum.MaxCodeSize] - Maximum code size.
 * @param {number} [params.arbitrum.MaxInitCodeSize] - Maximum initial code size.
 *
 * @returns {ChainConfig} The complete chain configuration object.
 *
 * @example
 * const customConfig = prepareChainConfig({
 *   chainId: 42161,
 *   clique: { period: 15, epoch: 30000 },
 *   arbitrum: { InitialChainOwner: '0xYourAddressHere' },
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
