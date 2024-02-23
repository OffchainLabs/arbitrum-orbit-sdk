import { NodeConfig } from './types/NodeConfig.generated';

// todo: generate with ts-morph
// todo: is there a way to make jsdoc readable when working with the builder?
type NodeConfigParams =
  | {
      key: 'auth.addr';
      type: string;
    }
  | {
      key: 'auth.api';
      type: string[];
    };

type NodeConfigKey = NodeConfigParams['key'];
type NodeConfigValue<TKey extends NodeConfigKey> = Extract<NodeConfigParams, { key: TKey }>['type'];

const config = {
  auth: {
    /**
     * cool cool
     */
    api: 'auth.api',
    /**
     * asdf asdf
     */
    addr: 'auth.addr',
  },
} as const;

class NodeConfigBuilder {
  private nodeConfig: NodeConfig;

  constructor(initialNodeConfig?: NodeConfig) {
    this.nodeConfig = initialNodeConfig ?? {};
  }

  set<TKey extends NodeConfigKey>(key: TKey, value: NodeConfigValue<TKey>): NodeConfigBuilder {
    throw new Error(`not yet implemented`);
  }

  build(): NodeConfig {
    return this.nodeConfig;
  }
}

type CreateNodeConfigBuilderParams = {
  withoutDefaults: boolean;
};

export function createNodeConfigBuilder(params?: CreateNodeConfigBuilderParams): NodeConfigBuilder {
  const withoutDefaults = params?.withoutDefaults ?? false;

  if (withoutDefaults) {
    return new NodeConfigBuilder();
  }

  return new NodeConfigBuilder(nodeConfigDefaults);
}

const nodeConfig = createNodeConfigBuilder()
  //
  .set(config.auth.addr, '127.0.0.1')
  .set(config.auth.api, ['eth'])
  .build();

const nodeConfigDefaults: NodeConfig = {
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
