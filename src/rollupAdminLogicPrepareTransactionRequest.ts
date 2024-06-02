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
 * Encodes the function data for a given Rollup Admin Logic function.
 *
 * @template TFunctionName - The name of the function to encode data for.
 * @param {RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>} params - The parameters for encoding the function data.
 * @param {RollupAdminLogicAbi} params.abi - The ABI of the Rollup Admin Logic contract.
 * @param {TFunctionName} params.functionName - The name of the function to encode data for.
 * @param {Array} params.args - The arguments for the function.
 * @returns {string} The encoded function data.
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
 * Prepares the function data for a Rollup Admin Logic function.
 *
 * @template TFunctionName - The name of the function to prepare data for.
 * @param {RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>} params - The parameters for preparing the function data.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor, or false if not applicable.
 * @param {RollupAdminLogicAbi} params.abi - The ABI of the Rollup Admin Logic contract.
 * @param {TFunctionName} params.functionName - The name of the function to prepare data for.
 * @param {Array} params.args - The arguments for the function.
 * @param {Address} params.rollup - The address of the rollup.
 * @returns {Object} An object containing the target address, encoded function data, and value.
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
 * Prepares a transaction request for a Rollup Admin Logic function to be
 * executed on a public client.
 *
 * @template TFunctionName - The name of the function to prepare a transaction request for.
 * @template TTransport - The type of transport used by the public client.
 * @template TChain - The type of chain the public client is connected to.
 * @param {PublicClient<TTransport, TChain>} client - The public client to execute the transaction on.
 * @param {RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>} params - The parameters for preparing the transaction request.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor, or false if not applicable.
 * @param {TFunctionName} params.functionName - The name of the function to prepare data for.
 * @param {Array} params.args - The arguments for the function.
 * @param {Address} params.rollup - The address of the rollup.
 * @param {Address} params.account - The address of the account initiating the transaction.
 * @returns {Promise<Object>} A promise that resolves to the prepared transaction request.
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
