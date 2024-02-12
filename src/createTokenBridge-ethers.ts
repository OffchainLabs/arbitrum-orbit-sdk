/* eslint-disable no-empty */
import { Address } from 'viem';
import { BigNumber, ContractFactory, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { L1Network, L1ToL2MessageGasEstimator, L2Network, addCustomNetwork } from '@arbitrum/sdk';
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';
import { applyPercentIncrease } from './utils/gasOverrides';
import { TransactionRequestRetryableGasOverrides } from './createTokenBridgePrepareTransactionRequest';

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
  l1Provider: ethers.providers.JsonRpcProvider,
  l2Provider: ethers.providers.JsonRpcProvider,
  l1TokenBridgeCreatorAddress: string,
  rollupAddress: string,
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides,
): Promise<CreateTokenBridgeGetInputsResult> => {
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
