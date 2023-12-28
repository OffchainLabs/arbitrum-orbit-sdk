import { Address, PublicClient, encodeFunctionData } from 'viem';

import { tokenBridgeCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';
import { publicClientToProvider } from './ethers-compat/publicClientToProvider';

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

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = await createTokenBridgeGetInputs(
    account,
    parentChainProvider,
    childChainProvider,
    tokenBridgeCreator.address[chainId],
    params.rollup,
  );

  const request = await parentChainPublicClient.prepareTransactionRequest({
    chain: parentChainPublicClient.chain,
    to: tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    // todo: should be 0 for custom gas token
    value: retryableFee,
    account: account,
  });

  return { ...request, chainId };
}
