import { Abi, parseAbi } from 'viem';

import {
  erc20ABI,
  arbOwnerConfig,
  arbOwnerPublicConfig,
  rollupCreatorConfig,
  tokenBridgeCreatorConfig,
} from './generated';

export const erc20 = {
  abi: erc20ABI,
};

export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

export const arbOwnerPublic = {
  ...arbOwnerPublicConfig,
  address: Object.values(arbOwnerPublicConfig.address)[0],
} as const;

export const rollupCreator = rollupCreatorConfig;

export const upgradeExecutor = {
  abi: parseAbi([
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
  ]),
};

const tokenBridgeCreatorABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_l2MulticallTemplate',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_InvalidRouterAddr',
    type: 'error',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_L2FactoryCannotBeChanged',
    type: 'error',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_OnlyRollupOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_ProxyAdminNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_RollupOwnershipMisconfig',
    type: 'error',
  },
  {
    inputs: [],
    name: 'L1AtomicTokenBridgeCreator_TemplatesNotSet',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'inbox',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'router',
        type: 'address',
      },
    ],
    name: 'NonCanonicalRouterSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'inbox',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'router',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'standardGateway',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'customGateway',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'wethGateway',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'proxyAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'upgradeExecutor',
        type: 'address',
      },
    ],
    name: 'OrbitTokenBridgeCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'OrbitTokenBridgeTemplatesUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ARB_MULTICALL_CODE_HASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
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
    inputs: [{ internalType: 'address', name: 'inbox', type: 'address' }],
    name: 'getCanonicalL1RouterAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2BeaconProxyFactoryAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2CustomGatewayAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2Multicall',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2ProxyAdminAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2RouterAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2StandardGatewayAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2UpgradeExecutorAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2WethAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getCanonicalL2WethGatewayAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'inbox', type: 'address' }],
    name: 'getRouter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'inboxToNonCanonicalRouter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract L1TokenBridgeRetryableSender',
        name: '_retryableSender',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'l1Templates',
    outputs: [
      {
        internalType: 'contract L1GatewayRouter',
        name: 'routerTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1ERC20Gateway',
        name: 'standardGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1CustomGateway',
        name: 'customGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1WethGateway',
        name: 'wethGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1OrbitGatewayRouter',
        name: 'feeTokenBasedRouterTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1OrbitERC20Gateway',
        name: 'feeTokenBasedStandardGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'contract L1OrbitCustomGateway',
        name: 'feeTokenBasedCustomGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'contract IUpgradeExecutor',
        name: 'upgradeExecutor',
        type: 'address',
      },
    ],
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
  {
    inputs: [],
    name: 'l2CustomGatewayTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2MulticallTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2RouterTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2StandardGatewayTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2TokenBridgeFactoryTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2WethGatewayTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2WethTemplate',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'retryableSender',
    outputs: [
      {
        internalType: 'contract L1TokenBridgeRetryableSender',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'inbox', type: 'address' },
      { internalType: 'address', name: 'nonCanonicalRouter', type: 'address' },
    ],
    name: 'setNonCanonicalRouter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract L1GatewayRouter',
            name: 'routerTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1ERC20Gateway',
            name: 'standardGatewayTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1CustomGateway',
            name: 'customGatewayTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1WethGateway',
            name: 'wethGatewayTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1OrbitGatewayRouter',
            name: 'feeTokenBasedRouterTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1OrbitERC20Gateway',
            name: 'feeTokenBasedStandardGatewayTemplate',
            type: 'address',
          },
          {
            internalType: 'contract L1OrbitCustomGateway',
            name: 'feeTokenBasedCustomGatewayTemplate',
            type: 'address',
          },
          {
            internalType: 'contract IUpgradeExecutor',
            name: 'upgradeExecutor',
            type: 'address',
          },
        ],
        internalType: 'struct L1AtomicTokenBridgeCreator.L1Templates',
        name: '_l1Templates',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: '_l2TokenBridgeFactoryTemplate',
        type: 'address',
      },
      { internalType: 'address', name: '_l2RouterTemplate', type: 'address' },
      {
        internalType: 'address',
        name: '_l2StandardGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l2CustomGatewayTemplate',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l2WethGatewayTemplate',
        type: 'address',
      },
      { internalType: 'address', name: '_l2WethTemplate', type: 'address' },
      { internalType: 'address', name: '_l1Weth', type: 'address' },
      { internalType: 'address', name: '_l1Multicall', type: 'address' },
      {
        internalType: 'uint256',
        name: '_gasLimitForL2FactoryDeployment',
        type: 'uint256',
      },
    ],
    name: 'setTemplates',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const tokenBridgeCreator = {
  ...tokenBridgeCreatorConfig,
  abi: tokenBridgeCreatorABI,
} as const;
