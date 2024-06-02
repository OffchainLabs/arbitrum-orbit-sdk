import { NodeConfig } from './types/NodeConfig.generated';
import {
  NodeConfigChainInfoJson,
  NodeConfigDataAvailabilityRpcAggregatorBackendsJson,
} from './types/NodeConfig';
import { ChainConfig } from './types/ChainConfig';
import { CoreContracts } from './types/CoreContracts';
import { ParentChainId, validateParentChain } from './types/ParentChain';
import {
  mainnet,
  arbitrumOne,
  arbitrumNova,
  sepolia,
  holesky,
  arbitrumSepolia,
  nitroTestnodeL1,
  nitroTestnodeL2,
} from './chains';
import { getParentChainLayer } from './utils';

/**
 * Removes the '0x' prefix from a private key if it exists.
 * @param {string} privateKey - The private key to sanitize.
 * @returns {string} - The sanitized private key.
 */
function sanitizePrivateKey(privateKey: string): string {
  return privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
}

/**
 * Converts NodeConfigChainInfoJson object to its JSON string representation.
 * @param {NodeConfigChainInfoJson} infoJson - The info JSON object to stringify.
 * @returns {string} - The JSON string representation of the info JSON object.
 */
function stringifyInfoJson(infoJson: NodeConfigChainInfoJson): string {
  return JSON.stringify(infoJson);
}

/**
 * Converts NodeConfigDataAvailabilityRpcAggregatorBackendsJson object to its JSON string representation.
 * @param {NodeConfigDataAvailabilityRpcAggregatorBackendsJson} backendsJson - The backends JSON object to stringify.
 * @returns {string} - The JSON string representation of the backends JSON object.
 */
function stringifyBackendsJson(
  backendsJson: NodeConfigDataAvailabilityRpcAggregatorBackendsJson,
): string {
  return JSON.stringify(backendsJson);
}

/**
 * Checks if the parent chain is an Arbitrum chain.
 * @param {ParentChainId} parentChainId - The ID of the parent chain.
 * @returns {boolean} - True if the parent chain is an Arbitrum chain, false otherwise.
 */
function parentChainIsArbitrum(parentChainId: ParentChainId): boolean {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    case mainnet.id:
    case sepolia.id:
    case holesky.id:
    case nitroTestnodeL1.id:
      return false;

    case arbitrumOne.id:
    case arbitrumNova.id:
    case arbitrumSepolia.id:
    case nitroTestnodeL2.id:
      return true;
  }
}

export type PrepareNodeConfigParams = {
  chainName: string;
  chainConfig: ChainConfig;
  coreContracts: CoreContracts;
  batchPosterPrivateKey: string;
  validatorPrivateKey: string;
  parentChainId: ParentChainId;
  parentChainRpcUrl: string;
  parentChainBeaconRpcUrl?: string;
};

/**
 * Prepares the configuration object for a node based on the provided parameters.
 *
 * This function sets up various configurations such as chain information, parent chain details,
 * HTTP settings, node features like sequencer and batch poster, execution parameters, and data
 * availability settings if applicable.
 *
 * @param {PrepareNodeConfigParams} params - The parameters for preparing the node configuration.
 * @param {string} params.chainName - The name of the chain.
 * @param {ChainConfig} params.chainConfig - The chain configuration object.
 * @param {CoreContracts} params.coreContracts - The core contracts for the chain.
 * @param {string} params.batchPosterPrivateKey - The private key for the batch poster.
 * @param {string} params.validatorPrivateKey - The private key for the validator.
 * @param {ParentChainId} params.parentChainId - The ID of the parent chain.
 * @param {string} params.parentChainRpcUrl - The RPC URL of the parent chain.
 * @param {string} [params.parentChainBeaconRpcUrl] - The Beacon RPC URL of the parent chain, required for L2 Orbit chains.
 * @returns {NodeConfig} - The prepared node configuration object.
 *
 * @throws Will throw an error if parentChainBeaconRpcUrl is not provided for L2 Orbit chains.
 *
 * @example
 * const nodeConfig = prepareNodeConfig({
 *   chainName: 'MyChain',
 *   chainConfig: myChainConfig,
 *   coreContracts: myCoreContracts,
 *   batchPosterPrivateKey: '0xabc123',
 *   validatorPrivateKey: '0xdef456',
 *   parentChainId: mainnet.id,
 *   parentChainRpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
 *   parentChainBeaconRpcUrl: 'https://beacon-mainnet.infura.io/v3/YOUR-PROJECT-ID',
 * });
 * console.log(nodeConfig);
 */
export function prepareNodeConfig({
  chainName,
  chainConfig,
  coreContracts,
  batchPosterPrivateKey,
  validatorPrivateKey,
  parentChainId,
  parentChainRpcUrl,
  parentChainBeaconRpcUrl,
}: PrepareNodeConfigParams): NodeConfig {
  // For L2 Orbit chains settling to Ethereum mainnet or testnet, a parentChainBeaconRpcUrl is enforced
  if (getParentChainLayer(parentChainId) === 1 && !parentChainBeaconRpcUrl) {
    throw new Error(`"parentChainBeaconRpcUrl" is required for L2 Orbit chains.`);
  }

  const config: NodeConfig = {
    'chain': {
      'info-json': stringifyInfoJson([
        {
          'chain-id': chainConfig.chainId,
          'parent-chain-id': parentChainId,
          'parent-chain-is-arbitrum': parentChainIsArbitrum(validateParentChain(parentChainId)),
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
      vhosts: ['*'],
      corsdomain: ['*'],
      api: ['eth', 'net', 'web3', 'arb', 'debug'],
    },
    'node': {
      'sequencer': true,
      'delayed-sequencer': {
        'enable': true,
        'use-merge-finality': false,
        'finalize-distance': 1,
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

  if (parentChainBeaconRpcUrl) {
    config['parent-chain']!['blob-client'] = {
      'beacon-url': parentChainBeaconRpcUrl,
    };
  }

  if (chainConfig.arbitrum.DataAvailabilityCommittee) {
    config.node!['data-availability'] = {
      'enable': true,
      'sequencer-inbox-address': coreContracts.sequencerInbox,
      'parent-chain-node-url': parentChainRpcUrl,
      'rest-aggregator': {
        enable: true,
        urls: ['http://localhost:9877'],
      },
      'rpc-aggregator': {
        'enable': true,
        'assumed-honest': 1,
        'backends': stringifyBackendsJson([
          {
            url: 'http://localhost:9876',
            pubkey:
              'YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
            signermask: 1,
          },
        ]),
      },
    };
  }

  return config;
}
