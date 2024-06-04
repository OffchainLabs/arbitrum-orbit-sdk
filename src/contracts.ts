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

/** erc20 is an object representing an ERC20 token with its ABI defined. */
export const erc20 = {
  abi: erc20ABI,
};

/**
 * arbOwner represents the configuration for the arbOwner contract on the
 * Arbitrum blockchain. It includes the address of the arbOwner contract.
 */
export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

/** arbGasInfo provides information about gas usage in the Arbitrum network. */
export const arbGasInfo = {
  ...arbGasInfoConfig,
  address: Object.values(arbGasInfoConfig.address)[0],
} as const;

/** arbOwnerPublic returns a {@link arbOwnerPublicConfig}. */
export const arbOwnerPublic = {
  ...arbOwnerPublicConfig,
  address: Object.values(arbOwnerPublicConfig.address)[0],
} as const;

/** arbAggregator returns a {@link ArbAggregator}. */
export const arbAggregator = {
  ...arbAggregatorConfig,
  address: Object.values(arbAggregatorConfig.address)[0],
} as const;

/** rollupCreator returns a {@link rollupCreatorConfig}. */
export const rollupCreator = rollupCreatorConfig;

/**
 * upgradeExecutor provides functions for executing upgrades, checking roles,
 * and granting/revoke roles. It returns a {@link Foo}.
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
        ],
        indexed: false,
        internalType: 'struct L1DeploymentAddresses',
        name: 'l1',
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
 * tokenBridgeCreator creates a token bridge between two networks and deploys
 * necessary contracts.
 */
export const tokenBridgeCreator = {
  ...tokenBridgeCreatorConfig,
  abi: tokenBridgeCreatorABI,
} as const;

/**
 * sequencerInbox returns an {@link abi} for interacting with the sequencer
 * inbox.
 */
export const sequencerInbox = {
  abi: sequencerInboxABI,
};

/**
 * rollupAdminLogic provides the ABI for interacting with the Rollup Admin Logic
 * contract.
 */
export const rollupAdminLogic = {
  abi: rollupAdminLogicABI,
};
