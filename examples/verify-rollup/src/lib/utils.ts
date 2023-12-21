import { ChainLayer, OrbitHandler } from './client';
import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';
import { SequencerInbox__factory } from '@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory';
import { L1GatewayRouter__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1GatewayRouter__factory';
import { L2GatewayRouter__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2GatewayRouter__factory';
import { L1ERC20Gateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1ERC20Gateway__factory';
import { L2ERC20Gateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2ERC20Gateway__factory';
import { L1CustomGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1CustomGateway__factory';
import { L2CustomGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2CustomGateway__factory';
import { L1WethGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1WethGateway__factory';
import { L2WethGateway__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L2WethGateway__factory';
import {
  Abi,
  AbiEventItem,
  RollupCreatedEventAddresses,
  RollupCreatorInputParameters,
  RollupInformationFromRollupCreatedEvent,
  TokenBridgeCanonicalAddresses,
  TokenBridgeCustomGatewayInitializedAddresses,
  TokenBridgeOrbitCustomGatewayInitializedAddresses,
  TokenBridgeOrbitRouterInitializedAddresses,
  TokenBridgeOrbitStandardGatewayInitializedAddresses,
  TokenBridgeOrbitWethGatewayInitializedAddresses,
  TokenBridgeRouterInitializedAddresses,
  TokenBridgeStandardGatewayInitializedAddresses,
  TokenBridgeWethGatewayInitializedAddresses,
} from './types';
import {
  TokenBridgeCreatorAbi,
  supportedCreateRollupAbis,
  supportedRollupCreatedEvents,
} from './abis';
import {
  defineChain,
  decodeEventLog,
  getAddress,
  trim,
  decodeFunctionData,
  zeroAddress,
} from 'viem';
import {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumNova,
  arbitrumGoerli,
  arbitrumSepolia,
} from 'viem/chains';

// Supported Viem chains
const supportedChains = {
  mainnet,
  sepolia,
  arbitrum,
  arbitrumNova,
  arbitrumGoerli,
  arbitrumSepolia,
};

// Block range to search for recent events (24 hours)
const blockCountToSearchRecentEventsOnEth = BigInt((24 * 60 * 60) / 12.5);
const blockCountToSearchRecentEventsOnArb = BigInt((24 * 60 * 60) / 0.25);

// The default RPC for Ethereum on Viem has a restriction of 800 blocks max
// (this can be solved by defining a custom RPC in the .env file)
const defaultBlockCountToSearchRecentEventsOnEth = 800n;

type RoleGrantedLogArgs = {
  role: `0x${string}`;
  account: `0x${string}`;
  sender: `0x${string}`;
};

type SetValidKeysetLogArgs = {
  keysetHash: `0x${string}`;
  keysetBytes: `0x${string}`;
};

type OrbitTokenBridgeCreatedArgs = {
  inbox: `0x${string}`;
  owner: `0x${string}`;
  router: `0x${string}`;
  standardGateway: `0x${string}`;
  customGateway: `0x${string}`;
  wethGateway: `0x${string}`;
  proxyAdmin: `0x${string}`;
  upgradeExecutor: `0x${string}`;
};

type UpgradeExecutorPrivilegedAccounts = {
  // Key: account
  // Value: array of roles
  [key: `0x${string}`]: `0x${string}`[];
};

const RoleGrantedEventAbi: AbiEventItem = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleGranted',
  type: 'event',
};

const RoleRevokedEventAbi: AbiEventItem = {
  inputs: [
    {
      indexed: true,
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
    {
      indexed: true,
      internalType: 'address',
      name: 'sender',
      type: 'address',
    },
  ],
  name: 'RoleGranted',
  type: 'event',
};

export const UpgradeExecutorRoles: {
  [key: `0x${string}`]: string;
} = {
  '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63': 'executor',
  '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775': 'admin',
};

export const getChainInfoFromChainId = (chainId: number) => {
  for (const chain of Object.values(supportedChains)) {
    if ('id' in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  return undefined;
};

export const defineChainInformation = (chainId: number, chainRpc: string) => {
  return defineChain({
    id: chainId,
    name: 'Orbit chain',
    network: 'orbit',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [chainRpc],
      },
      public: {
        http: [chainRpc],
      },
    },
  });
};

export const getBlockToSearchEventsFrom = (
  chainId: number,
  toBlock: bigint,
  useCustomRpc?: boolean,
) => {
  const isArbitrumChain = ![mainnet.id as number, sepolia.id as number].includes(chainId);
  let blockLimit = blockCountToSearchRecentEventsOnArb;

  if (!isArbitrumChain) {
    blockLimit = useCustomRpc
      ? blockCountToSearchRecentEventsOnEth
      : defaultBlockCountToSearchRecentEventsOnEth;
  }

  return toBlock - blockLimit;
};

export const getUpgradeExecutorPrivilegedAccounts = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  upgradeExecutorAddress: `0x${string}`,
): Promise<UpgradeExecutorPrivilegedAccounts | undefined> => {
  const privilegedAccounts: UpgradeExecutorPrivilegedAccounts = {};

  //
  // Find first the role granted events
  //
  const roleGrantedEvents = await orbitHandler.getLogs(
    chainLayer,
    upgradeExecutorAddress,
    RoleGrantedEventAbi,
    undefined,
    'earliest',
    'latest',
  );
  if (!roleGrantedEvents || roleGrantedEvents.length <= 0) {
    return undefined;
  }

  roleGrantedEvents.forEach((roleGrantedEvent) => {
    const account = (roleGrantedEvent.args as RoleGrantedLogArgs).account;
    const role = (roleGrantedEvent.args as RoleGrantedLogArgs).role;

    if (!(account in privilegedAccounts)) {
      privilegedAccounts[account] = [];
    }
    privilegedAccounts[account].push(role);
  });

  //
  // And then the role revoked events
  //
  const roleRevokedEvents = await orbitHandler.getLogs(
    chainLayer,
    upgradeExecutorAddress,
    RoleRevokedEventAbi,
    undefined,
    'earliest',
    'latest',
  );
  if (!roleRevokedEvents || roleRevokedEvents.length <= 0) {
    return privilegedAccounts;
  }

  roleRevokedEvents.forEach((roleRevokedEvent) => {
    const account = (roleRevokedEvent.args as RoleGrantedLogArgs).account;
    const role = (roleRevokedEvent.args as RoleGrantedLogArgs).role;

    const roleIndex = privilegedAccounts[account].findIndex((accRole) => accRole == role);
    if (roleIndex >= 0) {
      privilegedAccounts[account] = privilegedAccounts[account].splice(roleIndex, 1);
    }
  });

  return privilegedAccounts;
};

export const getCurrentAdminOfContract = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  contractAddress: `0x${string}`,
): Promise<`0x${string}` | undefined> => {
  const slot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
  const adminAddress = await orbitHandler.getStorageAt(chainLayer, contractAddress, slot);
  if (!adminAddress) {
    return getAddress('0x');
  }
  return getAddress(trim(adminAddress));
};

export const getLogicAddressOfContract = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  contractAddress: `0x${string}`,
): Promise<`0x${string}` | undefined> => {
  const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  const logicContractAddress = await orbitHandler.getStorageAt(chainLayer, contractAddress, slot);
  if (!logicContractAddress) {
    return getAddress('0x');
  }
  return getAddress(trim(logicContractAddress));
};

export const contractIsInitialized = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  contractAddress: `0x${string}`,
): Promise<boolean> => {
  const slot = '0x0';
  const storageContents = await orbitHandler.getStorageAt(chainLayer, contractAddress, slot);
  if (!storageContents) {
    return false;
  }

  // Ethereum storage slots are 32 bytes and a uint8 is 1 byte, we mask the lower 8 bits to convert it to uint8.
  const storageContentsBigNumber = BigInt(storageContents);
  const maskedValue = storageContentsBigNumber & 255n;
  return Number(maskedValue) == 1;
};

//
// Requiremenets to finding this information:
//    - Rollup contract should have emitted a RollupInitialized event
//    - RollupCreator should have emitted a RollupCreated event
export const getRollupInformationFromRollupCreator = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  rollupAddress: `0x${string}`,
): Promise<RollupInformationFromRollupCreatedEvent> => {
  // Step 1: find the RollupInitialized event from that Rollup contract
  const rollupInitializedEvents = await orbitHandler.getLogs(
    chainLayer,
    rollupAddress,
    RollupCore__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'RollupInitialized',
    )[0] as AbiEventItem,
    undefined,
    'earliest',
    'latest',
  );
  if (!rollupInitializedEvents || rollupInitializedEvents.length <= 0) {
    throw new Error(`No RollupInitialized event found for rollup address ${rollupAddress}`);
  }

  // Step 2: get the transaction hash that emitted that event
  const transactionHash = rollupInitializedEvents[0].transactionHash;
  if (!transactionHash) {
    throw new Error(
      `No transaction hash found in RollupInitialized event for rollup address ${rollupAddress}`,
    );
  }

  // Step 3: get all logs from that transaction
  const transactionReceipt = await orbitHandler.getTransactionReceipt(chainLayer, transactionHash);

  // Step 4: find RollupCreated log
  const rollupInformation: RollupInformationFromRollupCreatedEvent = {
    rollupCreatorAddress: getAddress(transactionReceipt.to!),
  };
  for (let i = 0; i < supportedRollupCreatedEvents.length; i++) {
    const currentRollupCreatedEventInfo = supportedRollupCreatedEvents[i];
    const rollupCreatedEventLog = transactionReceipt.logs.filter(
      (log) => log.topics[0] == currentRollupCreatedEventInfo.topic,
    )[0];
    if (!rollupCreatedEventLog) {
      continue;
    }

    try {
      const decodedLog = decodeEventLog({
        abi: [currentRollupCreatedEventInfo.abi],
        data: rollupCreatedEventLog.data,
        topics: rollupCreatedEventLog.topics,
      });
      rollupInformation.rollupAddresses = decodedLog.args as RollupCreatedEventAddresses;
      break;
    } catch (err) {
      // Silently continue
    }
  }

  // Step 5: Get input of the transaction
  const transaction = await orbitHandler.getTransaction(chainLayer, transactionHash);

  try {
    const { args } = decodeFunctionData({
      abi: supportedCreateRollupAbis,
      data: transaction.input,
    });
    const rollupParameters = args![0] as RollupCreatorInputParameters;
    rollupInformation.rollupParameters = rollupParameters;
    rollupInformation.rollupChainConfig = JSON.parse(rollupParameters.config.chainConfig);
  } catch (err) {
    // Silently continue
  }

  return rollupInformation;
};

export const getCurrentKeysetsForDAS = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  sequencerInboxAddress: `0x${string}`,
): Promise<`0x${string}`[]> => {
  // Step 1: Get all SetValidKeyset events from the SequencerInbox
  const setValidKeysetEvents = await orbitHandler.getLogs(
    chainLayer,
    sequencerInboxAddress,
    SequencerInbox__factory.abi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'SetValidKeyset',
    )[0] as AbiEventItem,
    undefined,
    'earliest',
    'latest',
  );
  if (!setValidKeysetEvents || setValidKeysetEvents.length <= 0) {
    console.log(`No SetValidKeyset events found for SequencerInbox ${sequencerInboxAddress}`);
    return [];
  }

  // Step 2: Verify which of the keysets is still valid
  const validKeysets: `0x${string}`[] = [];
  for (const setValidKeysetEvent of setValidKeysetEvents) {
    const keysetHash = (setValidKeysetEvent.args as SetValidKeysetLogArgs).keysetHash;
    // eslint-disable-next-line no-await-in-loop
    const keysetIsValid = (await orbitHandler.readContract(
      chainLayer,
      sequencerInboxAddress,
      SequencerInbox__factory.abi as Abi,
      'isValidKeysetHash',
      [keysetHash],
    )) as boolean;

    if (keysetIsValid) {
      validKeysets.push(keysetHash);
    }
  }

  return validKeysets;
};

