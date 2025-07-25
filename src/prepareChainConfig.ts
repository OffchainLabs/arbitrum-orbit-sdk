import { ExcludeSome, Prettify, RequireSome } from './types/utils';
import { ChainConfig, ChainConfigArbitrumParams } from './types/ChainConfig';

function withSortedKeys<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  const sortedKeys = Object.keys(obj).sort();

  for (const key of sortedKeys) {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = withSortedKeys(value);
    } else {
      result[key as keyof T] = value;
    }
  }

  return result;
}

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
    InitialArbOSVersion: 32,
    GenesisBlockNum: 0,
    MaxCodeSize: 24_576,
    MaxInitCodeSize: 49_152,
  },
};

export type PrepareChainConfigParams = Prettify<
  Pick<ChainConfig, 'chainId'> & {
    arbitrum: PrepareChainConfigArbitrumParams;
  }
>;

export type PrepareChainConfigArbitrumParams = RequireSome<
  // exclude some fields that shouldn't be changed
  ExcludeSome<
    ChainConfigArbitrumParams,
    'EnableArbOS' | 'GenesisBlockNum' | 'AllowDebugPrecompiles'
  >,
  // make InitialChainOwner required
  'InitialChainOwner'
>;

export function prepareChainConfig(params: PrepareChainConfigParams): ChainConfig {
  return withSortedKeys({
    ...defaults,
    chainId: params.chainId,
    arbitrum: { ...defaults.arbitrum, ...params.arbitrum },
  });
}
