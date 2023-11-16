import { NodeConfig } from './types/NodeConfig';
import { ChainConfig } from './types/ChainConfig';
import { CoreContracts } from './types/CoreContracts';

export function prepareNodeConfig({
  chainName,
  chainConfig,
  coreContracts,
  coreContractsDeploymentBlockNumber,
  batchPosterPrivateKey,
  validatorPrivateKey,
  parentChainId,
  parentChainRpcUrl,
}: {
  chainName: string;
  chainConfig: ChainConfig;
  coreContracts: CoreContracts;
  coreContractsDeploymentBlockNumber: number;
  batchPosterPrivateKey: string;
  validatorPrivateKey: string;
  parentChainId: number;
  parentChainRpcUrl: string;
}): NodeConfig {
  const config: NodeConfig = {
    'chain': {
      'info-json': [
        {
          'chain-id': chainConfig.chainId,
          'parent-chain-id': parentChainId,
          'chain-name': chainName,
          'chain-config': chainConfig,
          'rollup': {
            'bridge': coreContracts.bridge,
            'inbox': coreContracts.inbox,
            'sequencer-inbox': coreContracts.sequencerInbox,
            'rollup': coreContracts.rollup,
            'validator-utils': coreContracts.validatorUtils,
            'validator-wallet-creator': coreContracts.validatorWalletCreator,
            'deployed-at': coreContractsDeploymentBlockNumber,
          },
        },
      ],
      'name': chainName,
    },
    'parent-chain': {
      connection: {
        url: parentChainRpcUrl,
      },
    },
    'http': {
      addr: '0.0.0.0',
      port: 8449,
      vhosts: '*',
      corsdomain: '*',
      api: ['eth', 'net', 'web3', 'arb', 'debug'],
    },
    'node': {
      'forwarding-target': '',
      'sequencer': {
        'max-tx-data-size': 85000,
        'enable': true,
        'dangerous': {
          'no-coordinator': true,
        },
        'max-block-speed': '250ms',
      },
      'delayed-sequencer': {
        enable: true,
      },
      'batch-poster': {
        'max-size': 90000,
        'enable': true,
        'parent-chain-wallet': {
          'private-key': batchPosterPrivateKey,
        },
      },
      'staker': {
        'enable': true,
        'strategy': 'MakeNodes',
        'parent-chain-wallet': {
          'private-key': validatorPrivateKey,
        },
      },
      'caching': {
        archive: true,
      },
    },
  };

  if (chainConfig.arbitrum.DataAvailabilityCommittee) {
    config.node['data-availability'] = {
      'enable': true,
      'sequencer-inbox-address': coreContracts.sequencerInbox,
      'parent-chain-node-url': parentChainRpcUrl,
      'rest-aggregator': {
        enable: true,
        urls: 'http://localhost:9876',
      },
      'rpc-aggregator': {
        'enable': true,
        'assumed-honest': 1,
        'backends':
          '[{"url":"http://localhost:9876","pubkey":"YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==","signermask":1}]',
      },
    };
  }

  return config;
}