export const getTokenBridgeAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeCreatorAddress: `0x${string}`,
  inboxAddress: `0x${string}`,
): Promise<OrbitTokenBridgeCreatedArgs> => {
  const orbitTokenBridgeCreatedEvents = await orbitHandler.getLogs(
    chainLayer,
    tokenBridgeCreatorAddress,
    TokenBridgeCreatorAbi.filter(
      (abiItem) => abiItem.type == 'event' && abiItem.name == 'OrbitTokenBridgeCreated',
    )[0] as AbiEventItem,
    {
      inbox: inboxAddress,
    },
    'earliest',
    'latest',
  );
  if (!orbitTokenBridgeCreatedEvents || orbitTokenBridgeCreatedEvents.length <= 0) {
    throw new Error(`
    No OrbitTokenBridgeCreated events found for Inbox ${inboxAddress} on TokenBridgeCreator ${tokenBridgeCreatorAddress}
    `);
  }

  return orbitTokenBridgeCreatedEvents[0].args as OrbitTokenBridgeCreatedArgs;
};

export const getTokenBridgeCanonicalOrbitAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeCreatorAddress: `0x${string}`,
  orbitChainId: number,
  isUsingFeeToken: boolean,
): Promise<TokenBridgeCanonicalAddresses> => {
  const [
    router,
    standardGateway,
    customGateway,
    upgradeExecutor,
    multicall,
    proxyAdmin,
    beaconProxyFactory,
  ] = await Promise.all(
    [
      'getCanonicalL2RouterAddress',
      'getCanonicalL2StandardGatewayAddress',
      'getCanonicalL2CustomGatewayAddress',
      'getCanonicalL2UpgradeExecutorAddress',
      'getCanonicalL2Multicall',
      'getCanonicalL2ProxyAdminAddress',
      'getCanonicalL2BeaconProxyFactoryAddress',
    ].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeCreatorAddress,
        TokenBridgeCreatorAbi as Abi,
        functionName,
        [orbitChainId],
      )) as `0x${string}`;
      return address;
    }),
  );

  const [wethGateway, weth] = isUsingFeeToken
    ? [zeroAddress as `0x${string}`, zeroAddress as `0x${string}`]
    : await Promise.all(
        ['getCanonicalL2WethGatewayAddress', 'getCanonicalL2WethAddress'].map(
          async (functionName) => {
            const address = (await orbitHandler.readContract(
              chainLayer,
              tokenBridgeCreatorAddress,
              TokenBridgeCreatorAbi as Abi,
              functionName,
              [orbitChainId],
            )) as `0x${string}`;
            return address;
          },
        ),
      );

  return {
    router,
    standardGateway,
    customGateway,
    wethGateway,
    weth,
    upgradeExecutor,
    multicall,
    proxyAdmin,
    beaconProxyFactory,
  };
};

