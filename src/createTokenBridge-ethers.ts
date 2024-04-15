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
const L2AtomicTokenBridgeFactory__factory = NamedFactoryInstance(L2AtomicTokenBridgeFactory);

export type CreateTokenBridgeGetInputsResult = {
  inbox: Address;
  maxGasForContracts: bigint;
  gasPrice: bigint;
  retryableFee: bigint;
};

export const createTokenBridgeGetInputs = async (
  l1DeployerAddress: string,
  l1PublicClient: PublicClient,
  l2PublicClient: PublicClient,
  l1TokenBridgeCreatorAddress: string,
  rollupAddress: string,
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides,
): Promise<CreateTokenBridgeGetInputsResult> => {
  const l1Provider = publicClientToProvider(l1PublicClient);
  const l2Provider = publicClientToProvider(l2PublicClient);

  await registerNewNetwork(l1Provider, l2Provider, rollupAddress);

  const L1AtomicTokenBridgeCreator__factory = new ethers.Contract(
    l1TokenBridgeCreatorAddress,
    L1AtomicTokenBridgeCreator.abi,
  );
  const l1TokenBridgeCreator = L1AtomicTokenBridgeCreator__factory.connect(l1Provider);

  //// gasPrice
  const gasPrice = await l2Provider.getGasPrice();

  //// run retryable estimate for deploying L2 factory
  const deployFactoryGasParams = await getEstimateForDeployingFactory(
    l1DeployerAddress,
    l1Provider,
    l2Provider,
  );
  const maxSubmissionCostForFactoryEstimation = deployFactoryGasParams.maxSubmissionCost.mul(2);
  const maxGasForFactoryEstimation = await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment();

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

  const maxGasPrice =
    retryableGasOverrides && retryableGasOverrides.maxGasPrice
      ? retryableGasOverrides.maxGasPrice
      : gasPrice;

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
  const orbitChainProvider = publicClientToProvider(orbitChainPublicClient);

  // run retryable estimate for setting a token gateway in the router
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(orbitChainProvider);

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
