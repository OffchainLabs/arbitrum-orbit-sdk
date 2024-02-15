import { ChainConfig } from './ChainConfig';

export type NodeConfigChainInfoJson = [
  {
    'chain-id': number;
    'parent-chain-id': number;
    'parent-chain-is-arbitrum': boolean;
    'chain-name': string;
    'chain-config': ChainConfig;
    'rollup': {
      'bridge': string;
      'inbox': string;
      'sequencer-inbox': string;
      'rollup': string;
      'validator-utils': string;
      'validator-wallet-creator': string;
      'deployed-at': number;
    };
  },
];

export type NodeConfigDataAvailabilityRpcAggregatorBackendsJson = [
  {
    url: string;
    pubkey: string;
    signermask: number;
  },
];

export type NodeConfig = {
  'chain': {
    /**
     * This is a stringified `NodeConfigChainInfoJson` object.
     */
    'info-json': string;
    'name': string;
  };
  'parent-chain': {
    connection: {
      url: string;
    };
  };
  'http': {
    addr: string;
    port: number;
    vhosts: string;
    corsdomain: string;
    api: string[];
  };
  'node': {
    'sequencer': boolean;
    'delayed-sequencer': {
      'enable': boolean;
      'use-merge-finality': boolean;
    };
    'batch-poster': {
      'max-size': number;
      'enable': boolean;
      'parent-chain-wallet': {
        'private-key': string;
      };
    };
    'staker': {
      'enable': boolean;
      'strategy': string;
      'parent-chain-wallet': {
        'private-key': string;
      };
    };
    'data-availability'?: {
      'enable': boolean;
      'sequencer-inbox-address': string;
      'parent-chain-node-url': string;
      'rest-aggregator': {
        enable: boolean;
        urls: string;
      };
      'rpc-aggregator': {
        'enable': boolean;
        'assumed-honest': number;
        /**
         * This is a stringified `NodeConfigDataAvailabilityRpcAggregatorBackendsJson` object.
         */
        'backends': string;
      };
    };
    'dangerous': {
      'no-sequencer-coordinator': boolean;
    };
  };
  'execution': {
    'forwarding-target': string;
    'sequencer': {
      'max-tx-data-size': number;
      'enable': boolean;
      'max-block-speed': string;
    };
    'caching': {
      archive: boolean;
    };
  };
};
