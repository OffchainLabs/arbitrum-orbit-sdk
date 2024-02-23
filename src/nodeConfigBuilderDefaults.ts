import { NodeConfig } from './types/NodeConfig.generated';

export const nodeConfigBuilderDefaults: NodeConfig = {
  http: {
    addr: '0.0.0.0',
    port: 8449,
    vhosts: ['*'],
    corsdomain: ['*'],
    api: ['eth', 'net', 'web3', 'arb', 'debug'],
  },
  node: {
    'sequencer': true,
    'delayed-sequencer': {
      'enable': true,
      'use-merge-finality': false,
      'finalize-distance': 1,
    },
    'batch-poster': {
      'max-size': 90000,
      'enable': true,
    },
    'staker': {
      enable: true,
      strategy: 'MakeNodes',
    },
    'dangerous': {
      'no-sequencer-coordinator': true,
    },
  },
  execution: {
    'forwarding-target': '',
    'sequencer': {
      'enable': true,
      'max-tx-data-size': 85000,
      'max-block-speed': '250ms',
    },
    'caching': {
      archive: true,
    },
  },
};
