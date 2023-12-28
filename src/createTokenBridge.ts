import { Address, PublicClient, encodeFunctionData } from 'viem';
import { BigNumber } from 'ethers';

import { tokenBridgeCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { publicClientToProvider } from './compat/publicClientToProvider';

import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';

function convertInputs(inputs: {
  inbox: string;
  gasPrice: BigNumber;
  maxGasForContracts: BigNumber;
  retryableFee: BigNumber;
}) {
  return {
    inbox: inputs.inbox as Address,
    maxGasForContracts: inputs.maxGasForContracts.toBigInt(),
    gasPrice: inputs.gasPrice.toBigInt(),
    retryableFee: inputs.retryableFee.toBigInt(),
  };
}

export async function createTokenBridgePrepareTransactionRequest({
  params,
  parentChainPublicClient,
  childChainPublicClient,
  account,
}: {
  params: { rollup: Address; rollupOwner: Address };
  parentChainPublicClient: PublicClient;
  childChainPublicClient: PublicClient;
  account: Address;
}) {
  const chainId = parentChainPublicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const parentChainProvider = publicClientToProvider(parentChainPublicClient);
  const childChainProvider = publicClientToProvider(childChainPublicClient);

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = convertInputs(
    await createTokenBridgeGetInputs(
      account,
      parentChainProvider,
      childChainProvider,
      tokenBridgeCreator.address[chainId],
      params.rollup,
    ),
  );

  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    value: retryableFee,
    account: account,
  });

  return { ...request, chainId };
}
