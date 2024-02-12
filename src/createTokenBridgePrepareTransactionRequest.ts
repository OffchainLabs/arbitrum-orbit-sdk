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
  TransactionRequestGasOverrides,
  TransactionRequestRetryableGasOverrides,
  applyPercentIncrease,
} from './utils/gasOverrides';

export async function createTokenBridgePrepareTransactionRequest({
  params,
  parentChainPublicClient,
  orbitChainPublicClient,
  account,
  gasOverrides,
  retryableGasOverrides,
}: {
  params: { rollup: Address; rollupOwner: Address };
  parentChainPublicClient: PublicClient;
  orbitChainPublicClient: PublicClient;
  account: Address;
  gasOverrides?: TransactionRequestGasOverrides;
  retryableGasOverrides?: TransactionRequestRetryableGasOverrides;
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
    to: tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    value: chainUsesCustomFee ? 0n : retryableFee,
    account: account,
  });

  // potential gas overrides (gas limit)
  if (gasOverrides && gasOverrides.gasLimit) {
    request.gas = applyPercentIncrease({
      base: gasOverrides.gasLimit.base ?? request.gas ?? createTokenBridgeDefaultGasLimit,
      percentIncrease: gasOverrides.gasLimit.percentIncrease,
    });
  }

  return { ...request, chainId };
}
