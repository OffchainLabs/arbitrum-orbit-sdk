import { Address, PublicClient } from 'viem';
import { BigNumber, ContractFactory, ethers } from 'ethers';
import { L1ToL2MessageGasEstimator } from '@arbitrum/sdk';
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';
import { applyPercentIncrease } from './utils/gasOverrides';
import { TransactionRequestRetryableGasOverrides } from './createTokenBridgePrepareTransactionRequest';
import { registerNewNetwork } from './utils/registerNewNetwork';
import { publicClientToProvider } from './ethers-compat/publicClientToProvider';

/**
 * A named factory type extending ContractFactory with a contractName property.
 */
type NamedFactory = ContractFactory & { contractName: string };

/**
 * Creates an instance of NamedFactory with the provided contract JSON.
 *
 * @param {Object} contractJson - The contract JSON containing ABI, bytecode, and contract name.
 * @returns {NamedFactory} The named factory instance.
 */
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
const L2AtomicTokenBridgeFactory__factory = NamedFactoryInstance(L2AtomicTokenBridgeFactory);

/**
 * @typedef {Object} CreateTokenBridgeGetInputsResult
 * @property {Address} inbox - The inbox address.
 * @property {bigint} maxGasForContracts - The maximum gas for contracts.
 * @property {bigint} gasPrice - The gas price.
 * @property {bigint} retryableFee - The retryable fee.
 */
export type CreateTokenBridgeGetInputsResult = {
  inbox: Address;
  maxGasForContracts: bigint;
  gasPrice: bigint;
  retryableFee: bigint;
};

/**
 * Returns a {@link CreateTokenBridgeGetInputsResult} object containing inputs
 * required for creating a token bridge.
 *
 * @param {string} l1DeployerAddress - The address of the L1 deployer.
 * @param {PublicClient} l1PublicClient - The L1 public client.
 * @param {PublicClient} l2PublicClient - The L2 public client.
 * @param {string} l1TokenBridgeCreatorAddress - The address of the L1 token bridge creator.
 * @param {string} rollupAddress - The rollup address.
 * @param {TransactionRequestRetryableGasOverrides} [retryableGasOverrides] - Optional gas overrides for retryable transactions.
 * @returns {Promise<CreateTokenBridgeGetInputsResult>} A promise that resolves to the token bridge inputs.
 */
export const createTokenBridgeGetInputs = async (
  l1DeployerAddress: string,
  l1PublicClient: PublicClient,
  l2PublicClient: PublicClient,
  l1TokenBridgeCreatorAddress: string,
  rollupAddress: string,
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides,
): Promise<CreateTokenBridgeGetInputsResult> => {
  /** l1Provider is a {@link Provider} for interacting with the layer 1 chain. */
  const l1Provider = publicClientToProvider(l1PublicClient);
  /** l2Provider is a {@link PublicClient} provider for Layer 2 network. */
  const l2Provider = publicClientToProvider(l2PublicClient);

  await registerNewNetwork(l1Provider, l2Provider, rollupAddress);

  /**
   * L1AtomicTokenBridgeCreator__factory creates an instance to interact with
   * the L1 Atomic Token Bridge Creator contract on Ethereum.
   */
  const L1AtomicTokenBridgeCreator__factory = new ethers.Contract(
    l1TokenBridgeCreatorAddress,
    L1AtomicTokenBridgeCreator.abi,
  );
  /**
   * l1TokenBridgeCreator connects to the L1AtomicTokenBridgeCreator contract on
   * the Ethereum network.
   */
  const l1TokenBridgeCreator = L1AtomicTokenBridgeCreator__factory.connect(l1Provider);

  //// gasPrice
  const gasPrice = await l2Provider.getGasPrice();

  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    l1DeployerAddress,
    l1Provider,
    l2Provider,
  );
  /** The maximum submission cost for factory estimation. */
  const maxSubmissionCostForFactoryEstimation = deployFactoryGasParams.maxSubmissionCost.mul(2);
  /**
   * The variable `maxGasForFactoryEstimation` represents the maximum gas limit
   * for estimating the deployment of an L2 factory.
   */
  const maxGasForFactoryEstimation = await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment();

  //// run retryable estimate for deploying L2 contracts
  //// we do this estimate using L2 factory template on L1 because on L2 factory does not yet exist
  const l2FactoryTemplate = L2AtomicTokenBridgeFactory__factory.attach(
    await l1TokenBridgeCreator.l2TokenBridgeFactoryTemplate(),
  ).connect(l1Provider);
  /**
   * l2Code retrieves the bytecode for various L2 templates from the
   * L1AtomicTokenBridgeCreator contract.
   */
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
  /** gasEstimateToDeployContracts returns a {@link BigNumber}. */
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
  /** maxSubmissionCostForContractsEstimation returns a {@link BigNumber}. */
  const maxSubmissionCostForContractsEstimation = deployFactoryGasParams.maxSubmissionCost.mul(2);

  //// apply gas overrides
  const maxSubmissionCostForFactory =
    retryableGasOverrides && retryableGasOverrides.maxSubmissionCostForFactory
      ? BigNumber.from(
          applyPercentIncrease({
            base:
              retryableGasOverrides.maxSubmissionCostForFactory.base ??
              BigInt(maxSubmissionCostForFactoryEstimation.toNumber()),
            percentIncrease: retryableGasOverrides.maxSubmissionCostForFactory.percentIncrease,
          }),
        )
      : maxSubmissionCostForFactoryEstimation;

  /**
   * maxGasForFactory returns a {@link BigNumber} representing the maximum gas
   * limit for deploying L2 factory.
   */
  const maxGasForFactory =
    retryableGasOverrides && retryableGasOverrides.maxGasForFactory
      ? BigNumber.from(
          applyPercentIncrease({
            base:
              retryableGasOverrides.maxGasForFactory.base ??
              BigInt(maxGasForFactoryEstimation.toNumber()),
            percentIncrease: retryableGasOverrides.maxGasForFactory.percentIncrease,
          }),
        )
      : maxGasForFactoryEstimation;

  /** The maximum submission cost for deploying contracts. */
  const maxSubmissionCostForContracts =
    retryableGasOverrides && retryableGasOverrides.maxSubmissionCostForContracts
      ? BigNumber.from(
          applyPercentIncrease({
            base:
              retryableGasOverrides.maxSubmissionCostForContracts.base ??
              BigInt(maxSubmissionCostForContractsEstimation.toNumber()),
            percentIncrease: retryableGasOverrides.maxSubmissionCostForContracts.percentIncrease,
          }),
        )
      : maxSubmissionCostForContractsEstimation;

  /** Returns the maximum gas limit for deploying contracts. */
  const maxGasForContracts =
    retryableGasOverrides && retryableGasOverrides.maxGasForContracts
      ? BigNumber.from(
          applyPercentIncrease({
            base:
              retryableGasOverrides.maxGasForContracts.base ??
              BigInt(gasEstimateToDeployContracts.toNumber()),
            percentIncrease: retryableGasOverrides.maxGasForContracts.percentIncrease,
          }),
        )
      : gasEstimateToDeployContracts;

  /** The maximum gas price to be used for transactions. */
  const maxGasPrice =
    retryableGasOverrides && retryableGasOverrides.maxGasPrice
      ? retryableGasOverrides.maxGasPrice
      : gasPrice;

  /**
   * retryableFee is the total fee required for retryable transactions,
   * including submission costs and gas fees.
   */
  let retryableFee = maxSubmissionCostForFactory
    .add(maxSubmissionCostForContracts)
    .add(maxGasForFactory.mul(maxGasPrice))
    .add(maxGasForContracts.mul(maxGasPrice));

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
 * Returns an estimate for deploying the factory on L2.
 *
 * @param {string} l1DeployerAddress - The address of the L1 deployer.
 * @param {ethers.providers.Provider} l1Provider - The L1 provider.
 * @param {ethers.providers.Provider} l2Provider - The L2 provider.
 * @returns {Promise<Object>} A promise that resolves to the gas parameters for deploying the factory.
 */
