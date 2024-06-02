import { Address, PublicClient, encodeFunctionData } from 'viem';

import { tokenBridgeCreator } from './contracts';
import { validateParentChain } from './types/ParentChain';
import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';
import { isCustomFeeTokenChain } from './utils/isCustomFeeTokenChain';
import {
  GasOverrideOptions,
  TransactionRequestGasOverrides,
  applyPercentIncrease,
} from './utils/gasOverrides';

import { Prettify } from './types/utils';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { getTokenBridgeCreatorAddress } from './utils/getters';

export type TransactionRequestRetryableGasOverrides = {
  maxSubmissionCostForFactory?: GasOverrideOptions;
  maxGasForFactory?: GasOverrideOptions;
  maxSubmissionCostForContracts?: GasOverrideOptions;
  maxGasForContracts?: GasOverrideOptions;
  maxGasPrice?: bigint;
};

export type CreateTokenBridgePrepareTransactionRequestParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    params: { rollup: Address; rollupOwner: Address };
    parentChainPublicClient: PublicClient;
    orbitChainPublicClient: PublicClient;
    account: Address;
    gasOverrides?: TransactionRequestGasOverrides;
    retryableGasOverrides?: TransactionRequestRetryableGasOverrides;
  }>
>;

/**
 * Creates a transaction request to prepare token bridge creation on the parent
 * chain. Returns the prepared transaction request along with the chain ID.
 *
 * @param {CreateTokenBridgePrepareTransactionRequestParams} createTokenBridgePrepareTransactionRequestParams - The parameters for preparing the transaction request.
 * @param {Object} createTokenBridgePrepareTransactionRequestParams.params - The parameters for the token bridge creation.
 * @param {Address} createTokenBridgePrepareTransactionRequestParams.params.rollup - The rollup address.
 * @param {Address} createTokenBridgePrepareTransactionRequestParams.params.rollupOwner - The rollup owner address.
 * @param {PublicClient} createTokenBridgePrepareTransactionRequestParams.parentChainPublicClient - The public client for the parent chain.
 * @param {PublicClient} createTokenBridgePrepareTransactionRequestParams.orbitChainPublicClient - The public client for the orbit chain.
 * @param {Address} createTokenBridgePrepareTransactionRequestParams.account - The account address.
 * @param {TransactionRequestGasOverrides} [createTokenBridgePrepareTransactionRequestParams.gasOverrides] - Optional gas overrides for the transaction request.
 * @param {TransactionRequestRetryableGasOverrides} [createTokenBridgePrepareTransactionRequestParams.retryableGasOverrides] - Optional gas overrides for retryable transactions.
 * @param {Address} [createTokenBridgePrepareTransactionRequestParams.tokenBridgeCreatorAddressOverride] - Optional override for the token bridge creator address.
 *
 * @returns {Promise<Object>} The prepared transaction request and the chain ID.
 *
 * @example
 * const { request, chainId } = await createTokenBridgePrepareTransactionRequest({
 *   params: { rollup: '0x...', rollupOwner: '0x...' },
 *   parentChainPublicClient,
 *   orbitChainPublicClient,
 *   account: '0x...',
 *   gasOverrides: { gasLimit: { base: 21000n, percentIncrease: 20 } },
 *   retryableGasOverrides: { maxSubmissionCostForFactory: { base: 1000n, percentIncrease: 10 } },
 * });
 */
export async function createTokenBridgePrepareTransactionRequest({
  params,
  parentChainPublicClient,
  orbitChainPublicClient,
  account,
  gasOverrides,
  retryableGasOverrides,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgePrepareTransactionRequestParams) {
  const chainId = validateParentChain(parentChainPublicClient);

  const tokenBridgeCreatorAddress =
    tokenBridgeCreatorAddressOverride ?? getTokenBridgeCreatorAddress(parentChainPublicClient);

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = await createTokenBridgeGetInputs(
    account,
    parentChainPublicClient,
    orbitChainPublicClient,
    tokenBridgeCreatorAddress,
    params.rollup,
    retryableGasOverrides,
  );

  const chainUsesCustomFee = await isCustomFeeTokenChain({
    rollup: params.rollup,
    parentChainPublicClient,
  });

  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: tokenBridgeCreatorAddress,
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