export const getTokenBridgeRouterInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeRouterAddress: `0x${string}`,
): Promise<TokenBridgeRouterInitializedAddresses> => {
  // Router initialized addresses
  const [defaultGateway, inbox, router, counterpartGateway] = await Promise.all(
    ['defaultGateway', 'inbox', 'router', 'counterpartGateway'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeRouterAddress,
        L1GatewayRouter__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    defaultGateway,
    inbox,
    router,
    counterpartGateway,
  };
};

export const getTokenBridgeStandardGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeStandardGatewayAddress: `0x${string}`,
): Promise<TokenBridgeStandardGatewayInitializedAddresses> => {
  // StandardGateway initialized addresses
  const [
    counterpartGateway,
    router,
    inbox,
    orbitBeaconProxyFactory,
    cloneableProxyHash,
    whitelist,
  ] = await Promise.all(
    [
      'counterpartGateway',
      'router',
      'inbox',
      'l2BeaconProxyFactory',
      'cloneableProxyHash',
      'whitelist',
    ].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeStandardGatewayAddress,
        L1ERC20Gateway__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    counterpartGateway,
    router,
    inbox,
    orbitBeaconProxyFactory,
    cloneableProxyHash,
    whitelist,
  };
};

export const getTokenBridgeCustomGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeCustomGatewayAddress: `0x${string}`,
): Promise<TokenBridgeCustomGatewayInitializedAddresses> => {
  // StandardGateway initialized addresses
  const [counterpartGateway, router, inbox, whitelist] = await Promise.all(
    ['counterpartGateway', 'router', 'inbox', 'whitelist'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeCustomGatewayAddress,
        L1CustomGateway__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    counterpartGateway,
    router,
    inbox,
    whitelist,
  };
};

export const getTokenBridgeWethGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeWethGatewayAddress: `0x${string}`,
): Promise<TokenBridgeWethGatewayInitializedAddresses> => {
  // StandardGateway initialized addresses
  const [counterpartGateway, router, inbox, parentChainWeth, orbitChainWeth] = await Promise.all(
    ['counterpartGateway', 'router', 'inbox', 'l1Weth', 'l2Weth'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeWethGatewayAddress,
        L1WethGateway__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    counterpartGateway,
    router,
    inbox,
    parentChainWeth,
    orbitChainWeth,
  };
};

export const getTokenBridgeOrbitRouterInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeRouterAddress: `0x${string}`,
): Promise<TokenBridgeOrbitRouterInitializedAddresses> => {
  // Router initialized addresses
  const [defaultGateway, router, counterpartGateway] = await Promise.all(
    ['defaultGateway', 'router', 'counterpartGateway'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeRouterAddress,
        L2GatewayRouter__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    defaultGateway,
    router,
    counterpartGateway,
  };
};

export const getTokenBridgeOrbitStandardGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeStandardGatewayAddress: `0x${string}`,
): Promise<TokenBridgeOrbitStandardGatewayInitializedAddresses> => {
  // StandardGateway initialized addresses
  const [counterpartGateway, router, beaconProxyFactory, cloneableProxyHash] = await Promise.all(
    ['counterpartGateway', 'router', 'beaconProxyFactory', 'cloneableProxyHash'].map(
      async (functionName) => {
        const address = (await orbitHandler.readContract(
          chainLayer,
          tokenBridgeStandardGatewayAddress,
          L2ERC20Gateway__factory.abi as Abi,
          functionName,
        )) as `0x${string}`;
        return address;
      },
    ),
  );

  return {
    counterpartGateway,
    router,
    beaconProxyFactory,
    cloneableProxyHash,
  };
};

export const getTokenBridgeOrbitCustomGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeCustomGatewayAddress: `0x${string}`,
): Promise<TokenBridgeOrbitCustomGatewayInitializedAddresses> => {
  const [counterpartGateway, router] = await Promise.all(
    ['counterpartGateway', 'router'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeCustomGatewayAddress,
        L2CustomGateway__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    counterpartGateway,
    router,
  };
};

export const getTokenBridgeOrbitWethGatewayInitializedAddresses = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  tokenBridgeWethGatewayAddress: `0x${string}`,
): Promise<TokenBridgeOrbitWethGatewayInitializedAddresses> => {
  const [counterpartGateway, router, parentChainWeth, orbitChainWeth] = await Promise.all(
    ['counterpartGateway', 'router', 'l1Weth', 'l2Weth'].map(async (functionName) => {
      const address = (await orbitHandler.readContract(
        chainLayer,
        tokenBridgeWethGatewayAddress,
        L2WethGateway__factory.abi as Abi,
        functionName,
      )) as `0x${string}`;
      return address;
    }),
  );

  return {
    counterpartGateway,
    router,
    parentChainWeth,
    orbitChainWeth,
  };
};

export const contractIsERC20 = async (
  orbitHandler: OrbitHandler,
  chainLayer: ChainLayer,
  address: `0x${string}`,
): Promise<boolean> => {
  const nativeTokenContractBytecode = await orbitHandler.getBytecode(chainLayer, address);

  if (!nativeTokenContractBytecode || nativeTokenContractBytecode == '0x') {
    return false;
  }

  return true;
};
