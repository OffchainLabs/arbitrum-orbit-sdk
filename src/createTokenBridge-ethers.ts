/* eslint-disable no-empty */
import { Address } from 'viem';
import { BigNumber, ContractFactory, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { L1Network, L1ToL2MessageGasEstimator, L2Network, addCustomNetwork } from '@arbitrum/sdk';
import { getBaseFee } from '@arbitrum/sdk/dist/lib/utils/lib';
import { GasOverrides } from '@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import L1AtomicTokenBridgeCreator from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/ethereum/L1AtomicTokenBridgeCreator.sol/L1AtomicTokenBridgeCreator.json';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';
import {
  TransactionRequestRetryableGasOverrides,
  applyPercentIncrease,
} from './utils/gasOverrides';

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
    retryableGasOverrides,
  );
  const maxSubmissionCostForFactory = deployFactoryGasParams.maxSubmissionCost.mul(2);

  //// hard-coded value, we don't need to apply overrides here
  const maxGasForFactory = await l1TokenBridgeCreator.gasLimitForL2FactoryDeployment();

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

  //// apply gas overrides (gasLimit)
  const maxGasForContracts =
    retryableGasOverrides && retryableGasOverrides.gasLimit
      ? BigNumber.from(
          applyPercentIncrease({
            base:
              retryableGasOverrides.gasLimit.base ??
              BigInt(gasEstimateToDeployContracts.toNumber()),
            percentIncrease: retryableGasOverrides.gasLimit.percentIncrease,
          }),
        )
      : gasEstimateToDeployContracts;

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

const formatGasOverrides = (
  retryableGasOverrides: TransactionRequestRetryableGasOverrides,
): GasOverrides => {
  const gasOverridesForEstimation: GasOverrides = {};

  if (retryableGasOverrides) {
    // gasLimit
    if (retryableGasOverrides.gasLimit) {
      gasOverridesForEstimation.gasLimit = {
        base: retryableGasOverrides.gasLimit.base
          ? BigNumber.from(retryableGasOverrides.gasLimit.base)
          : undefined,
        percentIncrease: retryableGasOverrides.gasLimit.percentIncrease
          ? BigNumber.from(retryableGasOverrides.gasLimit.percentIncrease)
          : undefined,
      };
    }

    // maxSubmissionFee
    if (retryableGasOverrides.maxSubmissionFee) {
      gasOverridesForEstimation.maxSubmissionFee = {
        base: retryableGasOverrides.maxSubmissionFee.base
          ? BigNumber.from(retryableGasOverrides.maxSubmissionFee.base)
          : undefined,
        percentIncrease: retryableGasOverrides.maxSubmissionFee.percentIncrease
          ? BigNumber.from(retryableGasOverrides.maxSubmissionFee.percentIncrease)
          : undefined,
      };
    }

    // maxFeePerGas
    if (retryableGasOverrides.maxFeePerGas && retryableGasOverrides.maxFeePerGas.percentIncrease) {
      gasOverridesForEstimation.maxFeePerGas = {
        base: retryableGasOverrides.maxFeePerGas.base
          ? BigNumber.from(retryableGasOverrides.maxFeePerGas.base)
          : undefined,
        percentIncrease: retryableGasOverrides.maxFeePerGas.percentIncrease
          ? BigNumber.from(retryableGasOverrides.maxFeePerGas.percentIncrease)
          : undefined,
      };
    }

    // deposit
    if (retryableGasOverrides.deposit) {
      gasOverridesForEstimation.deposit = {
        base: undefined,
      };

      if (retryableGasOverrides.deposit.base) {
        gasOverridesForEstimation.deposit.base = BigNumber.from(retryableGasOverrides.deposit.base);

        // Note: To send the override to the Arbitrum SDK, this percentIncrease is only valid if there's a base
        //       (the Arbitrum SDK does not allow a percentIncrease in the deposit, only a base)
        if (retryableGasOverrides.deposit.percentIncrease) {
          gasOverridesForEstimation.deposit.base = BigNumber.from(
            retryableGasOverrides.deposit.base +
              (retryableGasOverrides.deposit.base * retryableGasOverrides.deposit.percentIncrease) /
                100n,
          );
        }
      }
    }
  }

  return gasOverridesForEstimation;
};

const getEstimateForDeployingFactory = async (
  l1DeployerAddress: string,
  l1Provider: ethers.providers.Provider,
  l2Provider: ethers.providers.Provider,
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides,
) => {
  //// run retryable estimate for deploying L2 factory
  const l1ToL2MsgGasEstimate = new L1ToL2MessageGasEstimator(l2Provider);

  // applying gas overrides
  const gasOverridesForEstimation: GasOverrides = retryableGasOverrides
    ? formatGasOverrides(retryableGasOverrides)
    : {};

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
    gasOverridesForEstimation,
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
