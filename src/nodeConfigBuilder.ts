import { NodeConfig } from './types/NodeConfig.generated';
import { nodeConfigBuilderDefaults } from './nodeConfigBuilderDefaults';

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

  return new NodeConfigBuilder(nodeConfigBuilderDefaults);
}

const nodeConfig = createNodeConfigBuilder()
  //
  .set(config.auth.addr, '127.0.0.1')
  .set(config.auth.api, ['eth'])
  .build();
