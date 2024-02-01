/* eslint-disable no-empty */
import { BigNumber, ContractFactory, Signer, Wallet, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  L1Network,
  L1ToL2MessageGasEstimator,
  L1ToL2MessageStatus,
  L1TransactionReceipt,
  L2Network,
  addCustomNetwork,
} from '@arbitrum/sdk';
import { exit } from 'process';
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { Address } from 'viem';

type NamedFactory = ContractFactory & { contractName: string };
const NamedFactoryInstance = (contractJson: {
  abi: any;
  bytecode: string;
  contractName: string;
}): NamedFactory => {
  const factory = new ContractFactory(contractJson.abi, contractJson.bytecode) as NamedFactory;
  factory['contractName'] = contractJson.contractName;
  return factory;
};

// import from token-bridge-contracts directly to make sure the bytecode is the same
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';
const L2AtomicTokenBridgeFactory__factory = NamedFactoryInstance(L2AtomicTokenBridgeFactory);
import L2ERC20Gateway from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/gateway/L2ERC20Gateway.sol/L2ERC20Gateway.json';
const L2ERC20Gateway__factory = NamedFactoryInstance(L2ERC20Gateway);

// import from nitro-contracts directly to make sure the bytecode is the same
import IInbox from '@arbitrum/nitro-contracts/build/contracts/src/bridge/IInbox.sol/IInbox.json';
const IInbox__factory = NamedFactoryInstance(IInbox);
import IERC20Bridge from '@arbitrum/nitro-contracts/build/contracts/src/bridge/IERC20Bridge.sol/IERC20Bridge.json';
const IERC20Bridge__factory = NamedFactoryInstance(IERC20Bridge);
import IERC20 from '@arbitrum/nitro-contracts/build/contracts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';
import { TransactionRequestGasOverrides } from './types/TransactionRequestGasOverrides';
import { GasOverrides } from '@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator';

const IERC20__factory = NamedFactoryInstance(IERC20);

export type CreateTokenBridgeGetInputsResult = {
  inbox: Address;
  maxGasForContracts: bigint;
  gasPrice: bigint;
  retryableFee: bigint;
};

export const createTokenBridgeGetInputs = async (
  l1DeployerAddress: string,
  l1Provider: ethers.providers.JsonRpcProvider,
  l2Provider: ethers.providers.JsonRpcProvider,
  l1TokenBridgeCreatorAddress: string,
  rollupAddress: string,
): Promise<CreateTokenBridgeGetInputsResult> => {
  await registerNewNetwork(l1Provider, l2Provider, rollupAddress);

  const L1AtomicTokenBridgeCreator__factory = new ethers.Contract(
    l1TokenBridgeCreatorAddress,
    L1AtomicTokenBridgeCreator.abi,
  );
  const l1TokenBridgeCreator = L1AtomicTokenBridgeCreator__factory.connect(l1Provider);

  const gasPrice = await l2Provider.getGasPrice();
  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    l1DeployerAddress,
    l1Provider,
    l2Provider,
  );
  const maxGasForFactory = await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment();
  const maxSubmissionCostForFactory = deployFactoryGasParams.maxSubmissionCost;
  //// run retryable estimate for deploying L2 contracts
  //// we do this estimate using L2 factory template on L1 because on L2 factory does not yet exist
  const l2FactoryTemplate = L2AtomicTokenBridgeFactory__factory.attach(
    await l1TokenBridgeCreator.l2TokenBridgeFactoryTemplate(),
  ).connect(l1Provider);
  const l2Code = {
    router: await l1Provider.getCode(await l1TokenBridgeCreator.l2RouterTemplate()),
    standardGateway: await l1Provider.getCode(
      await l1TokenBridgeCreator.l2StandardGatewayTemplate(),
    ),
    customGateway: await l1Provider.getCode(await l1TokenBridgeCreator.l2CustomGatewayTemplate()),
    wethGateway: await l1Provider.getCode(await l1TokenBridgeCreator.l2WethGatewayTemplate()),
    aeWeth: await l1Provider.getCode(await l1TokenBridgeCreator.l2WethTemplate()),
    upgradeExecutor: await l1Provider.getCode(
      (
        await l1TokenBridgeCreator.l1Templates()
      ).upgradeExecutor,
    ),
    multicall: await l1Provider.getCode(await l1TokenBridgeCreator.l2MulticallTemplate()),
  };
  const gasEstimateToDeployContracts = await l2FactoryTemplate.estimateGas.deployL2Contracts(
    l2Code,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
  );
  const maxGasForContracts = gasEstimateToDeployContracts.mul(2);
  const maxSubmissionCostForContracts = deployFactoryGasParams.maxSubmissionCost.mul(2);
  let retryableFee = maxSubmissionCostForFactory
    .add(maxSubmissionCostForContracts)
    .add(maxGasForFactory.mul(gasPrice))
    .add(maxGasForContracts.mul(gasPrice));

  // get inbox from rollup contract
  const inbox = await RollupAdminLogic__factory.connect(rollupAddress, l1Provider).inbox();

  return {
    inbox: inbox as Address,
    maxGasForContracts: maxGasForContracts.toBigInt(),
    gasPrice: gasPrice.toBigInt(),
    retryableFee: retryableFee.toBigInt(),
  };
};

