import { NodeConfig } from './types/NodeConfig.generated';
import { NodeConfigDataAvailabilityRpcAggregatorBackendsJson } from './types/NodeConfig';

function stringifyBackendsJson(
  backendsJson: NodeConfigDataAvailabilityRpcAggregatorBackendsJson,
): string {
  return JSON.stringify(backendsJson);
}

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

export type GetNodeConfigBuilderDefaultsParams = {
  withDataAvailability?: boolean;
};

export function getNodeConfigBuilderDefaults(
  params?: GetNodeConfigBuilderDefaultsParams,
): NodeConfig {
  let defaults: NodeConfig = {
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

  if (params?.withDataAvailability ?? false) {
    defaults.node!['data-availability'] = {
      'enable': true,
      'rest-aggregator': {
        enable: true,
        urls: ['http://localhost:9877'],
      },
      'rpc-aggregator': {
        'enable': true,
        'assumed-honest': 1,
        'backends': stringifyBackendsJson([
          {
            url: 'http://localhost:9876',
            pubkey:
              'YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
            signermask: 1,
          },
        ]),
      },
    };
  }

  return defaults;
}
