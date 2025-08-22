// Order matches Go's ChainConfig struct field order from:
// https://github.com/OffchainLabs/go-ethereum/blob/060ec4165f5fef525ddff1d3facff142532413a2/params/config.go#L392
const CHAIN_CONFIG_KEY_ORDER = [
  'chainId',
  'homesteadBlock',
  'daoForkBlock',
  'daoForkSupport',
  'eip150Block',
  'eip155Block',
  'eip158Block',
  'byzantiumBlock',
  'constantinopleBlock',
  'petersburgBlock',
  'istanbulBlock',
  'muirGlacierBlock',
  'berlinBlock',
  'londonBlock',
  'arrowGlacierBlock',
  'grayGlacierBlock',
  'mergeNetsplitBlock',
  'shanghaiTime',
  'cancunTime',
  'pragueTime',
  'osakaTime',
  'verkleTime',
  'terminalTotalDifficulty',
  'depositContractAddress',
  'enableVerkleAtGenesis',
  'ethash',
  'clique',
  'blobScheduleConfig',
  'arbitrum',
];

export function prepareChainConfigSortKeys<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  const objKeys = Object.keys(obj);

  // First, add keys in the predefined order if they exist
  for (const key of CHAIN_CONFIG_KEY_ORDER) {
    if (key in obj) {
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key as keyof T] = prepareChainConfigSortKeys(value);
      } else {
        result[key as keyof T] = value;
      }
    }
  }

  // Then add any remaining keys alphabetically
  const remainingKeys = objKeys.filter((key) => !CHAIN_CONFIG_KEY_ORDER.includes(key)).sort();

  for (const key of remainingKeys) {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = prepareChainConfigSortKeys(value);
    } else {
      result[key as keyof T] = value;
    }
  }

  return result;
}
