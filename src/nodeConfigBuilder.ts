import { NodeConfig, NodeConfigOption } from './types/NodeConfig.generated';
import { nodeConfigBuilderDefaults } from './nodeConfigBuilderDefaults';

// todo: is there a way to make jsdoc readable when working with the builder?

type NodeConfigOptionName = NodeConfigOption['name'];

type NodeConfigOptionValue<TName extends NodeConfigOptionName> = Extract<
  NodeConfigOption,
  { name: TName }
>['type'];

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

  set<TName extends NodeConfigOptionName>(
    name: TName,
    value: NodeConfigOptionValue<TName>,
  ): NodeConfigBuilder {
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
  .set('chain.name', 'asdf')
  .set('chain.info-json', 'asdf')
  .set('parent-chain.connection.url', '')
  .set('node.batch-poster.parent-chain-wallet.private-key', '')
  .set('node.staker.parent-chain-wallet.private-key', '')
  .build();
