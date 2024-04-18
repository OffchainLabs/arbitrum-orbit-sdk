import { it, expect } from 'vitest';

import { ChainConfig } from './types/ChainConfig';
import { prepareChainConfig } from './prepareChainConfig';

const chainId = 69_420;
const vitalik: `0x${string}` = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

it('creates chain config with defaults', () => {
  const params = {
    chainId,
    arbitrum: {
      InitialChainOwner: vitalik,
    },
  };

  expect(prepareChainConfig(params)).toMatchSnapshot();
});

it('creates chain config with custom params', () => {
  const params: ChainConfig = {
    chainId,
    homesteadBlock: 1,
    daoForkBlock: null,
    daoForkSupport: false,
    eip150Block: 1,
    eip150Hash: '0x1100000000000000000000000000000000000000000000000000000000000000',
    eip155Block: 1,
    eip158Block: 1,
    byzantiumBlock: 1,
    constantinopleBlock: 1,
    petersburgBlock: 1,
    istanbulBlock: 1,
    muirGlacierBlock: 1,
    berlinBlock: 1,
    londonBlock: 1,
    clique: {
      period: 1,
      epoch: 1,
    },
    arbitrum: {
      EnableArbOS: false,
      AllowDebugPrecompiles: true,
      DataAvailabilityCommittee: true,
      InitialArbOSVersion: 20,
      InitialChainOwner: vitalik,
      GenesisBlockNum: 1,
      MaxCodeSize: 40 * 1024,
      MaxInitCodeSize: 80 * 1024,
    },
  };

  expect(prepareChainConfig(params)).toMatchSnapshot();
});
