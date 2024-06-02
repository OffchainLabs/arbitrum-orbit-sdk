import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
} from 'viem';

import { arbAggregator } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';
import { GetFunctionName } from './types/utils';

type ArbAggregatorAbi = typeof arbAggregator.abi;
export type ArbAggregatorPrepareTransactionRequestFunctionName = GetFunctionName<ArbAggregatorAbi>;
export type ArbAggregatorEncodeFunctionDataParameters<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
> = EncodeFunctionDataParameters<ArbAggregatorAbi, TFunctionName>;

/**
 * Encodes function data for the ArbAggregator contract function specified by the given function name.
 *
 * @template TFunctionName - The name of the function to encode data for.
 * @param {ArbAggregatorEncodeFunctionDataParameters<TFunctionName>} params - The parameters for encoding function data.
 * @param {string} params.functionName - The name of the function to encode data for.
 * @param {Array<any>} params.args - The arguments to pass to the function.
 * @param {Array<any>} params.abi - The ABI of the contract.
 * @returns {string} The encoded function data.
 */
function arbAggregatorEncodeFunctionData<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
>({ functionName, abi, args }: ArbAggregatorEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}

type ArbAggregatorPrepareFunctionDataParameters<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
> = ArbAggregatorEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  abi: ArbAggregatorAbi;
};

/**
 * Prepares function data for the ArbAggregator contract function specified by the given function name.
 *
 * @template TFunctionName - The name of the function to prepare data for.
 * @param {ArbAggregatorPrepareFunctionDataParameters<TFunctionName>} params - The parameters for preparing function data.
 * @param {string} params.functionName - The name of the function to prepare data for.
 * @param {Array<any>} params.args - The arguments to pass to the function.
 * @param {Array<any>} params.abi - The ABI of the contract.
 * @param {Address|false} params.upgradeExecutor - The address of the upgrade executor or false if not applicable.
 * @returns {Object} The prepared function data including the target address, encoded data, and value.
 */
function arbAggregatorPrepareFunctionData<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
>(params: ArbAggregatorPrepareFunctionDataParameters<TFunctionName>) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: arbAggregator.address,
      data: arbAggregatorEncodeFunctionData(
        params as ArbAggregatorEncodeFunctionDataParameters<TFunctionName>,
      ),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        arbAggregator.address, // target
        arbAggregatorEncodeFunctionData(
          params as ArbAggregatorEncodeFunctionDataParameters<TFunctionName>,
        ), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type ArbAggregatorPrepareTransactionRequestParameters<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
> = Omit<ArbAggregatorPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

/**
 * Prepares a transaction request for the ArbAggregator contract function specified by the given function name.
 * It generates the necessary data and value for the transaction based on the input parameters and prepares the
 * transaction request using the provided client and account information.
 *
 * @template TFunctionName - The name of the function to prepare the transaction request for.
 * @template TChain - The type of the chain.
 * @param {PublicClient<Transport, TChain>} client - The public client used to prepare the transaction request.
 * @param {ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>} params - The parameters for preparing the transaction request.
 * @param {string} params.functionName - The name of the function to prepare the transaction request for.
 * @param {Array<any>} params.args - The arguments to pass to the function.
 * @param {Address|false} params.upgradeExecutor - The address of the upgrade executor or false if not applicable.
 * @param {Address} params.account - The account address to use for the transaction.
 * @returns {Promise<Object>} The prepared transaction request including the chain ID.
 * @throws {Error} If the client.chain is undefined.
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   functionName: 'someFunction',
 *   args: [arg1, arg2],
 *   upgradeExecutor: '0xExecutorAddress',
 *   account: '0xAccountAddress',
 * };
 * const request = await arbAggregatorPrepareTransactionRequest(client, params);
 */
export async function arbAggregatorPrepareTransactionRequest<
  TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>,
) {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbAggregatorPrepareTransactionRequest] client.chain is undefined');
  }

  // params is extending ArbAggregatorPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = arbAggregatorPrepareFunctionData({
    ...params,
    abi: arbAggregator.abi,
  } as unknown as ArbAggregatorPrepareFunctionDataParameters<TFunctionName>);

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
