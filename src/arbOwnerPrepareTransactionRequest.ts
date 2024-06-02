import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';
import { GetFunctionName } from './types/utils';

type ArbOwnerAbi = typeof arbOwner.abi;
export type ArbOwnerPrepareTransactionRequestFunctionName = GetFunctionName<ArbOwnerAbi>;
export type ArbOwnerEncodeFunctionDataParameters<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
> = EncodeFunctionDataParameters<ArbOwnerAbi, TFunctionName>;

/**
 * Encodes function data for the ArbOwner contract.
 *
 * @template TFunctionName - The name of the function to encode.
 * @param {ArbOwnerEncodeFunctionDataParameters<TFunctionName>} params - The parameters for encoding the function data.
 * @param {string} params.functionName - The name of the function to encode.
 * @param {Array<any>} params.args - The arguments for the function.
 * @param {Array<any>} params.abi - The ABI of the contract.
 * @returns {string} The encoded function data.
 */
function arbOwnerEncodeFunctionData<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
>({ functionName, abi, args }: ArbOwnerEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}

export type ArbOwnerPrepareFunctionDataParameters<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
> = ArbOwnerEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  abi: ArbOwnerAbi;
};

/**
 * Prepares function data for the ArbOwner contract, optionally using an upgrade executor.
 *
 * @template TFunctionName - The name of the function to prepare data for.
 * @param {ArbOwnerPrepareFunctionDataParameters<TFunctionName>} params - The parameters for preparing the function data.
 * @param {string} params.functionName - The name of the function to prepare data for.
 * @param {Array<any>} params.args - The arguments for the function.
 * @param {Array<any>} params.abi - The ABI of the contract.
 * @param {Address|false} params.upgradeExecutor - The address of the upgrade executor or false if not using an upgrade executor.
 * @returns {Object} The prepared function data including the target address, data, and value.
 */
function arbOwnerPrepareFunctionData<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
>(params: ArbOwnerPrepareFunctionDataParameters<TFunctionName>) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: arbOwner.address,
      data: arbOwnerEncodeFunctionData(
        params as ArbOwnerEncodeFunctionDataParameters<TFunctionName>,
      ),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        arbOwner.address, // target
        arbOwnerEncodeFunctionData(params as ArbOwnerEncodeFunctionDataParameters<TFunctionName>), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type ArbOwnerPrepareTransactionRequestParameters<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
> = Omit<ArbOwnerPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

/**
 * Prepares a transaction request for executing a function on the ArbOwner contract.
 *
 * @template TFunctionName - The name of the function to execute.
 * @template TChain - The type of the chain.
 * @param {PublicClient<Transport, TChain>} client - The public client to use for the transaction.
 * @param {ArbOwnerPrepareTransactionRequestParameters<TFunctionName>} params - The parameters for preparing the transaction request.
 * @param {string} params.functionName - The name of the function to execute.
 * @param {Array<any>} params.args - The arguments for the function.
 * @param {Address|false} params.upgradeExecutor - The address of the upgrade executor or false if not using an upgrade executor.
 * @param {Address} params.account - The address of the account to use for the transaction.
 * @returns {Promise<Object>} The prepared transaction request including the chain ID.
 * @throws Will throw an error if the client chain is undefined.
 */
export async function arbOwnerPrepareTransactionRequest<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
) {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbOwnerPrepareTransactionRequest] client.chain is undefined');
  }

  // params is extending ArbOwnerPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = arbOwnerPrepareFunctionData({
    ...params,
    abi: arbOwner.abi,
  } as unknown as ArbOwnerPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: client.chain.id };
}
