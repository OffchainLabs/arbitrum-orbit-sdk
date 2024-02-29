import { NodeConfig, NodeConfigOption } from './types/NodeConfig.generated';
import { getNodeConfigBuilderDefaults } from './nodeConfigBuilderDefaults';

// todo: is there a way to make jsdoc readable when working with the builder?

export type NodeConfigOptionKey = NodeConfigOption['key'];

export type NodeConfigOptionGetType<TKey extends NodeConfigOptionKey> = Extract<
  NodeConfigOption,
  { name: TKey }
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

export class NodeConfigBuilder {
  private nodeConfig: NodeConfig;

  constructor(initialNodeConfig?: NodeConfig) {
    this.nodeConfig = initialNodeConfig ?? {};
  }

  set<TKey extends NodeConfigOptionKey>(
    key: TKey,
    value: NodeConfigOptionGetType<TKey>,
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

  return new NodeConfigBuilder(getNodeConfigBuilderDefaults(params));
}