/**
 * Use already deployed L1TokenBridgeCreator to create and init token bridge contracts.
 * Function first gets estimates for 2 retryable tickets - one for deploying L2 factory and
 * one for deploying L2 side of token bridge. Then it creates retryables, waits for
 * until they're executed, and finally it picks up addresses of new contracts.
 *
 * @param l1Signer
 * @param l2Provider
 * @param l1TokenBridgeCreator
 * @param rollupAddress
 * @returns
 */
export const createTokenBridge = async (
  l1Signer: Signer,
  l2Provider: ethers.providers.Provider,
  l1TokenBridgeCreator: ethers.Contract,
  rollupAddress: string,
  childChainId: number,
) => {
  const gasPrice = await l2Provider.getGasPrice();
  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    await l1Signer.getAddress(),
    l1Signer.provider!,
    l2Provider,
  );
  const maxGasForFactory = await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment();
  const maxSubmissionCostForFactory = deployFactoryGasParams.maxSubmissionCost;
  //// run retryable estimate for deploying L2 contracts
  //// we do this estimate using L2 factory template on L1 because on L2 factory does not yet exist
  const l2FactoryTemplate = L2AtomicTokenBridgeFactory__factory.attach(
    await l1TokenBridgeCreator.l2TokenBridgeFactoryTemplate(),
  ).connect(l1Signer);
  const l2Code = {
    router: await l1Signer.provider?.getCode(await l1TokenBridgeCreator.l2RouterTemplate()),
    standardGateway: await l1Signer.provider?.getCode(
      await l1TokenBridgeCreator.l2StandardGatewayTemplate(),
    ),
    customGateway: await l1Signer.provider?.getCode(
      await l1TokenBridgeCreator.l2CustomGatewayTemplate(),
    ),
    wethGateway: await l1Signer.provider?.getCode(
      await l1TokenBridgeCreator.l2WethGatewayTemplate(),
    ),
    aeWeth: await l1Signer.provider?.getCode(await l1TokenBridgeCreator.l2WethTemplate()),
    upgradeExecutor: await l1Signer.provider?.getCode(
      (
        await l1TokenBridgeCreator.l1Templates()
      ).upgradeExecutor,
    ),
    multicall: await l1Signer.provider?.getCode(await l1TokenBridgeCreator.l2MulticallTemplate()),
  };
  const gasEstimateToDeployContracts = await l2FactoryTemplate.estimateGas.deployL2Contracts(
    l2Code,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
    ethers.Wallet.createRandom().address,
  );
  const maxGasForContracts = gasEstimateToDeployContracts.mul(2);
  const maxSubmissionCostForContracts = deployFactoryGasParams.maxSubmissionCost.mul(2);
  let retryableFee = maxSubmissionCostForFactory
    .add(maxSubmissionCostForContracts)
    .add(maxGasForFactory.mul(gasPrice))
    .add(maxGasForContracts.mul(gasPrice));

  // get inbox from rollup contract
  const inbox = await RollupAdminLogic__factory.connect(rollupAddress, l1Signer.provider!).inbox();
  // if fee token is used approve the fee
  const feeToken = await _getFeeToken(inbox, l1Signer.provider!);
  if (feeToken != ethers.constants.AddressZero) {
    await (
      await IERC20__factory.attach(feeToken)
        .connect(l1Signer)
        .attach(feeToken)
        .approve(l1TokenBridgeCreator.address, retryableFee)
    ).wait();
    retryableFee = BigNumber.from(0);
  }
  /// do it - create token bridge
  const receipt = await (
    await l1TokenBridgeCreator.createTokenBridge(
      inbox,
      await l1Signer.getAddress(),
      maxGasForContracts,
      gasPrice,
      { value: retryableFee },
    )
  ).wait();
  console.log('Deployment TX:', receipt.transactionHash);

  /// wait for execution of both tickets
  const l1TxReceipt = new L1TransactionReceipt(receipt);
  const messages = await l1TxReceipt.getL1ToL2Messages(l2Provider);
  const messageResults = await Promise.all(messages.map((message) => message.waitForStatus()));

  // if both tickets are not redeemed log it and exit
  if (
    messageResults[0].status !== L1ToL2MessageStatus.REDEEMED ||
    messageResults[1].status !== L1ToL2MessageStatus.REDEEMED
  ) {
    console.log(
      `Retryable ticket (ID ${messages[0].retryableCreationId}) status: ${
        L1ToL2MessageStatus[messageResults[0].status]
      }`,
    );
    console.log(
      `Retryable ticket (ID ${messages[1].retryableCreationId}) status: ${
        L1ToL2MessageStatus[messageResults[1].status]
      }`,
    );
    exit();
  }

  /// pick up L2 factory address from 1st ticket
  const l2AtomicTokenBridgeFactory = L2AtomicTokenBridgeFactory__factory.attach(
    messageResults[0].l2TxReceipt.contractAddress,
  ).connect(l2Provider);
  console.log('L2AtomicTokenBridgeFactory', l2AtomicTokenBridgeFactory.address);

  /// pick up L1 contracts from events
  const {
    router: l1Router,
    standardGateway: l1StandardGateway,
    customGateway: l1CustomGateway,
    wethGateway: l1WethGateway,
    proxyAdmin: l1ProxyAdmin,
  } = getParsedLogs(receipt.logs, l1TokenBridgeCreator.interface, 'OrbitTokenBridgeCreated')[0]
    .args;

  /// pick up L2 contracts
  const l2Router = await l1TokenBridgeCreator.getCanonicalL2RouterAddress(childChainId);
  const l2StandardGateway = L2ERC20Gateway__factory.attach(
    await l1TokenBridgeCreator.getCanonicalL2StandardGatewayAddress(childChainId),
  ).connect(l2Provider);
  const beaconProxyFactory = await l2StandardGateway.beaconProxyFactory();
  const l2CustomGateway = await l1TokenBridgeCreator.getCanonicalL2CustomGatewayAddress(
    childChainId,
  );

  const isUsingFeeToken = feeToken != ethers.constants.AddressZero;
  const l2WethGateway = isUsingFeeToken
    ? ethers.constants.AddressZero
    : await l1TokenBridgeCreator.getCanonicalL2WethGatewayAddress(childChainId);
  const l1Weth = await l1TokenBridgeCreator.l1Weth();
  const l2Weth = isUsingFeeToken
    ? ethers.constants.AddressZero
    : await l1TokenBridgeCreator.getCanonicalL2WethAddress(childChainId);
  const l2ProxyAdmin = await l1TokenBridgeCreator.getCanonicalL2ProxyAdminAddress(childChainId);

  const l1MultiCall = await l1TokenBridgeCreator.l1Multicall();
  const l2Multicall = await l1TokenBridgeCreator.getCanonicalL2Multicall(childChainId);

  return {
    l1Router,
    l1StandardGateway,
    l1CustomGateway,
    l1WethGateway,
    l1ProxyAdmin,
    l2Router,
    l2StandardGateway: l2StandardGateway.address,
    l2CustomGateway,
    l2WethGateway,
    l1Weth,
    l2Weth,
    beaconProxyFactory,
    l2ProxyAdmin,
    l1MultiCall,
    l2Multicall,
  };
};

