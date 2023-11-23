import { it, expect } from 'vitest';

import { ChainConfig } from './types/ChainConfig';
import { defaults, prepareChainConfig } from './prepareChainConfig';

const chainId = 69_420;
const vitalik: `0x${string}` = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

function assertChainConfigsEqual(aConfig: ChainConfig, bConfig: ChainConfig) {
  expect(aConfig.chainId).toEqual(bConfig.chainId);
  expect(aConfig.homesteadBlock).toEqual(bConfig.homesteadBlock);
  expect(aConfig.daoForkBlock).toEqual(bConfig.daoForkBlock);
  expect(aConfig.daoForkSupport).toEqual(bConfig.daoForkSupport);
  expect(aConfig.eip150Block).toEqual(bConfig.eip150Block);
  expect(aConfig.eip150Hash).toEqual(bConfig.eip150Hash);
  expect(aConfig.eip155Block).toEqual(bConfig.eip155Block);
  expect(aConfig.eip158Block).toEqual(bConfig.eip158Block);
  expect(aConfig.byzantiumBlock).toEqual(bConfig.byzantiumBlock);
  expect(aConfig.constantinopleBlock).toEqual(bConfig.constantinopleBlock);
  expect(aConfig.petersburgBlock).toEqual(bConfig.petersburgBlock);
  expect(aConfig.istanbulBlock).toEqual(bConfig.istanbulBlock);
  expect(aConfig.muirGlacierBlock).toEqual(bConfig.muirGlacierBlock);
  expect(aConfig.berlinBlock).toEqual(bConfig.berlinBlock);
  expect(aConfig.londonBlock).toEqual(bConfig.londonBlock);
  expect(aConfig.clique.period).toEqual(bConfig.clique.period);
  expect(aConfig.clique.epoch).toEqual(bConfig.clique.epoch);

  const { arbitrum: aConfigArb } = aConfig;
  const { arbitrum: bConfigArb } = bConfig;

  expect(aConfigArb.EnableArbOS).toEqual(bConfigArb.EnableArbOS);
  expect(aConfigArb.AllowDebugPrecompiles).toEqual(bConfigArb.AllowDebugPrecompiles);
  expect(aConfigArb.DataAvailabilityCommittee).toEqual(bConfigArb.DataAvailabilityCommittee);
  expect(aConfigArb.InitialArbOSVersion).toEqual(bConfigArb.InitialArbOSVersion);
  expect(aConfigArb.InitialChainOwner).toEqual(bConfigArb.InitialChainOwner);
  expect(aConfigArb.GenesisBlockNum).toEqual(bConfigArb.GenesisBlockNum);
}

it('creates chain config with defaults', () => {
  const params = {
    chainId,
    arbitrum: {
      InitialChainOwner: vitalik,
    },
  };

  const result = prepareChainConfig(params);

  assertChainConfigsEqual(result, {
    ...defaults,
    chainId,
    arbitrum: {
      ...defaults.arbitrum,
      InitialChainOwner: vitalik,
    },
  });
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
      InitialArbOSVersion: 11,
      InitialChainOwner: vitalik,
      GenesisBlockNum: 1,
      MaxCodeSize: 40 * 1024,
      MaxInitCodeSize: 80 * 1024,
    },
  };

  const result = prepareChainConfig(params);

  assertChainConfigsEqual(result, params);
});