const getEstimateForDeployingFactory = async (
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

/**
 * Returns an estimate for setting a token gateway in the router.
 *
 * @param {Address} l1ChainOwnerAddress - The address of the L1 chain owner.
 * @param {Address} l1UpgradeExecutorAddress - The address of the L1 upgrade executor.
 * @param {Address} l1GatewayRouterAddress - The address of the L1 gateway router.
 * @param {string} setGatewaysCalldata - The calldata for setting gateways.
 * @param {PublicClient} parentChainPublicClient - The parent chain public client.
 * @param {PublicClient} orbitChainPublicClient - The orbit chain public client.
 * @returns {Promise<Object>} A promise that resolves to the gas parameters for setting the gateway.
 */
export const getEstimateForSettingGateway = async (
  l1ChainOwnerAddress: Address,
  l1UpgradeExecutorAddress: Address,
  l1GatewayRouterAddress: Address,
  setGatewaysCalldata: `0x${string}`,
  parentChainPublicClient: PublicClient,
  orbitChainPublicClient: PublicClient,
) => {
  // ethers providers
  const parentChainProvider = publicClientToProvider(parentChainPublicClient);
  /** orbitChainProvider estimates gas for setting a token gateway in the router. */
  const orbitChainProvider = publicClientToProvider(orbitChainPublicClient);

  // run retryable estimate for setting a token gateway in the router
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(orbitChainProvider);

  /** Estimates the gas parameters for setting a token gateway in the router. */
  const setGatewaysGasParams = await l1ToL2MsgGasEstimate.estimateAll(
    {
      from: l1UpgradeExecutorAddress,
      to: l1GatewayRouterAddress,
      l2CallValue: BigNumber.from(0),
      excessFeeRefundAddress: l1ChainOwnerAddress,
      callValueRefundAddress: l1ChainOwnerAddress,
      data: setGatewaysCalldata,
    },
    await getBaseFee(parentChainProvider),
    parentChainProvider,
  );

  return {
    gasLimit: setGatewaysGasParams.gasLimit.toBigInt(),
    maxFeePerGas: setGatewaysGasParams.maxFeePerGas.toBigInt(),
    maxSubmissionCost: setGatewaysGasParams.maxSubmissionCost.toBigInt(),
    deposit: setGatewaysGasParams.deposit.toBigInt(),
  };
};

