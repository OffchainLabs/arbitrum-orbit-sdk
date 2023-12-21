// Note: The abi types from the RollupCore__factory and the ArbySys__factory classes in the SDK are not compatible with viem.
//  This types is a generic Abi type to solve that issue
export type AbiItem = {
  inputs: { internalType: string; name: string; type: string }[];
  name: string;
  outputs: { internalType: string; name: string; type: string }[];
  stateMutability: string;
  type: string;
};
export type Abi = AbiItem[];

export type AbiEventItem = {
  inputs: { indexed: boolean; internalType: string; name: string; type: string }[];
  name: string;
  type: 'event';
};
export type AbiEvent = AbiEventItem[];

export type RollupCreatorInputChainConfigParameters = {
  chainId: bigint;
  homesteadBlock: bigint;
  daoForkBlock: bigint;
  daoForkSupport: boolean;
  eip150Block: bigint;
  eip150Hash: `0x${string}`;
  eip155Block: bigint;
  eip158Block: bigint;
  byzantiumBlock: bigint;
  constantinopleBlock: bigint;
  petersburgBlock: bigint;
  istanbulBlock: bigint;
  muirGlacierBlock: bigint;
  berlinBlock: bigint;
  londonBlock: bigint;
  clique: {
    period: bigint;
    epoch: bigint;
  };
  arbitrum: {
    EnableArbOS: boolean;
    AllowDebugPrecompiles: boolean;
    DataAvailabilityCommittee: boolean;
    InitialArbOSVersion: bigint;
    InitialChainOwner: `0x${string}`;
    GenesisBlockNum: bigint;
  };
};

export type RollupCreatorInputParameters = {
  config: {
    confirmPeriodBlocks: bigint;
    extraChallengeTimeBlocks: bigint;
    stakeToken: `0x${string}`;
    baseStake: bigint;
    wasmModuleRoot: `0x${string}`;
    owner: `0x${string}`;
    loserStakeEscrow: `0x${string}`;
    chainId: bigint;
    chainConfig: string;
    genesisBlockNum: bigint;
    sequencerInboxMaxTimeVariation: {
      delayBlocks: bigint;
      futureBlocks: bigint;
      delaySeconds: bigint;
      futureSeconds: bigint;
    };
  };
  batchPoster: `0x${string}`;
  validators: `0x${string}`[];
  maxDataSize: bigint;
  nativeToken: `0x${string}`;
  deployFactoriesToL2: boolean;
  maxFeePerGasForRetryables: bigint;
};

export type RollupCreatedEventAddresses = {
  rollupAddress: `0x${string}`;
  nativeToken?: `0x${string}`;
  inboxAddress: `0x${string}`;
  outbox: `0x${string}`;
  rollupEventInbox: `0x${string}`;
  challengeManager: `0x${string}`;
  adminProxy: `0x${string}`;
  sequencerInbox: `0x${string}`;
  bridge: `0x${string}`;
  upgradeExecutor: `0x${string}`;
  validatorUtils: `0x${string}`;
  validatorWalletCreator: `0x${string}`;
};

export type RollupCreatedInputParameters = {
  DataAvailabilityCommittee: boolean;
};

// TODO: Change the name of this, as it not only uses info from the event
export type RollupInformationFromRollupCreatedEvent = {
  rollupCreatorAddress: `0x${string}`;
  rollupAddresses?: RollupCreatedEventAddresses;
  rollupParameters?: RollupCreatorInputParameters;
  rollupChainConfig?: RollupCreatorInputChainConfigParameters;
};

export type TokenBridgeCanonicalAddresses = {
  router: `0x${string}`;
  standardGateway: `0x${string}`;
  customGateway: `0x${string}`;
  wethGateway: `0x${string}`;
  weth: `0x${string}`;
  upgradeExecutor: `0x${string}`;
  multicall: `0x${string}`;
  proxyAdmin: `0x${string}`;
  beaconProxyFactory: `0x${string}`;
};

export type TokenBridgeRouterInitializedAddresses = {
  defaultGateway: `0x${string}`;
  inbox: `0x${string}`;
  router: `0x${string}`;
  counterpartGateway: `0x${string}`;
};

export type TokenBridgeStandardGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
  inbox: `0x${string}`;
  orbitBeaconProxyFactory: `0x${string}`;
  cloneableProxyHash: `0x${string}`;
  whitelist: `0x${string}`;
};

export type TokenBridgeCustomGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
  inbox: `0x${string}`;
  whitelist: `0x${string}`;
};

export type TokenBridgeWethGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
  inbox: `0x${string}`;
  parentChainWeth: `0x${string}`;
  orbitChainWeth: `0x${string}`;
};

export type TokenBridgeOrbitRouterInitializedAddresses = {
  defaultGateway: `0x${string}`;
  router: `0x${string}`;
  counterpartGateway: `0x${string}`;
};

export type TokenBridgeOrbitStandardGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
  beaconProxyFactory: `0x${string}`;
  cloneableProxyHash: `0x${string}`;
};

export type TokenBridgeOrbitCustomGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
};

export type TokenBridgeOrbitWethGatewayInitializedAddresses = {
  counterpartGateway: `0x${string}`;
  router: `0x${string}`;
  parentChainWeth: `0x${string}`;
  orbitChainWeth: `0x${string}`;
};
