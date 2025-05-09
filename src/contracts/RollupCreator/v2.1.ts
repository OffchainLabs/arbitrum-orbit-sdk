//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RollupCreator
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x09De8b5E61E413F35f630798250ecE1B6ECA872A)
 * -
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x36395b4102526A51Bf730637334807fb182Bd0b6)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x351015499AC958272E3A9B6936db0968dd31741A)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0xa1bd8B5b1FbacD24888C38A09fb4fDCf28c43263)
 * - [__View Contract on Base Sepolia Blockscout__](https://base-sepolia.blockscout.com/address/0x04824235981aCAe210A9362E7bBfe77452e9cD5b)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x2Bf262F2f2187a998B87Ff5F91e418bDF38d89a4)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x57A8aBED71b14dBa84b5d400A4227Ff4B4f31EB5)
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
          { name: 'validators', internalType: 'address[]', type: 'address[]' },
          { name: 'maxDataSize', internalType: 'uint256', type: 'uint256' },
          { name: 'nativeToken', internalType: 'address', type: 'address' },
          { name: 'deployFactoriesToL2', internalType: 'bool', type: 'bool' },
          { name: 'maxFeePerGasForRetryables', internalType: 'uint256', type: 'uint256' },
          { name: 'batchPosters', internalType: 'address[]', type: 'address[]' },
          { name: 'batchPosterManager', internalType: 'address', type: 'address' },
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
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x09De8b5E61E413F35f630798250ecE1B6ECA872A)
 * -
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x36395b4102526A51Bf730637334807fb182Bd0b6)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x351015499AC958272E3A9B6936db0968dd31741A)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0xa1bd8B5b1FbacD24888C38A09fb4fDCf28c43263)
 * - [__View Contract on Base Sepolia Blockscout__](https://base-sepolia.blockscout.com/address/0x04824235981aCAe210A9362E7bBfe77452e9cD5b)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x2Bf262F2f2187a998B87Ff5F91e418bDF38d89a4)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x57A8aBED71b14dBa84b5d400A4227Ff4B4f31EB5)
 */
export const rollupCreatorAddress = {
  1: '0x09De8b5E61E413F35f630798250ecE1B6ECA872A',
  1337: '0x82A3c114b40ecF1FC34745400A1B9B9115c33d31',
  8453: '0x36395b4102526A51Bf730637334807fb182Bd0b6',
  42161: '0x351015499AC958272E3A9B6936db0968dd31741A',
  42170: '0xa1bd8B5b1FbacD24888C38A09fb4fDCf28c43263',
  84532: '0x04824235981aCAe210A9362E7bBfe77452e9cD5b',
  412346: '0x4287839696d650A0cf93b98351e85199102335D0',
  421614: '0x2Bf262F2f2187a998B87Ff5F91e418bDF38d89a4',
  11155111: '0x57A8aBED71b14dBa84b5d400A4227Ff4B4f31EB5',
} as const;

/**
 * - [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x09De8b5E61E413F35f630798250ecE1B6ECA872A)
 * -
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x36395b4102526A51Bf730637334807fb182Bd0b6)
 * - [__View Contract on Arbitrum One Arbiscan__](https://arbiscan.io/address/0x351015499AC958272E3A9B6936db0968dd31741A)
 * - [__View Contract on Arbitrum Nova Arbiscan__](https://nova.arbiscan.io/address/0xa1bd8B5b1FbacD24888C38A09fb4fDCf28c43263)
 * - [__View Contract on Base Sepolia Blockscout__](https://base-sepolia.blockscout.com/address/0x04824235981aCAe210A9362E7bBfe77452e9cD5b)
 * - [__View Contract on Arbitrum Sepolia Blockscout__](https://sepolia-explorer.arbitrum.io/address/0x2Bf262F2f2187a998B87Ff5F91e418bDF38d89a4)
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x57A8aBED71b14dBa84b5d400A4227Ff4B4f31EB5)
 */
export const rollupCreatorConfig = {
  address: rollupCreatorAddress,
  abi: rollupCreatorABI,
} as const;
