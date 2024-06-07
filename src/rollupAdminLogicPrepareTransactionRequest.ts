import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Transport,
  Chain,
} from 'viem';

import { rollupAdminLogicABI } from './abi/rollupAdminLogicABI';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';
import { GetFunctionName } from './types/utils';
import { validateParentChainPublicClient } from './types/ParentChain';

export type RollupAdminLogicAbi = typeof rollupAdminLogicABI;
export type RollupAdminLogicFunctionName = GetFunctionName<RollupAdminLogicAbi>;

type RollupAdminLogicEncodeFunctionDataParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
> = EncodeFunctionDataParameters<RollupAdminLogicAbi, TFunctionName>;

/**
 * Encodes function data for the RollupAdminLogic contract.
 *
 * @template TFunctionName - The name of the function to encode.
 * @param {RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>} params - The parameters for encoding the function data.
 * @param {RollupAdminLogicAbi} params.abi - The ABI of the RollupAdminLogic contract.
 * @param {TFunctionName} params.functionName - The name of the function to encode.
 * @param {Array} params.args - The arguments to encode.
 * @returns {Object} The encoded function data.
 */
function rollupAdminLogicEncodeFunctionData<TFunctionName extends RollupAdminLogicFunctionName>({
  abi,
  functionName,
  args,
}: RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}

type RollupAdminLogicPrepareFunctionDataParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
> = RollupAdminLogicEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  abi: RollupAdminLogicAbi;
  rollup: Address;
};

/**
 * Prepares function data for the RollupAdminLogic contract.
 *
 * @template TFunctionName - The name of the function to prepare data for.
 * @param {RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>} params - The parameters for preparing the function data.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor or false if none.
 * @param {RollupAdminLogicAbi} params.abi - The ABI of the RollupAdminLogic contract.
 * @param {Address} params.rollup - The address of the rollup contract.
 * @param {TFunctionName} params.functionName - The name of the function to prepare data for.
 * @param {Array} params.args - The arguments to prepare.
 * @returns {Object} The prepared function data including the target address and call data.
 */
function rollupAdminLogicPrepareFunctionData<TFunctionName extends RollupAdminLogicFunctionName>(
  params: RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>,
) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: params.rollup,
      data: rollupAdminLogicEncodeFunctionData(
        params as RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>,
      ),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        params.rollup, // target
        rollupAdminLogicEncodeFunctionData(
          params as RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>,
        ), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type RollupAdminLogicPrepareTransactionRequestParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
> = Omit<RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

/**
 * Prepares a transaction request for the RollupAdminLogic contract.
 *
 * @template TFunctionName - The name of the function to prepare the transaction request for.
 * @template TTransport - The type of transport to use.
 * @template TChain - The type of chain to use.
 * @param {PublicClient<TTransport, TChain>} client - The public client to use for the transaction.
 * @param {RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>} params - The parameters for preparing the transaction request.
 * @param {Address} params.account - The address of the account making the transaction.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor or false if none.
 * @param {Address} params.rollup - The address of the rollup contract.
 * @param {TFunctionName} params.functionName - The name of the function to prepare the transaction request for.
 * @param {Array} params.args - The arguments to prepare.
 * @returns {Promise<Object>} The prepared transaction request.
 */
export async function rollupAdminLogicPrepareTransactionRequest<
  TFunctionName extends RollupAdminLogicFunctionName,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  params: RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>,
) {
  const validatedPublicClient = validateParentChainPublicClient(client);

  // params is extending RollupAdminLogicPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = rollupAdminLogicPrepareFunctionData({
    ...params,
    abi: rollupAdminLogicABI,
  } as unknown as RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: validatedPublicClient.chain.id };
}
