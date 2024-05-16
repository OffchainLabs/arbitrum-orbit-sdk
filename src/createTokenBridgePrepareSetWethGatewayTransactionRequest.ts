import { Address, PublicClient, encodeFunctionData, parseAbi } from 'viem';

import { isCustomFeeTokenChain } from './utils/isCustomFeeTokenChain';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';
import { createTokenBridgeFetchTokenBridgeContracts } from './createTokenBridgeFetchTokenBridgeContracts';
import { createRollupFetchCoreContracts } from './createRollupFetchCoreContracts';
import { getEstimateForSettingGateway } from './createTokenBridge-ethers';
import { GasOverrideOptions, applyPercentIncrease } from './utils/gasOverrides';
import { Prettify } from './types/utils';
import { validateParentChain } from './types/ParentChain';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { registerNewNetwork } from './utils/registerNewNetwork';
import { publicClientToProvider } from './ethers-compat/publicClientToProvider';

export type TransactionRequestRetryableGasOverrides = {
  gasLimit?: GasOverrideOptions;
  maxFeePerGas?: GasOverrideOptions;
  maxSubmissionCost?: GasOverrideOptions;
};

export type CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    rollup: Address;
    parentChainPublicClient: PublicClient;
    orbitChainPublicClient: PublicClient;
    account: Address;
    retryableGasOverrides?: TransactionRequestRetryableGasOverrides;
  }>
>;

const parentChainGatewayRouterAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'l1TokenToGateway',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_token',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: '_gateway',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: '_maxGas',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_gasPriceBid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_maxSubmissionCost',
        type: 'uint256',
      },
    ],
    name: 'setGateways',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
];

export async function createTokenBridgePrepareSetWethGatewayTransactionRequest({
  rollup,
  parentChainPublicClient,
  orbitChainPublicClient,
  account,
  retryableGasOverrides,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgePrepareRegisterWethGatewayTransactionRequestParams) {
  const chainId = validateParentChain(parentChainPublicClient);

  // Ensure that networks are registered
  await registerNewNetwork(
    publicClientToProvider(parentChainPublicClient),
    publicClientToProvider(orbitChainPublicClient),
    rollup,
  );

  // check for custom fee token chain
  if (
    await isCustomFeeTokenChain({
      rollup,
      parentChainPublicClient,
    })
  ) {
    throw new Error('chain is custom fee token chain, no need to register the weth gateway.');
  }

  // get inbox address from rollup
  const inbox = await parentChainPublicClient.readContract({
    address: rollup,
    abi: parseAbi(['function inbox() view returns (address)']),
    functionName: 'inbox',
  });

  // get token bridge contracts
  const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
    inbox,
    parentChainPublicClient,
    tokenBridgeCreatorAddressOverride,
  });

  // check whether the weth gateway is already registered in the router
  const registeredWethGateway = await parentChainPublicClient.readContract({
    address: tokenBridgeContracts.parentChainContracts.router,
    abi: parentChainGatewayRouterAbi,
    functionName: 'l1TokenToGateway',
    args: [tokenBridgeContracts.parentChainContracts.weth],
  });
  if (registeredWethGateway === tokenBridgeContracts.parentChainContracts.wethGateway) {
    throw new Error('weth gateway is already registered in the router.');
  }

  const rollupCoreContracts = await createRollupFetchCoreContracts({
    rollup,
    publicClient: parentChainPublicClient,
  });

  // encode data for the setGateways call
  // (we first encode dummy data, to get the retryable message estimates)
  const setGatewaysDummyCalldata = encodeFunctionData({
    abi: parentChainGatewayRouterAbi,
    functionName: 'setGateways',
    args: [
      [tokenBridgeContracts.parentChainContracts.weth],
      [tokenBridgeContracts.parentChainContracts.wethGateway],
      1n, // _maxGas
      1n, // _gasPriceBid
      1n, // _maxSubmissionCost
    ],
  });
  const retryableTicketGasEstimates = await getEstimateForSettingGateway(
    account,
    rollupCoreContracts.upgradeExecutor,
    tokenBridgeContracts.parentChainContracts.router,
    setGatewaysDummyCalldata,
    parentChainPublicClient,
    orbitChainPublicClient,
  );

  //// apply gas overrides
  const gasLimit =
    retryableGasOverrides && retryableGasOverrides.gasLimit
      ? applyPercentIncrease({
          base: retryableGasOverrides.gasLimit.base ?? retryableTicketGasEstimates.gasLimit,
          percentIncrease: retryableGasOverrides.gasLimit.percentIncrease,
        })
      : retryableTicketGasEstimates.gasLimit;

  const maxFeePerGas =
    retryableGasOverrides && retryableGasOverrides.maxFeePerGas
      ? applyPercentIncrease({
          base: retryableGasOverrides.maxFeePerGas.base ?? retryableTicketGasEstimates.maxFeePerGas,
          percentIncrease: retryableGasOverrides.maxFeePerGas.percentIncrease,
        })
      : retryableTicketGasEstimates.maxFeePerGas;

  const maxSubmissionCost =
    retryableGasOverrides && retryableGasOverrides.maxSubmissionCost
      ? applyPercentIncrease({
          base:
            retryableGasOverrides.maxSubmissionCost.base ??
            retryableTicketGasEstimates.maxSubmissionCost,
          percentIncrease: retryableGasOverrides.maxSubmissionCost.percentIncrease,
        })
      : retryableTicketGasEstimates.maxSubmissionCost;

  const deposit = gasLimit * maxFeePerGas + maxSubmissionCost;

  // (and then we encode the real data, to send the transaction)
  const setGatewaysCalldata = encodeFunctionData({
    abi: parentChainGatewayRouterAbi,
    functionName: 'setGateways',
    args: [
      [tokenBridgeContracts.parentChainContracts.weth],
      [tokenBridgeContracts.parentChainContracts.wethGateway],
      gasLimit, // _maxGas
      maxFeePerGas, // _gasPriceBid
      maxSubmissionCost, // _maxSubmissionCost
    ],
  });

  // prepare the transaction request with a call to the upgrade executor
  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: rollupCoreContracts.upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        tokenBridgeContracts.parentChainContracts.router, // target
        setGatewaysCalldata, // targetCallData
      ],
    }),
    value: deposit,
    account,
  });

  return { ...request, chainId };
}