export const getEstimateForDeployingFactory = async (
  l1DeployerAddress: string,
  l1Provider: ethers.providers.Provider,
  l2Provider: ethers.providers.Provider,
) => {
  //// run retryable estimate for deploying L2 factory
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(l2Provider);
  const deployFactoryGasParams = await l1ToL2MsgGasEstimate.estimateAll(
    {
      from: ethers.Wallet.createRandom().address,
      to: ethers.constants.AddressZero,
      l2CallValue: BigNumber.from(0),
      excessFeeRefundAddress: l1DeployerAddress,
      callValueRefundAddress: l1DeployerAddress,
      data: L2AtomicTokenBridgeFactory__factory.bytecode,
    },
    await getBaseFee(l1Provider),
    l1Provider,
  );

  return deployFactoryGasParams;
};

export const getEstimateForSettingGateway = async (
  l1ChainOwnerAddress: Address,
  l1UpgradeExecutorAddress: Address,
  l1GatewayRouterAddress: Address,
  setGatewaysCalldata: `0x${string}`,
  l1Provider: ethers.providers.Provider,
  l2Provider: ethers.providers.Provider,
  gasOverrides?: TransactionRequestGasOverrides,
) => {
  //// run retryable estimate for setting a token gateway in the router
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(l2Provider);

  // applying gas overrides
  const gasOverridesForEstimation: GasOverrides = {};
  if (gasOverrides && gasOverrides.gasLimit) {
    gasOverridesForEstimation.gasLimit = {
      min: undefined,
      percentIncrease: undefined,
    };

    if (gasOverrides.gasLimit.minimum) {
      gasOverridesForEstimation.gasLimit.min = BigNumber.from(gasOverrides.gasLimit.minimum);
    }

    if (gasOverrides.gasLimit.percentIncrease) {
      gasOverridesForEstimation.gasLimit.percentIncrease = BigNumber.from(
        gasOverrides.gasLimit.percentIncrease,
      );
    }
  }

  const setGatewaysGasParams = await l1ToL2MsgGasEstimate.estimateAll(
    {
      from: l1UpgradeExecutorAddress,
      to: l1GatewayRouterAddress,
      l2CallValue: BigNumber.from(0),
      excessFeeRefundAddress: l1ChainOwnerAddress,
      callValueRefundAddress: l1ChainOwnerAddress,
      data: setGatewaysCalldata,
    },
    await getBaseFee(l1Provider),
    l1Provider,
    gasOverridesForEstimation,
  );

  return {
    gasLimit: setGatewaysGasParams.gasLimit.toBigInt(),
    maxFeePerGas: setGatewaysGasParams.maxFeePerGas.toBigInt(),
    maxSubmissionCost: setGatewaysGasParams.maxSubmissionCost.toBigInt(),
    deposit: setGatewaysGasParams.deposit.toBigInt(),
  };
};

