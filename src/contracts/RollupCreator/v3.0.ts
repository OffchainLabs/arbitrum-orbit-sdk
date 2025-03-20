export const rollupCreatorABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'rollupAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'nativeToken', type: 'address' },
      { indexed: false, internalType: 'address', name: 'inboxAddress', type: 'address' },
      { indexed: false, internalType: 'address', name: 'outbox', type: 'address' },
      { indexed: false, internalType: 'address', name: 'rollupEventInbox', type: 'address' },
      { indexed: false, internalType: 'address', name: 'challengeManager', type: 'address' },
      { indexed: false, internalType: 'address', name: 'adminProxy', type: 'address' },
      { indexed: false, internalType: 'address', name: 'sequencerInbox', type: 'address' },
      { indexed: false, internalType: 'address', name: 'bridge', type: 'address' },
      { indexed: false, internalType: 'address', name: 'upgradeExecutor', type: 'address' },
      { indexed: false, internalType: 'address', name: 'validatorWalletCreator', type: 'address' },
    ],
    name: 'RollupCreated',
    type: 'event',
  },
  { anonymous: false, inputs: [], name: 'TemplatesUpdated', type: 'event' },
  {
    inputs: [],
    name: 'bridgeCreator',
    outputs: [{ internalType: 'contract BridgeCreator', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'challengeManagerTemplate',
    outputs: [{ internalType: 'contract IEdgeChallengeManager', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'uint64', name: 'confirmPeriodBlocks', type: 'uint64' },
              { internalType: 'address', name: 'stakeToken', type: 'address' },
              { internalType: 'uint256', name: 'baseStake', type: 'uint256' },
              { internalType: 'bytes32', name: 'wasmModuleRoot', type: 'bytes32' },
              { internalType: 'address', name: 'owner', type: 'address' },
              { internalType: 'address', name: 'loserStakeEscrow', type: 'address' },
              { internalType: 'uint256', name: 'chainId', type: 'uint256' },
              { internalType: 'string', name: 'chainConfig', type: 'string' },
              { internalType: 'uint256', name: 'minimumAssertionPeriod', type: 'uint256' },
              { internalType: 'uint64', name: 'validatorAfkBlocks', type: 'uint64' },
              { internalType: 'uint256[]', name: 'miniStakeValues', type: 'uint256[]' },
              {
                components: [
                  { internalType: 'uint256', name: 'delayBlocks', type: 'uint256' },
                  { internalType: 'uint256', name: 'futureBlocks', type: 'uint256' },
                  { internalType: 'uint256', name: 'delaySeconds', type: 'uint256' },
                  { internalType: 'uint256', name: 'futureSeconds', type: 'uint256' },
                ],
                internalType: 'struct ISequencerInbox.MaxTimeVariation',
                name: 'sequencerInboxMaxTimeVariation',
                type: 'tuple',
              },
              { internalType: 'uint256', name: 'layerZeroBlockEdgeHeight', type: 'uint256' },
              { internalType: 'uint256', name: 'layerZeroBigStepEdgeHeight', type: 'uint256' },
              { internalType: 'uint256', name: 'layerZeroSmallStepEdgeHeight', type: 'uint256' },
              {
                components: [
                  {
                    components: [
                      { internalType: 'bytes32[2]', name: 'bytes32Vals', type: 'bytes32[2]' },
                      { internalType: 'uint64[2]', name: 'u64Vals', type: 'uint64[2]' },
                    ],
                    internalType: 'struct GlobalState',
                    name: 'globalState',
                    type: 'tuple',
                  },
                  { internalType: 'enum MachineStatus', name: 'machineStatus', type: 'uint8' },
                  { internalType: 'bytes32', name: 'endHistoryRoot', type: 'bytes32' },
                ],
                internalType: 'struct AssertionState',
                name: 'genesisAssertionState',
                type: 'tuple',
              },
              { internalType: 'uint256', name: 'genesisInboxCount', type: 'uint256' },
              { internalType: 'address', name: 'anyTrustFastConfirmer', type: 'address' },
              { internalType: 'uint8', name: 'numBigStepLevel', type: 'uint8' },
              { internalType: 'uint64', name: 'challengeGracePeriodBlocks', type: 'uint64' },
              {
                components: [
                  { internalType: 'uint64', name: 'threshold', type: 'uint64' },
                  { internalType: 'uint64', name: 'max', type: 'uint64' },
                  { internalType: 'uint64', name: 'replenishRateInBasis', type: 'uint64' },
                ],
                internalType: 'struct BufferConfig',
                name: 'bufferConfig',
                type: 'tuple',
              },
            ],
            internalType: 'struct Config',
            name: 'config',
            type: 'tuple',
          },
          { internalType: 'address[]', name: 'validators', type: 'address[]' },
          { internalType: 'uint256', name: 'maxDataSize', type: 'uint256' },
          { internalType: 'address', name: 'nativeToken', type: 'address' },
          { internalType: 'bool', name: 'deployFactoriesToL2', type: 'bool' },
          { internalType: 'uint256', name: 'maxFeePerGasForRetryables', type: 'uint256' },
          { internalType: 'address[]', name: 'batchPosters', type: 'address[]' },
          { internalType: 'address', name: 'batchPosterManager', type: 'address' },
        ],
        internalType: 'struct RollupCreator.RollupDeploymentParams',
        name: 'deployParams',
        type: 'tuple',
      },
    ],
    name: 'createRollup',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2FactoriesDeployer',
    outputs: [{ internalType: 'contract DeployHelper', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'osp',
    outputs: [{ internalType: 'contract IOneStepProofEntry', name: '', type: 'address' }],
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
    name: 'rollupAdminLogic',
    outputs: [{ internalType: 'contract IRollupAdmin', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rollupUserLogic',
    outputs: [{ internalType: 'contract IRollupUser', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract BridgeCreator', name: '_bridgeCreator', type: 'address' },
      { internalType: 'contract IOneStepProofEntry', name: '_osp', type: 'address' },
      {
        internalType: 'contract IEdgeChallengeManager',
        name: '_challengeManagerLogic',
        type: 'address',
      },
      { internalType: 'contract IRollupAdmin', name: '_rollupAdminLogic', type: 'address' },
      { internalType: 'contract IRollupUser', name: '_rollupUserLogic', type: 'address' },
      { internalType: 'contract IUpgradeExecutor', name: '_upgradeExecutorLogic', type: 'address' },
      { internalType: 'address', name: '_validatorWalletCreator', type: 'address' },
      { internalType: 'contract DeployHelper', name: '_l2FactoriesDeployer', type: 'address' },
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
  {
    inputs: [],
    name: 'upgradeExecutorLogic',
    outputs: [{ internalType: 'contract IUpgradeExecutor', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'validatorWalletCreator',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const;
