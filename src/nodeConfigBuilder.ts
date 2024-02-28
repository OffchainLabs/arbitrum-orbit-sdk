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
    return this;
  }

  build(): NodeConfig {
    return this.nodeConfig;
  }
}

export type CreateNodeConfigBuilderParams = {
  withDefaults?: boolean;
  withDataAvailability?: boolean;
};

export function createNodeConfigBuilder(params?: CreateNodeConfigBuilderParams): NodeConfigBuilder {
  const withDefaults = params?.withDefaults ?? true;

  if (!withDefaults) {
    return new NodeConfigBuilder();
  }

  return new NodeConfigBuilder(nodeConfigBuilderDefaults);
}
