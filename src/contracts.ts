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

export const erc20 = {
  abi: erc20ABI,
};

export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

export const arbGasInfo = {
  ...arbGasInfoConfig,
  address: Object.values(arbGasInfoConfig.address)[0],
} as const;

export const arbOwnerPublic = {
  ...arbOwnerPublicConfig,
  address: Object.values(arbOwnerPublicConfig.address)[0],
} as const;

export const arbAggregator = {
  ...arbAggregatorConfig,
  address: Object.values(arbAggregatorConfig.address)[0],
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

export const tokenBridgeCreator = {
  ...tokenBridgeCreatorConfig,
  abi: tokenBridgeCreatorABI,
} as const;

// https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/FeeRouter/ChildToParentRewardRouter.sol
export const childToParentRouterAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_parentChainTarget', type: 'address', internalType: 'address' },
      { name: '_minDistributionIntervalSeconds', type: 'uint256', internalType: 'uint256' },
      { name: '_parentChainTokenAddress', type: 'address', internalType: 'address' },
      { name: '_childChainTokenAddress', type: 'address', internalType: 'address' },
      { name: '_childChainGatewayRouter', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'NATIVE_CURRENCY',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'canDistribute',
    inputs: [{ name: '_erc20orNative', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'childChainGatewayRouter',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IChildChainGatewayRouter' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'childChainTokenAddress',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextDistributions',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'parentChainTarget',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'parentChainTokenAddress',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'routeNativeFunds',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', name: 'routeToken', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    name: 'timeToNextDistribution',
    inputs: [{ name: '_erc20orNative', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'FundsRouted',
    inputs: [
      { name: 'token', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'DistributionTooSoon',
    inputs: [
      { name: 'currentTimestamp', type: 'uint256', internalType: 'uint256' },
      { name: 'distributionTimestamp', type: 'uint256', internalType: 'uint256' },
    ],
  },
  { type: 'error', name: 'NativeOnly', inputs: [] },
  {
    type: 'error',
    name: 'NoValue',
    inputs: [{ name: 'tokenAddr', type: 'address', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'TokenDisabled',
    inputs: [{ name: 'tokenAddr', type: 'address', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'TokenNotRegisteredToGateway',
    inputs: [{ name: 'tokenAddr', type: 'address', internalType: 'address' }],
  },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
] as const;

const childToParentRouterBytecode =
  '0x6101206040818152346102525760a082610b7780380380916100218285610257565b8339810103126102525761003482610290565b60208084015193610046848201610290565b9461005f608061005860608501610290565b9301610290565b6080919091526001600160a01b0393808516156102415790849160a0528660c052169083610100968388528260e05216600181036100fb575b8686516108d291826102a583396080518281816101a20152610764015260a05182818161022d015281816104ef01526107a5015260c05182818160bb0152610651015260e051828181610101015261048d01525181818161013c015261060e0152f35b8551906314fc51a960e31b825260048201528381602481600080975af1801561023757859084906101fd575b819250169116036101e1578285511690828460c051166024875180958193635ed004ff60e11b835260048301525afa9283156101d55790849392918193610197575b505050161561017b5780808080610098565b60c05191516303f585af60e31b81529116600482015260249150fd5b919350915082813d81116101ce575b6101b08183610257565b810103126101cb57506101c38291610290565b388080610169565b80fd5b503d6101a6565b508451903d90823e3d90fd5b60c0518451632ee238ef60e21b81529084166004820152602490fd5b50508381813d8311610230575b6102148183610257565b8101031261022c57846102278192610290565b610127565b8280fd5b503d61020a565b86513d85823e3d90fd5b855163d92e233d60e01b8152600490fd5b600080fd5b601f909101601f19168101906001600160401b0382119082101761027a57604052565b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036102525756fe60806040908082526004918236101561002b575b505050361561002157600080fd5b6100296106fe565b005b600091823560e01c9081622698b61461063d57508063092e5748146105fa5780630bc6d25c146105c157806349f426501461059357806356bdaefe1461055b57806370898f781461051e578063a796efb3146104db578063af76af28146104bc578063ec46da44146104795763fbd5dfae0361001357346104755781600319360112610475576001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081811692600184146104665780516370a0823160e01b8152308782015260209390926024907f000000000000000000000000000000000000000000000000000000000000000083169086868481855afa9586156103ca578996610437575b50837f00000000000000000000000000000000000000000000000000000000000000001691855191635ed004ff60e11b8352898c84015288838681875afa92831561042d578b936103ef575b5061018e90610680565b15806103e6575b61019d578980f35b6101c77f000000000000000000000000000000000000000000000000000000000000000042610879565b898b528a8952868b2055600187018088116103d457865163095ea7b360e01b8152928616838d0152848301528790829060449082908d905af180156103ca57899289928c9261038e575b50908360a49288519788958694637b3a3c8b60e01b86528501527f00000000000000000000000000000000000000000000000000000000000000001687840152896044840152608060648401528160848401525af18015610384576102ab575b50507fb090d75dece18b4de34535e4c300e242a3126f8eb4572a306e40ba111a5d13419394955051908152a2803880808080808080808980f35b3d8088843e6102ba81846106c6565b820190858383031261038057825167ffffffffffffffff9384821161037c57019882601f8b011215610378578951938411610367575050825190610307601f8401601f19168701836106c6565b82825285838a01011161036357865b828110610350575001830185905293945084937fb090d75dece18b4de34535e4c300e242a3126f8eb4572a306e40ba111a5d134138610271565b8881018601518282018701528501610316565b8680fd5b634e487b7160e01b89526041905287fd5b8880fd5b8980fd5b8780fd5b83513d89823e3d90fd5b92509250508681813d83116103c3575b6103a881836106c6565b81010312610378575180151503610380578689899238610211565b503d61039e565b85513d8b823e3d90fd5b634e487b7160e01b8b5260118c52848bfd5b50861515610195565b9092508881813d8311610426575b61040781836106c6565b8101031261042257518581168103610422579161018e610184565b8a80fd5b503d6103fd565b87513d8d823e3d90fd5b9095508681813d831161045f575b61044f81836106c6565b8101031261037857519438610138565b503d610445565b516302dc4bf360e21b81528590fd5b5080fd5b5034610475578160031936011261047557517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b82346104d857806003193601126104d8576104d56106fe565b80f35b80fd5b5034610475578160031936011261047557517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50823461055757602036600319011261055757356001600160a01b03811690819003610557578282916020945280845220549051908152f35b8280fd5b5082346105575760203660031901126105575735916001600160a01b03831683036104d8575061058c602092610680565b9051908152f35b50346104755781600319360112610475576020905173eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee8152f35b5082346105575760203660031901126105575735916001600160a01b03831683036104d857506105f2602092610680565b159051908152f35b5034610475578160031936011261047557517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b8390346104755781600319360112610475577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b6001600160a01b03166000908152602081905260408120544281116106a3575090565b904282039182116106b2575090565b634e487b7160e01b81526011600452602490fd5b90601f8019910116810190811067ffffffffffffffff8211176106e857604052565b634e487b7160e01b600052604160045260246000fd5b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee600081815260208181527fd0d045a07f9a74a2c48a464add9b06f25f501dbdf5bd4dd5a7489f86f449adda549091479142811161085a5750805b1580610851575b61075f575b50505050565b6107897f000000000000000000000000000000000000000000000000000000000000000042610879565b848252818452604080832091909155516325e1606360e01b81527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316600482015283816024818660645af180156108465761081c575b5050907fb090d75dece18b4de34535e4c300e242a3126f8eb4572a306e40ba111a5d134191604051908152a238808080610759565b8390813d831161083f575b61083181836106c6565b810103126104d857806107e7565b503d610827565b6040513d84823e3d90fd5b50811515610754565b4281039081111561074d57634e487b7160e01b82526011600452602482fd5b9190820180921161088657565b634e487b7160e01b600052601160045260246000fdfea26469706673582212204cd8d3eacde836386e10167bcb19c46a9479f857439b9be82a383f236650af5064736f6c63430008190033';

export const childToParentRouter = {
  abi: childToParentRouterAbi,
  bytecode: childToParentRouterBytecode as `0x${string}`,
};

// https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/RewardDistributor.sol
export const rewardDistributorAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'recipients', type: 'address[]', internalType: 'address[]' },
      { name: 'weights', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'MAX_RECIPIENTS',
    inputs: [],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'PER_RECIPIENT_GAS',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentRecipientGroup',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentRecipientWeights',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'distributeAndUpdateRecipients',
    inputs: [
      { name: 'currentRecipients', type: 'address[]', internalType: 'address[]' },
      { name: 'currentWeights', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'newRecipients', type: 'address[]', internalType: 'address[]' },
      { name: 'newWeights', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'distributeRewards',
    inputs: [
      { name: 'recipients', type: 'address[]', internalType: 'address[]' },
      { name: 'weights', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'OwnerRecieved',
    inputs: [
      { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'recipient', type: 'address', indexed: true, internalType: 'address' },
      { name: 'value', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      { name: 'previousOwner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'newOwner', type: 'address', indexed: true, internalType: 'address' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RecipientRecieved',
    inputs: [
      { name: 'recipient', type: 'address', indexed: true, internalType: 'address' },
      { name: 'value', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RecipientsUpdated',
    inputs: [
      { name: 'recipientGroup', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'recipients', type: 'address[]', indexed: false, internalType: 'address[]' },
      { name: 'recipientWeights', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'weights', type: 'uint256[]', indexed: false, internalType: 'uint256[]' },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'EmptyRecipients', inputs: [] },
  { type: 'error', name: 'InputLengthMismatch', inputs: [] },
  {
    type: 'error',
    name: 'InvalidRecipientGroup',
    inputs: [
      { name: 'currentRecipientGroup', type: 'bytes32', internalType: 'bytes32' },
      { name: 'providedRecipientGroup', type: 'bytes32', internalType: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidRecipientWeights',
    inputs: [
      { name: 'currentRecipientWeights', type: 'bytes32', internalType: 'bytes32' },
      { name: 'providedRecipientWeights', type: 'bytes32', internalType: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidTotalWeight',
    inputs: [{ name: 'totalWeight', type: 'uint256', internalType: 'uint256' }],
  },
  { type: 'error', name: 'NoFundsToDistribute', inputs: [] },
  {
    type: 'error',
    name: 'OwnerFailedRecieve',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'recipient', type: 'address', internalType: 'address' },
      { name: 'value', type: 'uint256', internalType: 'uint256' },
    ],
  },
  { type: 'error', name: 'TooManyRecipients', inputs: [] },
] as const;

const rewardDistributorBytecode =
  '0x604060808152346102a257610bcd908138038061001b816102c6565b938439820181838203126102a25782516001600160401b03908181116102a25784019282601f850112156102a257835160209261005f61005a83610301565b6102c6565b9684888481520196878660059560051b830101918883116102a2578701905b8282106102a757505050848101519182116102a257019184601f840112156102a2578251946100af61005a87610301565b938585888152019086829860051b8201019283116102a25786809101915b83831061029257505060008054336001600160a01b03198216811783558551929b6001600160a01b039a90955093509089167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08c80a3825115610283575081518551036102725782825111610261578896875b8651891015610179578789871b88010151810180911161016557600190980197610140565b634e487b7160e01b8b52601160045260248bfd5b878b888c93612710810361024a57508694939291945160051b832060019481600155825160051b882091826002558a519960808b01918b526080868c01525180915260a08a01959188905b82821061023357505050508789015286830360608801525180835291810194935b82811061022057877f33bc54b3c50e54df666d4399528026a4b04671bb2a879281b5279f7352fb3e6c88880389a1516108b490816103198239f35b84518652948101949381019383016101e5565b8351811688529686019692860192908801906101c4565b602490895190635943317f60e01b82526004820152fd5b8251635531b49560e01b8152600490fd5b825163aaad13f760e01b8152600490fd5b632a67cf2360e01b8152600490fd5b82518152918101918791016100cd565b600080fd5b81516001600160a01b03811681036102a257815290870190870161007e565b6040519190601f01601f191682016001600160401b038111838210176102eb57604052565b634e487b7160e01b600052604160045260246000fd5b6001600160401b0381116102eb5760051b6020019056fe60406080815260048036101561001f575b5050361561001d57600080fd5b005b600091823560e01c8063143ba4f31461045d578063715018a61461040357806375fbe986146103e45780638da5cb5b146103bc57806391aee56e146101b8578063a6980ce21461019c578063bd8bd40e1461017d578063dc55beee1461015b5763f2fde38b1461008f5750610010565b34610157576020366003190112610157576001600160a01b03823581811693919290849003610153576100c0610826565b831561010157505082546001600160a01b0319811683178455167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08380a380f35b906020608492519162461bcd60e51b8352820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152fd5b8480fd5b8280fd5b83823461017957816003193601126101795760209051620186a08152f35b5080fd5b8382346101795781600319360112610179576020906001549051908152f35b8382346101795781600319360112610179578060209151908152f35b5082346103b95760803660031901126103b95767ffffffffffffffff908335828111610179576101eb9036908601610504565b936024946024358481116103b5576102069036908401610574565b6044358581116101535761021d9036908501610504565b9460643590811161015357906102396102479236908601610574565b92610242610826565b610630565b8351156103a6578351815103610397578484511161038857829383945b825186101561029e5761027786846105ca565b51810180911161028c57600190950194610264565b634e487b7160e01b8552601184528785fd5b928692919361271081036103725750508251906020918285019060051b81209160019280600155815160051b95858301968720918260025581519860808a01918a526080888b01525180915260a0890194908a5b818110610356575050508701528582036060870152518082529083019392865b82811061034357877f33bc54b3c50e54df666d4399528026a4b04671bb2a879281b5279f7352fb3e6c88880389a180f35b8451865294810194938101938301610312565b82516001600160a01b03168752958801959188019187016102f2565b8351635943317f60e01b81529182015260249150fd5b508351635531b49560e01b8152fd5b50835163aaad13f760e01b8152fd5b508351632a67cf2360e01b8152fd5b8380fd5b80fd5b838234610179578160031936011261017957905490516001600160a01b039091168152602090f35b8382346101795781600319360112610179576020906002549051908152f35b83346103b957806003193601126103b95761041c610826565b80546001600160a01b03198116825581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b5034610157573660031901126101795767ffffffffffffffff81358181116103b55761048c9036908401610504565b906024359081116103b5576104ad926104a791369101610574565b90610630565b80f35b6040519190601f01601f1916820167ffffffffffffffff8111838210176104d657604052565b634e487b7160e01b600052604160045260246000fd5b67ffffffffffffffff81116104d65760051b60200190565b9080601f8301121561056f576020908235610526610521826104ec565b6104b0565b9360208086848152019260051b82010192831161056f57602001905b828210610550575050505090565b81356001600160a01b038116810361056f578152908301908301610542565b600080fd5b9080601f8301121561056f576020908235610591610521826104ec565b9360208086848152019260051b82010192831161056f57602001905b8282106105bb575050505090565b813581529083019083016105ad565b80518210156105de5760209160051b010190565b634e487b7160e01b600052603260045260246000fd5b3d1561062b573d9067ffffffffffffffff82116104d65761061e601f8301601f19166020016104b0565b9182523d6000602084013e565b606090565b9081511561081457815181510361080257815160209060051b602084012092600193600154908181036107e4575050825160051b6020840120600254908181036107c6575050612710470480156107b4576000959493845b610696575b50505050509050565b82518710156107af576106a987826105ca565b5182026001600160a01b03600080808085856106c58f8c6105ca565b5116620186a0f16106d46105f4565b50156107205797869798917f8b2a2b28e169eb0e4f62578e9d12f747d7bd0fe1ebc935af28387c18034d7cc087899461070d858a6105ca565b511692604051908152a25b019695610688565b806000541690600080808086865af16107376105f4565b5015610780579189917ff3b03d863408466d72337e3dd8e40d5b9a37c5ef4c274f40dd3542d87697ab7e888a9b9c956107718c978b6105ca565b511693604051908152a3610718565b9160649261078e8b886105ca565b511660405192630599c73f60e51b8452600484015260248301526044820152fd5b61068d565b6040516318f5992f60e21b8152600490fd5b604492506040519163505c311b60e01b835260048301526024820152fd5b6044925060405191632cf5faaf60e01b835260048301526024820152fd5b60405163aaad13f760e01b8152600490fd5b604051632a67cf2360e01b8152600490fd5b6000546001600160a01b0316330361083a57565b606460405162461bcd60e51b815260206004820152602060248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152fdfea26469706673582212203e1f83875d010fa0a89af724fd3b8a7bbcfc4f4cfacd6f7ea7c473e3f673eb2764736f6c63430008190033';

export const rewardDistributor = {
  abi: rewardDistributorAbi,
  bytecode: rewardDistributorBytecode as `0x${string}`,
};
