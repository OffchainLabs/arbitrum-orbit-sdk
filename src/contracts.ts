import { parseAbi } from 'viem';

import {
  erc20ABI,
  arbOwnerConfig,
  arbOwnerPublicConfig,
  rollupCreatorConfig,
  tokenBridgeCreatorConfig,
  arbGasInfoConfig,
  arbAggregatorConfig,
} from './generated';
import { sequencerInboxABI, rollupAdminLogicABI } from './abi';

/**
 * ERC-20 token contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the ERC-20 token contract.
 */
export const erc20 = {
  abi: erc20ABI,
};

/**
 * Arbitrum Owner contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Arbitrum Owner contract.
 * @property {Object} address - The address of the Arbitrum Owner contract.
 */
export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

/**
 * Arbitrum Gas Info contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Arbitrum Gas Info contract.
 * @property {Object} address - The address of the Arbitrum Gas Info contract.
 */
export const arbGasInfo = {
  ...arbGasInfoConfig,
  address: Object.values(arbGasInfoConfig.address)[0],
} as const;

/**
 * Arbitrum Owner Public contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Arbitrum Owner Public contract.
 * @property {Object} address - The address of the Arbitrum Owner Public contract.
 */
export const arbOwnerPublic = {
  ...arbOwnerPublicConfig,
  address: Object.values(arbOwnerPublicConfig.address)[0],
} as const;

/**
 * Arbitrum Aggregator contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Arbitrum Aggregator contract.
 * @property {Object} address - The address of the Arbitrum Aggregator contract.
 */
export const arbAggregator = {
  ...arbAggregatorConfig,
  address: Object.values(arbAggregatorConfig.address)[0],
} as const;

/**
 * Rollup Creator contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Rollup Creator contract.
 * @property {Object} address - The address of the Rollup Creator contract.
 */
export const rollupCreator = rollupCreatorConfig;

/**
 * Upgrade Executor contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Upgrade Executor contract.
 */
export const upgradeExecutor = {
  abi: parseAbi([
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
    'function hasRole(bytes32 role, address account) public view returns (bool)',
    'function grantRole(bytes32 role, address account)',
    'function revokeRole(bytes32 role, address account)',
  ]),
};

/**
 * Token Bridge Creator contract ABI and configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Token Bridge Creator contract.
 * @property {Object} address - The address of the Token Bridge Creator contract.
 */
const tokenBridgeCreatorABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'inbox', type: 'address' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'address', name: 'standardGateway', type: 'address' },
          { internalType: 'address', name: 'customGateway', type: 'address' },
          { internalType: 'address', name: 'wethGateway', type: 'address' },
          { internalType: 'address', name: 'weth', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct L1DeploymentAddresses',
        name: 'l1Deployment',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'address', name: 'standardGateway', type: 'address' },
          { internalType: 'address', name: 'customGateway', type: 'address' },
          { internalType: 'address', name: 'wethGateway', type: 'address' },
          { internalType: 'address', name: 'weth', type: 'address' },
          { internalType: 'address', name: 'proxyAdmin', type: 'address' },
          { internalType: 'address', name: 'beaconProxyFactory', type: 'address' },
          { internalType: 'address', name: 'upgradeExecutor', type: 'address' },
          { internalType: 'address', name: 'multicall', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct L2DeploymentAddresses',
        name: 'l2Deployment',
        type: 'tuple',
      },
      { indexed: false, internalType: 'address', name: 'proxyAdmin', type: 'address' },
      { indexed: false, internalType: 'address', name: 'upgradeExecutor', type: 'address' },
    ],
    name: 'OrbitTokenBridgeCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'inbox', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'address', name: 'standardGateway', type: 'address' },
          { internalType: 'address', name: 'customGateway', type: 'address' },
          { internalType: 'address', name: 'wethGateway', type: 'address' },
          { internalType: 'address', name: 'weth', type: 'address' },
          { internalType: 'address', name: 'proxyAdmin', type: 'address' },
          { internalType: 'address', name: 'beaconProxyFactory', type: 'address' },
          { internalType: 'address', name: 'upgradeExecutor', type: 'address' },
          { internalType: 'address', name: 'multicall', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct L2DeploymentAddresses',
        name: 'l2',
        type: 'tuple',
      },
    ],
    name: 'OrbitTokenBridgeDeploymentSet',
    type: 'event',
  },
  {
    inputs: [],
    name: 'canonicalL2FactoryAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'inbox', type: 'address' },
      { internalType: 'address', name: 'rollupOwner', type: 'address' },
      { internalType: 'uint256', name: 'maxGasForContracts', type: 'uint256' },
      { internalType: 'uint256', name: 'gasPriceBid', type: 'uint256' },
    ],
    name: 'createTokenBridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gasLimitForL2FactoryDeployment',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'inboxToL1Deployment',
    outputs: [
      { internalType: 'address', name: 'router', type: 'address' },
      { internalType: 'address', name: 'standardGateway', type: 'address' },
      { internalType: 'address', name: 'customGateway', type: 'address' },
      { internalType: 'address', name: 'wethGateway', type: 'address' },
      { internalType: 'address', name: 'weth', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'inboxToL2Deployment',
    outputs: [
      { internalType: 'address', name: 'router', type: 'address' },
      { internalType: 'address', name: 'standardGateway', type: 'address' },
      { internalType: 'address', name: 'customGateway', type: 'address' },
      { internalType: 'address', name: 'wethGateway', type: 'address' },
      { internalType: 'address', name: 'weth', type: 'address' },
      { internalType: 'address', name: 'proxyAdmin', type: 'address' },
      { internalType: 'address', name: 'beaconProxyFactory', type: 'address' },
      { internalType: 'address', name: 'upgradeExecutor', type: 'address' },
      { internalType: 'address', name: 'multicall', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l1Multicall',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l1Weth',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Token Bridge Creator contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Token Bridge Creator contract.
 * @property {Object} address - The address of the Token Bridge Creator contract.
 */
export const tokenBridgeCreator = {
  ...tokenBridgeCreatorConfig,
  abi: tokenBridgeCreatorABI,
} as const;

/**
 * Sequencer Inbox contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Sequencer Inbox contract.
 */
export const sequencerInbox = {
  abi: sequencerInboxABI,
};

/**
 * Rollup Admin Logic contract configuration.
 * @type {Object}
 * @property {Array} abi - The ABI of the Rollup Admin Logic contract.
 */
export const rollupAdminLogic = {
  abi: rollupAdminLogicABI,
};
