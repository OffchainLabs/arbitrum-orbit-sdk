import { it, expect } from 'vitest';

import { createNodeConfigBuilder, InitializeThings } from './nodeConfigBuilder';
import { prepareChainConfig } from './prepareChainConfig';

const initializeParams: InitializeThings = {
  chain: {
    id: 123_456,
    name: 'my-l3-chain',
    config: prepareChainConfig({
      chainId: 123_456,
      arbitrum: { InitialChainOwner: '0x1000000000000000000000000000000000000000' },
    }),
  },
  parentChain: {
    id: 421_614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    coreContracts: {
      bridge: '0x0000000000000000000000000000000000000001',
      inbox: '0x0000000000000000000000000000000000000002',
      sequencerInbox: '0x0000000000000000000000000000000000000003',
      rollup: '0x0000000000000000000000000000000000000004',
      validatorUtils: '0x0000000000000000000000000000000000000005',
      validatorWalletCreator: '0x0000000000000000000000000000000000000006',
      deployedAtBlockNumber: 456_789,
    },
  },
};

it('creates node config', () => {
  const nodeConfig = createNodeConfigBuilder()
    //
    .initialize(initializeParams)
    .build();

  expect(nodeConfig).toMatchSnapshot();
});

it('creates node config without defaults', () => {
  const nodeConfig = createNodeConfigBuilder({ withDefaults: false })
    .initialize(initializeParams)
    .build();

  expect(nodeConfig).toMatchSnapshot();
});

it('creates node config with data availability service', () => {
  const nodeConfig = createNodeConfigBuilder()
    .initialize(initializeParams)
    .enableDataAvailabilityService({
      restAggregator: {
        urls: ['http://localhost:9877'],
      },
      rpcAggregator: {
        backends: [
          {
            url: 'http://localhost:9876',
            pubkey:
              'YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
            signermask: 1,
          },
        ],
      },
    })
    .build();

  expect(nodeConfig).toMatchSnapshot();
});

it('creates node config with sequencer, batch poster and staker', () => {
  const nodeConfig = createNodeConfigBuilder()
    .initialize(initializeParams)
    .enableSequencer()
    .enableBatchPoster({ privateKey: 'BATCH_POSTER_PRIVATE_KEY' })
    .enableStaker({ privateKey: 'STAKER_PRIVATE_KEY' })
    .build();

  expect(nodeConfig).toMatchSnapshot();
});
