//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbGasInfo
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006c)
 */
export const arbGasInfoABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_chainId', internalType: 'uint256', type: 'uint256' },
      { name: '_owners', internalType: 'address[]', type: 'address[]' },
      { name: '_signaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'to', internalType: 'address', type: 'address', indexed: true }],
    name: 'CloseStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'balance', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address payable', type: 'address', indexed: false },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'nonce', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'hash', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'result', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'ExecuteTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'frequency', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'OpenStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'added', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'Owner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'chainId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'closeStream',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'executeTransaction',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'getTransactionHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'openStream',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: '_hash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'recover',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'oldSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'removeSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'signaturesRequired',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'streamBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'streamWithdraw',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'streams',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
      { name: 'last', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' }],
    name: 'updateSignaturesRequired',
    outputs: [],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006c)
 */
export const arbGasInfoAddress = {
  11155111: '0x000000000000000000000000000000000000006C',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006c)
 */
export const arbGasInfoConfig = { address: arbGasInfoAddress, abi: arbGasInfoABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbOwner
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_chainId', internalType: 'uint256', type: 'uint256' },
      { name: '_owners', internalType: 'address[]', type: 'address[]' },
      { name: '_signaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'to', internalType: 'address', type: 'address', indexed: true }],
    name: 'CloseStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'balance', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address payable', type: 'address', indexed: false },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'nonce', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'hash', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'result', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'ExecuteTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'frequency', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'OpenStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'added', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'Owner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'chainId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'closeStream',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'executeTransaction',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'getTransactionHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'openStream',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: '_hash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'recover',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'oldSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'removeSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'signaturesRequired',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'streamBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'streamWithdraw',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'streams',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
      { name: 'last', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' }],
    name: 'updateSignaturesRequired',
    outputs: [],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerAddress = {
  11155111: '0x0000000000000000000000000000000000000070',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000070)
 */
export const arbOwnerConfig = { address: arbOwnerAddress, abi: arbOwnerABI } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ArbOwnerPublic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_chainId', internalType: 'uint256', type: 'uint256' },
      { name: '_owners', internalType: 'address[]', type: 'address[]' },
      { name: '_signaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'to', internalType: 'address', type: 'address', indexed: true }],
    name: 'CloseStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'balance', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address payable', type: 'address', indexed: false },
      { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      { name: 'nonce', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'hash', internalType: 'bytes32', type: 'bytes32', indexed: false },
      { name: 'result', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'ExecuteTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'frequency', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'OpenStream',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address', indexed: true },
      { name: 'added', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'Owner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'reason', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'newSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'chainId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'closeStream',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'executeTransaction',
    outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'getTransactionHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isOwner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'openStream',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: '_hash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'recover',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'oldSigner', internalType: 'address', type: 'address' },
      { name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'removeSigner',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'signaturesRequired',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'streamBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'streamWithdraw',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'streams',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'frequency', internalType: 'uint256', type: 'uint256' },
      { name: 'last', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newSignaturesRequired', internalType: 'uint256', type: 'uint256' }],
    name: 'updateSignaturesRequired',
    outputs: [],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicAddress = {
  11155111: '0x000000000000000000000000000000000000006b',
} as const;

/**
 * [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x000000000000000000000000000000000000006b)
 */
export const arbOwnerPublicConfig = {
  address: arbOwnerPublicAddress,
  abi: arbOwnerPublicABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20ABI = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ type: 'bool' }],
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RollupCreator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x90d68b056c411015eae3ec0b98ad94e2c91419f1)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x06E341073b2749e0Bb9912461351f716DeCDa9b0)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xfbd0b034e6305788007f6e0123cc5eae701a5751)
 */
export const rollupCreatorABI = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'rollupAddress', internalType: 'address', type: 'address', indexed: true },
      { name: 'nativeToken', internalType: 'address', type: 'address', indexed: true },
      { name: 'inboxAddress', internalType: 'address', type: 'address', indexed: false },
      { name: 'outbox', internalType: 'address', type: 'address', indexed: false },
      { name: 'rollupEventInbox', internalType: 'address', type: 'address', indexed: false },
      { name: 'challengeManager', internalType: 'address', type: 'address', indexed: false },
      { name: 'adminProxy', internalType: 'address', type: 'address', indexed: false },
      { name: 'sequencerInbox', internalType: 'address', type: 'address', indexed: false },
      { name: 'bridge', internalType: 'address', type: 'address', indexed: false },
      { name: 'upgradeExecutor', internalType: 'address', type: 'address', indexed: false },
      { name: 'validatorUtils', internalType: 'address', type: 'address', indexed: false },
      { name: 'validatorWalletCreator', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'RollupCreated',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'TemplatesUpdated' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'bridgeCreator',
    outputs: [{ name: '', internalType: 'contract BridgeCreator', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'challengeManagerTemplate',
    outputs: [{ name: '', internalType: 'contract IChallengeManager', type: 'address' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      {
        name: 'deployParams',
        internalType: 'struct RollupCreator.RollupDeploymentParams',
        type: 'tuple',
        components: [
          {
            name: 'config',
            internalType: 'struct Config',
            type: 'tuple',
            components: [
              { name: 'confirmPeriodBlocks', internalType: 'uint64', type: 'uint64' },
              { name: 'extraChallengeTimeBlocks', internalType: 'uint64', type: 'uint64' },
              { name: 'stakeToken', internalType: 'address', type: 'address' },
              { name: 'baseStake', internalType: 'uint256', type: 'uint256' },
              { name: 'wasmModuleRoot', internalType: 'bytes32', type: 'bytes32' },
              { name: 'owner', internalType: 'address', type: 'address' },
              { name: 'loserStakeEscrow', internalType: 'address', type: 'address' },
              { name: 'chainId', internalType: 'uint256', type: 'uint256' },
              { name: 'chainConfig', internalType: 'string', type: 'string' },
              { name: 'genesisBlockNum', internalType: 'uint64', type: 'uint64' },
              {
                name: 'sequencerInboxMaxTimeVariation',
                internalType: 'struct ISequencerInbox.MaxTimeVariation',
                type: 'tuple',
                components: [
                  { name: 'delayBlocks', internalType: 'uint256', type: 'uint256' },
                  { name: 'futureBlocks', internalType: 'uint256', type: 'uint256' },
                  { name: 'delaySeconds', internalType: 'uint256', type: 'uint256' },
                  { name: 'futureSeconds', internalType: 'uint256', type: 'uint256' },
                ],
              },
            ],
          },
          { name: 'batchPoster', internalType: 'address', type: 'address' },
          { name: 'validators', internalType: 'address[]', type: 'address[]' },
          { name: 'maxDataSize', internalType: 'uint256', type: 'uint256' },
          { name: 'nativeToken', internalType: 'address', type: 'address' },
          { name: 'deployFactoriesToL2', internalType: 'bool', type: 'bool' },
          { name: 'maxFeePerGasForRetryables', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'createRollup',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'l2FactoriesDeployer',
    outputs: [{ name: '', internalType: 'contract DeployHelper', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'osp',
    outputs: [{ name: '', internalType: 'contract IOneStepProofEntry', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'rollupAdminLogic',
    outputs: [{ name: '', internalType: 'contract IRollupAdmin', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'rollupUserLogic',
    outputs: [{ name: '', internalType: 'contract IRollupUser', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_bridgeCreator', internalType: 'contract BridgeCreator', type: 'address' },
      { name: '_osp', internalType: 'contract IOneStepProofEntry', type: 'address' },
      {
        name: '_challengeManagerLogic',
        internalType: 'contract IChallengeManager',
        type: 'address',
      },
      { name: '_rollupAdminLogic', internalType: 'contract IRollupAdmin', type: 'address' },
      { name: '_rollupUserLogic', internalType: 'contract IRollupUser', type: 'address' },
      { name: '_upgradeExecutorLogic', internalType: 'contract IUpgradeExecutor', type: 'address' },
      { name: '_validatorUtils', internalType: 'address', type: 'address' },
      { name: '_validatorWalletCreator', internalType: 'address', type: 'address' },
      { name: '_l2FactoriesDeployer', internalType: 'contract DeployHelper', type: 'address' },
    ],
    name: 'setTemplates',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'upgradeExecutorLogic',
    outputs: [{ name: '', internalType: 'contract IUpgradeExecutor', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'validatorUtils',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'validatorWalletCreator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x90d68b056c411015eae3ec0b98ad94e2c91419f1)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x06E341073b2749e0Bb9912461351f716DeCDa9b0)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xfbd0b034e6305788007f6e0123cc5eae701a5751)
 */
export const rollupCreatorAddress = {
  1: '0x90D68B056c411015eaE3EC0b98AD94E2C91419F1',
  1337: '0x596eAbE0291D4cdAfAC7ef53D16C92Bf6922b5e0',
  17000: '0xB512078282F462Ba104231ad856464Ceb0a7747e',
  42161: '0x9CAd81628aB7D8e239F1A5B497313341578c5F71',
  42170: '0x9CAd81628aB7D8e239F1A5B497313341578c5F71',
  333333: '0x0000000000000000000000000000000000000000',
  412346: '0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651',
  421614: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
  11155111: '0xfBD0B034e6305788007f6e0123cc5EaE701a5751',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x90d68b056c411015eae3ec0b98ad94e2c91419f1)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x9CAd81628aB7D8e239F1A5B497313341578c5F71)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x06E341073b2749e0Bb9912461351f716DeCDa9b0)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0xfbd0b034e6305788007f6e0123cc5eae701a5751)
 */
export const rollupCreatorConfig = {
  address: rollupCreatorAddress,
  abi: rollupCreatorABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SequencerInbox
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x31da64d19cd31a19cd09f4070366fe2144792cf7)
 * -
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x02ee6e3f7dd2a02eb608d47f9dcebfe209ac61fc)
 */
export const sequencerInboxABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      { name: '_maxDataSize', internalType: 'uint256', type: 'uint256' },
      { name: 'reader4844_', internalType: 'contract IReader4844', type: 'address' },
      { name: '_isUsingFeeToken', internalType: 'bool', type: 'bool' },
    ],
  },
  { type: 'error', inputs: [], name: 'AlreadyInit' },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'AlreadyValidDASKeyset',
  },
  { type: 'error', inputs: [], name: 'BadMaxTimeVariation' },
  { type: 'error', inputs: [], name: 'BadPostUpgradeInit' },
  {
    type: 'error',
    inputs: [
      { name: 'stored', internalType: 'uint256', type: 'uint256' },
      { name: 'received', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BadSequencerNumber',
  },
  { type: 'error', inputs: [], name: 'DataBlobsNotSupported' },
  {
    type: 'error',
    inputs: [
      { name: 'dataLength', internalType: 'uint256', type: 'uint256' },
      { name: 'maxDataLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DataTooLarge',
  },
  { type: 'error', inputs: [], name: 'DelayedBackwards' },
  { type: 'error', inputs: [], name: 'DelayedTooFar' },
  { type: 'error', inputs: [], name: 'Deprecated' },
  { type: 'error', inputs: [], name: 'ForceIncludeBlockTooSoon' },
  { type: 'error', inputs: [], name: 'ForceIncludeTimeTooSoon' },
  { type: 'error', inputs: [], name: 'HadZeroInit' },
  { type: 'error', inputs: [], name: 'IncorrectMessagePreimage' },
  {
    type: 'error',
    inputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    name: 'InitParamZero',
  },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
    name: 'InvalidHeaderFlag',
  },
  { type: 'error', inputs: [], name: 'MissingDataHashes' },
  { type: 'error', inputs: [], name: 'NativeTokenMismatch' },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'NoSuchKeyset',
  },
  { type: 'error', inputs: [], name: 'NotBatchPoster' },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'NotBatchPosterManager',
  },
  { type: 'error', inputs: [], name: 'NotForked' },
  { type: 'error', inputs: [], name: 'NotOrigin' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'NotOwner',
  },
  { type: 'error', inputs: [], name: 'RollupNotChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'messageNum', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'InboxMessageDelivered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'messageNum', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'InboxMessageDeliveredFromOrigin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'keysetHash', internalType: 'bytes32', type: 'bytes32', indexed: true }],
    name: 'InvalidateKeyset',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'id', internalType: 'uint256', type: 'uint256', indexed: true }],
    name: 'OwnerFunctionCalled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'batchSequenceNumber', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'SequencerBatchData',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'batchSequenceNumber', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'beforeAcc', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'afterAcc', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'delayedAcc', internalType: 'bytes32', type: 'bytes32', indexed: false },
      {
        name: 'afterDelayedMessagesRead',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timeBounds',
        internalType: 'struct IBridge.TimeBounds',
        type: 'tuple',
        components: [
          { name: 'minTimestamp', internalType: 'uint64', type: 'uint64' },
          { name: 'maxTimestamp', internalType: 'uint64', type: 'uint64' },
          { name: 'minBlockNumber', internalType: 'uint64', type: 'uint64' },
          { name: 'maxBlockNumber', internalType: 'uint64', type: 'uint64' },
        ],
        indexed: false,
      },
      {
        name: 'dataLocation',
        internalType: 'enum IBridge.BatchDataLocation',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'SequencerBatchDelivered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'keysetHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'keysetBytes', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'SetValidKeyset',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'BROTLI_MESSAGE_HEADER_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DAS_MESSAGE_HEADER_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DATA_AUTHENTICATED_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'DATA_BLOB_HEADER_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'HEADER_LENGTH',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'TREE_DAS_MESSAGE_HEADER_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'ZERO_HEAVY_MESSAGE_HEADER_FLAG',
    outputs: [{ name: '', internalType: 'bytes1', type: 'bytes1' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sequenceNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'afterDelayedMessagesRead', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefunder', internalType: 'contract IGasRefunder', type: 'address' },
      { name: 'prevMessageCount', internalType: 'uint256', type: 'uint256' },
      { name: 'newMessageCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSequencerL2Batch',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sequenceNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'afterDelayedMessagesRead', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefunder', internalType: 'contract IGasRefunder', type: 'address' },
      { name: 'prevMessageCount', internalType: 'uint256', type: 'uint256' },
      { name: 'newMessageCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSequencerL2BatchFromBlobs',
    outputs: [],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'contract IGasRefunder', type: 'address' },
    ],
    name: 'addSequencerL2BatchFromOrigin',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sequenceNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'afterDelayedMessagesRead', internalType: 'uint256', type: 'uint256' },
      { name: 'gasRefunder', internalType: 'contract IGasRefunder', type: 'address' },
      { name: 'prevMessageCount', internalType: 'uint256', type: 'uint256' },
      { name: 'newMessageCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addSequencerL2BatchFromOrigin',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'batchCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'batchPosterManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'bridge',
    outputs: [{ name: '', internalType: 'contract IBridge', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'dasKeySetInfo',
    outputs: [
      { name: 'isValidKeyset', internalType: 'bool', type: 'bool' },
      { name: 'creationBlock', internalType: 'uint64', type: 'uint64' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_totalDelayedMessagesRead', internalType: 'uint256', type: 'uint256' },
      { name: 'kind', internalType: 'uint8', type: 'uint8' },
      { name: 'l1BlockAndTime', internalType: 'uint64[2]', type: 'uint64[2]' },
      { name: 'baseFeeL1', internalType: 'uint256', type: 'uint256' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'messageDataHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'forceInclusion',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'ksHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getKeysetCreationBlock',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'inboxAccs',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'bridge_', internalType: 'contract IBridge', type: 'address' },
      {
        name: 'maxTimeVariation_',
        internalType: 'struct ISequencerInbox.MaxTimeVariation',
        type: 'tuple',
        components: [
          { name: 'delayBlocks', internalType: 'uint256', type: 'uint256' },
          { name: 'futureBlocks', internalType: 'uint256', type: 'uint256' },
          { name: 'delaySeconds', internalType: 'uint256', type: 'uint256' },
          { name: 'futureSeconds', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'ksHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'invalidateKeysetHash',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isBatchPoster',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isSequencer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'isUsingFeeToken',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'ksHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isValidKeysetHash',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'maxDataSize',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'maxTimeVariation',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'postUpgradeInit',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'reader4844',
    outputs: [{ name: '', internalType: 'contract IReader4844', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'removeDelayAfterFork',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'rollup',
    outputs: [{ name: '', internalType: 'contract IOwnable', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newBatchPosterManager', internalType: 'address', type: 'address' }],
    name: 'setBatchPosterManager',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'addr', internalType: 'address', type: 'address' },
      { name: 'isBatchPoster_', internalType: 'bool', type: 'bool' },
    ],
    name: 'setIsBatchPoster',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'addr', internalType: 'address', type: 'address' },
      { name: 'isSequencer_', internalType: 'bool', type: 'bool' },
    ],
    name: 'setIsSequencer',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: 'maxTimeVariation_',
        internalType: 'struct ISequencerInbox.MaxTimeVariation',
        type: 'tuple',
        components: [
          { name: 'delayBlocks', internalType: 'uint256', type: 'uint256' },
          { name: 'futureBlocks', internalType: 'uint256', type: 'uint256' },
          { name: 'delaySeconds', internalType: 'uint256', type: 'uint256' },
          { name: 'futureSeconds', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'setMaxTimeVariation',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'keysetBytes', internalType: 'bytes', type: 'bytes' }],
    name: 'setValidKeyset',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalDelayedMessagesRead',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'updateRollupAddress',
    outputs: [],
  },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x31da64d19cd31a19cd09f4070366fe2144792cf7)
 * -
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x02ee6e3f7dd2a02eb608d47f9dcebfe209ac61fc)
 */
export const sequencerInboxAddress = {
  1: '0x31DA64D19Cd31A19CD09F4070366Fe2144792cf7',
  1337: '0x0000000000000000000000000000000000000000',
  333333: '0x0000000000000000000000000000000000000000',
  412346: '0x0000000000000000000000000000000000000000',
  11155111: '0x02EE6e3F7DD2a02EB608D47f9DceBfe209AC61FC',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x31da64d19cd31a19cd09f4070366fe2144792cf7)
 * -
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x02ee6e3f7dd2a02eb608d47f9dcebfe209ac61fc)
 */
export const sequencerInboxConfig = {
  address: sequencerInboxAddress,
  abi: sequencerInboxABI,
} as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenBridgeCreator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570)
 */
export const tokenBridgeCreatorABI = [
  {
    stateMutability: 'payable',
    type: 'constructor',
    inputs: [
      { name: '_logic', internalType: 'address', type: 'address' },
      { name: 'admin_', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousAdmin', internalType: 'address', type: 'address', indexed: false },
      { name: 'newAdmin', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address', indexed: true }],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address', indexed: true }],
    name: 'Upgraded',
  },
  { stateMutability: 'payable', type: 'fallback' },
  { stateMutability: 'payable', type: 'receive' },
] as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570)
 */
export const tokenBridgeCreatorAddress = {
  1: '0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660',
  1337: '0x54B4D4e578E10178a6cA602bdb6df0F213296Af4',
  17000: '0xac890ED9bC2494C053cE701F138958df95966d94',
  42161: '0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e',
  42170: '0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14',
  333333: '0x0000000000000000000000000000000000000000',
  412346: '0x38F35Af53bF913c439eaB06A367e09D6eb253492',
  421614: '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E',
  11155111: '0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660)
 * -
 * -
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570)
 */
export const tokenBridgeCreatorConfig = {
  address: tokenBridgeCreatorAddress,
  abi: tokenBridgeCreatorABI,
} as const;
