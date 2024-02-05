import {
  NodeConfig,
  NodeConfigChainInfoJson,
  NodeConfigDataAvailabilityRpcAggregatorBackendsJson,
} from './types/NodeConfig';
import { ChainConfig } from './types/ChainConfig';
import { CoreContracts } from './types/CoreContracts';
import { ParentChainId, validParentChainId } from './types/ParentChain';
import { sepolia, arbitrumSepolia, nitroTestnodeL1, nitroTestnodeL2 } from './chains';

function sanitizePrivateKey(privateKey: string) {
  return privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
}

function stringifyInfoJson(infoJson: NodeConfigChainInfoJson): string {
  return JSON.stringify(infoJson);
}

function stringifyBackendsJson(
  backendsJson: NodeConfigDataAvailabilityRpcAggregatorBackendsJson,
): string {
  return JSON.stringify(backendsJson);
}

function parentChainIsArbitrum(parentChainId: ParentChainId): boolean {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    case sepolia.id:
    case nitroTestnodeL1.id:
      return false;

    case arbitrumSepolia.id:
    case nitroTestnodeL2.id:
      return true;
  }
}

export function prepareNodeConfig({
  chainName,
  chainConfig,
  coreContracts,
  batchPosterPrivateKey,
  validatorPrivateKey,
  parentChainId,
  parentChainRpcUrl,
}: {
  chainName: string;
  chainConfig: ChainConfig;
  coreContracts: CoreContracts;
  batchPosterPrivateKey: string;
  validatorPrivateKey: string;
  parentChainId: number;
  parentChainRpcUrl: string;
}): NodeConfig {
  if (!validParentChainId(parentChainId)) {
    throw new Error(`[prepareNodeConfig] invalid parent chain id: ${parentChainId}`);
  }

  const config: NodeConfig = {
    'chain': {
      'info-json': stringifyInfoJson([
        {
          'chain-id': chainConfig.chainId,
          'parent-chain-id': parentChainId,
          'parent-chain-is-arbitrum': parentChainIsArbitrum(parentChainId),
          'chain-name': chainName,
          'chain-config': chainConfig,
          'rollup': {
            'bridge': coreContracts.bridge,
            'inbox': coreContracts.inbox,
            'sequencer-inbox': coreContracts.sequencerInbox,
            'rollup': coreContracts.rollup,
            'validator-utils': coreContracts.validatorUtils,
            'validator-wallet-creator': coreContracts.validatorWalletCreator,
            'deployed-at': coreContracts.deployedAtBlockNumber,
          },
        },
      ]),
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
      'sequencer': true,
      'delayed-sequencer': {
        enable: true,
      },
      'batch-poster': {
        'max-size': 90000,
        'enable': true,
        'parent-chain-wallet': {
          'private-key': sanitizePrivateKey(batchPosterPrivateKey),
        },
      },
      'staker': {
        'enable': true,
        'strategy': 'MakeNodes',
        'parent-chain-wallet': {
          'private-key': sanitizePrivateKey(validatorPrivateKey),
        },
      },
      'dangerous': {
        'no-sequencer-coordinator': true,
      },
    },
    'execution': {
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

  return config;
}
