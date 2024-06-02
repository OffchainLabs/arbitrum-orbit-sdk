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
 * @property {Array} abi - The ABI of the ERC-20 token contract.
 */
export const erc20 = {
  abi: erc20ABI,
};

/**
 * Arbitrum owner configuration.
 * @property {Object} arbOwnerConfig - The configuration object for the Arbitrum owner.
 * @property {string} address - The address of the Arbitrum owner.
 */
export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

/**
 * Gas information configuration for the Arbitrum network.
 * @property {Object} arbGasInfoConfig - The configuration object for Arbitrum gas information.
 * @property {string} address - The address for gas information.
 */
export const arbGasInfo = {
  ...arbGasInfoConfig,
  address: Object.values(arbGasInfoConfig.address)[0],
} as const;

/**
 * Public configuration for the Arbitrum owner's address.
 * @property {Object} arbOwnerPublicConfig - The configuration object for the Arbitrum owner's public address.
 * @property {string} address - The public address of the Arbitrum owner.
 */
export const arbOwnerPublic = {
  ...arbOwnerPublicConfig,
  address: Object.values(arbOwnerPublicConfig.address)[0],
} as const;

/**
 * Aggregator configuration for retrieving data from a specified source.
 * @property {Object} arbAggregatorConfig - The configuration object for the Arbitrum aggregator.
 * @property {string} address - The address of the aggregator.
 */
export const arbAggregator = {
  ...arbAggregatorConfig,
  address: Object.values(arbAggregatorConfig.address)[0],
} as const;

/**
 * Rollup creator configuration.
 * @property {Object} rollupCreatorConfig - The configuration object for the rollup creator.
 */
export const rollupCreator = rollupCreatorConfig;

/**
 * Executor for upgrades, calls, and role management.
 * @property {Array} abi - The ABI for the upgrade executor contract.
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
 * Token bridge creator configuration and ABI.
 * @property {Object} tokenBridgeCreatorConfig - The configuration object for the token bridge creator.
 * @property {Array} abi - The ABI for the token bridge creator contract.
 */
export const tokenBridgeCreator = {
  ...tokenBridgeCreatorConfig,
  abi: tokenBridgeCreatorABI,
} as const;

/**
 * Sequencer inbox contract configuration.
 * @property {Array} abi - The ABI of the sequencer inbox contract.
 */
export const sequencerInbox = {
  abi: sequencerInboxABI,
};

/**
 * Rollup Admin Logic contract configuration.
 * @property {Array} abi - The ABI of the Rollup Admin Logic contract.
 */
export const rollupAdminLogic = {
  abi: rollupAdminLogicABI,
};

