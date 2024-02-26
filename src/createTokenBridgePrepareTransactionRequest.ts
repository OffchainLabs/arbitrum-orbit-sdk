import { Address, PublicClient, encodeFunctionData } from 'viem';

import { tokenBridgeCreator } from './contracts';
import {
  createTokenBridgeDefaultGasLimit,
  createTokenBridgeDefaultRetryablesFees,
} from './constants';
import { validParentChainId } from './types/ParentChain';
import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';
import { publicClientToProvider } from './ethers-compat/publicClientToProvider';
import { isCustomFeeTokenChain } from './utils/isCustomFeeTokenChain';
import {
  GasOverrideOptions,
  TransactionRequestGasOverrides,
  applyPercentIncrease,
} from './utils/gasOverrides';

export type TransactionRequestRetryableGasOverrides = {
  maxSubmissionCostForFactory?: GasOverrideOptions;
  maxGasForFactory?: GasOverrideOptions;
  maxSubmissionCostForContracts?: GasOverrideOptions;
  maxGasForContracts?: GasOverrideOptions;
  maxGasPrice?: bigint;
};

export async function createTokenBridgePrepareTransactionRequest({
  params,
  parentChainPublicClient,
  orbitChainPublicClient,
  account,
  gasOverrides,
  retryableGasOverrides,
  tokenBridgeCreatorAddressOverride,
}: {
  params: { rollup: Address; rollupOwner: Address };
  parentChainPublicClient: PublicClient;
  orbitChainPublicClient: PublicClient;
  account: Address;
  gasOverrides?: TransactionRequestGasOverrides;
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides;
  /**
   * Specifies a custom address for the TokenBridgeCreator. By default, the address will be automatically detected based on the provided chain.
   */
  tokenBridgeCreatorAddressOverride?: Address;
}) {
  const chainId = parentChainPublicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const parentChainProvider = publicClientToProvider(parentChainPublicClient);
  const orbitChainProvider = publicClientToProvider(orbitChainPublicClient);

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = await createTokenBridgeGetInputs(
    account,
    parentChainProvider,
    orbitChainProvider,
    tokenBridgeCreator.address[chainId],
    params.rollup,
    retryableGasOverrides,
  );

  const chainUsesCustomFee = await isCustomFeeTokenChain({
    rollup: params.rollup,
    parentChainPublicClient,
  });

  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: tokenBridgeCreatorAddressOverride ?? tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    value: chainUsesCustomFee ? 0n : retryableFee,
    account: account,
    // if the base gas limit override was provided, hardcode gas to 0 to skip estimation
    // we'll set the actual value in the code below
    gas: typeof gasOverrides?.gasLimit?.base !== 'undefined' ? 0n : undefined,
  });

  // potential gas overrides (gas limit)
  if (gasOverrides && gasOverrides.gasLimit) {
    request.gas = applyPercentIncrease({
      // the ! is here because we should let it error in case we don't have the estimated gas
      base: gasOverrides.gasLimit.base ?? request.gas!,
      percentIncrease: gasOverrides.gasLimit.percentIncrease,
    });
  }

  return { ...request, chainId };
}
