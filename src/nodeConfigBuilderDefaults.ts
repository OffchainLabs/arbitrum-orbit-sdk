import { NodeConfig } from './types/NodeConfig.generated';

export const nodeConfigBuilderDefaults: NodeConfig = {
  http: {
    addr: '0.0.0.0',
    port: 8449,
    vhosts: ['*'],
    corsdomain: ['*'],
    api: ['eth', 'net', 'web3', 'arb', 'debug'],
  },
};
