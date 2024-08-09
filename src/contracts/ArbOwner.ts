//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbOwner
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'method', internalType: 'bytes4', type: 'bytes4', indexed: true },
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'OwnerActs',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'addChainOwner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getAllChainOwners',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getInfraFeeAccount',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getNetworkFeeAccount',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'addr', internalType: 'address', type: 'address' }],
    name: 'isChainOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'maxWeiToRelease', internalType: 'uint256', type: 'uint256' }],
    name: 'releaseL1PricerSurplusFunds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'ownerToRemove', internalType: 'address', type: 'address' }],
    name: 'removeChainOwner',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newVersion', internalType: 'uint64', type: 'uint64' },
      { name: 'timestamp', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'scheduleArbOSUpgrade',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'cap', internalType: 'uint64', type: 'uint64' }],
    name: 'setAmortizedCostCapBips',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'level', internalType: 'uint64', type: 'uint64' }],
    name: 'setBrotliCompressionLevel',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'chainConfig', internalType: 'string', type: 'string' }],
    name: 'setChainConfig',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newInfraFeeAccount', internalType: 'address', type: 'address' }],
    name: 'setInfraFeeAccount',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'inertia', internalType: 'uint64', type: 'uint64' }],
    name: 'setL1BaseFeeEstimateInertia',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'pricePerUnit', internalType: 'uint256', type: 'uint256' }],
    name: 'setL1PricePerUnit',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'equilibrationUnits', internalType: 'uint256', type: 'uint256' }],
    name: 'setL1PricingEquilibrationUnits',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'inertia', internalType: 'uint64', type: 'uint64' }],
    name: 'setL1PricingInertia',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'weiPerUnit', internalType: 'uint64', type: 'uint64' }],
    name: 'setL1PricingRewardRate',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'setL1PricingRewardRecipient',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'priceInWei', internalType: 'uint256', type: 'uint256' }],
    name: 'setL2BaseFee',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'sec', internalType: 'uint64', type: 'uint64' }],
    name: 'setL2GasBacklogTolerance',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'sec', internalType: 'uint64', type: 'uint64' }],
    name: 'setL2GasPricingInertia',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'limit', internalType: 'uint64', type: 'uint64' }],
    name: 'setMaxTxGasLimit',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'priceInWei', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinimumL2BaseFee',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newNetworkFeeAccount', internalType: 'address', type: 'address' }],
    name: 'setNetworkFeeAccount',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'cost', internalType: 'int64', type: 'int64' }],
    name: 'setPerBatchGasCharge',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'limit', internalType: 'uint64', type: 'uint64' }],
    name: 'setSpeedLimit',
    outputs: [],
  },
] as const;

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerAddress = '0x0000000000000000000000000000000000000070';

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerConfig = { address: arbOwnerAddress, abi: arbOwnerABI } as const;
