//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbOwnerPublic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'rectifiedOwner', internalType: 'address', type: 'address', indexed: false }],
    name: 'ChainOwnerRectified',
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
    name: 'getBrotliCompressionLevel',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
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
    inputs: [],
    name: 'getScheduledUpgrade',
    outputs: [
      { name: 'arbosVersion', internalType: 'uint64', type: 'uint64' },
      { name: 'scheduledForTimestamp', internalType: 'uint64', type: 'uint64' },
    ],
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
    inputs: [{ name: 'ownerToRectify', internalType: 'address', type: 'address' }],
    name: 'rectifyChainOwner',
    outputs: [],
  },
] as const;

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicAddress = '0x000000000000000000000000000000000000006b';

/**
 * [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicConfig = {
  address: arbOwnerPublicAddress,
  abi: arbOwnerPublicABI,
} as const;