export const getSigner = (provider: JsonRpcProvider, key?: string) => {
  if (!key && !provider) throw new Error('Provide at least one of key or provider.');
  if (key) return new Wallet(key).connect(provider);
  else return provider.getSigner(0);
};

export const getParsedLogs = (
  logs: ethers.providers.Log[],
  iface: ethers.utils.Interface,
  eventName: string,
) => {
  const eventFragment = iface.getEvent(eventName);
  const parsedLogs = logs
    .filter((curr: any) => curr.topics[0] === iface.getEventTopic(eventFragment))
    .map((curr: any) => iface.parseLog(curr));
  return parsedLogs;
};

const _getFeeToken = async (inbox: string, l1Provider: ethers.providers.Provider) => {
  const bridge = await IInbox__factory.attach(inbox).connect(l1Provider).bridge();

  let feeToken = ethers.constants.AddressZero;

  try {
    feeToken = await IERC20Bridge__factory.attach(bridge).connect(l1Provider).nativeToken();
  } catch {}

  return feeToken;
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const registerNewNetwork = async (
  l1Provider: JsonRpcProvider,
  l2Provider: JsonRpcProvider,
  rollupAddress: string,
): Promise<{
  l1Network: L1Network;
  l2Network: Omit<L2Network, 'tokenBridge'>;
}> => {
  const l1NetworkInfo = await l1Provider.getNetwork();
  const l2NetworkInfo = await l2Provider.getNetwork();

  const l1Network: L1Network = {
    blockTime: 10,
    chainID: l1NetworkInfo.chainId,
    explorerUrl: '',
    isCustom: true,
    name: l1NetworkInfo.name,
    partnerChainIDs: [l2NetworkInfo.chainId],
    isArbitrum: false,
  };

  const rollup = RollupAdminLogic__factory.connect(rollupAddress, l1Provider);
  const l2Network: L2Network = {
    chainID: l2NetworkInfo.chainId,
    confirmPeriodBlocks: (await rollup.confirmPeriodBlocks()).toNumber(),
    ethBridge: {
      bridge: await rollup.bridge(),
      inbox: await rollup.inbox(),
      outbox: await rollup.outbox(),
      rollup: rollup.address,
      sequencerInbox: await rollup.sequencerInbox(),
    },
    explorerUrl: '',
    isArbitrum: true,
    isCustom: true,
    name: 'OrbitChain',
    partnerChainID: l1NetworkInfo.chainId,
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    tokenBridge: {
      l1CustomGateway: '',
      l1ERC20Gateway: '',
      l1GatewayRouter: '',
      l1MultiCall: '',
      l1ProxyAdmin: '',
      l1Weth: '',
      l1WethGateway: '',
      l2CustomGateway: '',
      l2ERC20Gateway: '',
      l2GatewayRouter: '',
      l2Multicall: '',
      l2ProxyAdmin: '',
      l2Weth: '',
      l2WethGateway: '',
    },
  };

  // register - needed for retryables
  addCustomNetwork({
    customL1Network: l1Network,
    customL2Network: l2Network,
  });

  return {
    l1Network,
    l2Network,
  };
};
