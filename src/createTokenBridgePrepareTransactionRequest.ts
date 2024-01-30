import { Address, PublicClient, encodeFunctionData } from 'viem';

import { tokenBridgeCreator } from './contracts';
import { createTokenBridgeDefaultGasLimit, createTokenBridgeDefaultValue } from './constants';
import { validParentChainId } from './types/ParentChain';
import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';
import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { isCustomFeeTokenChain } from './utils/isCustomFeeTokenChain';

type GasOverrideOptions = {
  minimum?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
  retryableTicketFees?: GasOverrideOptions;
};

export async function createTokenBridgePrepareTransactionRequest({
  params,
  parentChainPublicClient,
  childChainPublicClient,
  account,
  gasOverrides,
}: {
  params: { rollup: Address; rollupOwner: Address };
  parentChainPublicClient: PublicClient;
  childChainPublicClient: PublicClient;
  account: Address;
  gasOverrides?: TransactionRequestGasOverrides;
}) {
  const chainId = parentChainPublicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const parentChainProvider = publicClientToProvider(parentChainPublicClient);
  const childChainProvider = publicClientToProvider(childChainPublicClient);

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = await createTokenBridgeGetInputs(
    account,
    parentChainProvider,
    childChainProvider,
    tokenBridgeCreator.address[chainId],
    params.rollup,
  );

  const chainUsesCustomFee = await isCustomFeeTokenChain({
    rollup: params.rollup,
    parentChainPublicClient,
  });

  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    value: chainUsesCustomFee ? 0n : retryableFee,
    account: account,
  });

  // potential gas overrides
  if (gasOverrides) {
    // Gas limit
    if (gasOverrides.gasLimit) {
      request.gas =
        gasOverrides.gasLimit.minimum ?? request.gas ?? createTokenBridgeDefaultGasLimit;

      if (gasOverrides.gasLimit.percentIncrease) {
        request.gas = request.gas + (request.gas * gasOverrides.gasLimit.percentIncrease) / 100n;
      }
    }

    // Retryable ticket fees
    if (gasOverrides.retryableTicketFees) {
      request.value =
        gasOverrides.retryableTicketFees.minimum ?? request.value ?? createTokenBridgeDefaultValue;

      if (gasOverrides.retryableTicketFees.percentIncrease) {
        request.value =
          request.value + (request.value * gasOverrides.retryableTicketFees.percentIncrease) / 100n;
      }
    }
  }

  return { ...request, chainId };
}
