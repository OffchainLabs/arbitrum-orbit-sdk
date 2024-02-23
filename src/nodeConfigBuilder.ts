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

class NodeConfigBuilder {
  private nodeConfig: NodeConfig = {};

  set<TKey extends NodeConfigKey>(key: TKey, value: NodeConfigValue<TKey>): NodeConfigBuilder {
    throw new Error(`not yet implemented`);
  }

  build(): NodeConfig {
    return this.nodeConfig;
  }
}

export function createNodeConfigBuilder(): NodeConfigBuilder {
  return new NodeConfigBuilder();
}

const nodeConfig = createNodeConfigBuilder()
  //
  .set('auth.addr', '127.0.0.1')
  .set('auth.api', ['eth', 'net', 'web3', 'arb', 'debug'])
  .build();
