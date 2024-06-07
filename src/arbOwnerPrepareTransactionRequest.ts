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
 * Encodes function data for ArbOwner contract.
 *
 * @template TFunctionName - Name of the function to encode
 * @param {ArbOwnerEncodeFunctionDataParameters<TFunctionName>} params - Parameters for encoding function data
 * @param {string} params.functionName - Name of the function to encode
 * @param {ArbOwnerAbi} params.abi - ABI of the ArbOwner contract
 * @param {Array<any>} params.args - Arguments for the function
 * @returns {string} Encoded function data
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

type ArbOwnerPrepareFunctionDataParameters<
  TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
> = ArbOwnerEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  abi: ArbOwnerAbi;
};

/**
 * Prepares function data for ArbOwner contract.
 *
 * @template TFunctionName - Name of the function to prepare data for
 * @param {ArbOwnerPrepareFunctionDataParameters<TFunctionName>} params - Parameters for preparing function data
 * @param {Address | false} params.upgradeExecutor - Address of the upgrade executor or false if not applicable
 * @param {ArbOwnerAbi} params.abi - ABI of the ArbOwner contract
 * @returns {Object} Prepared function data including target address, data and value
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
 * Prepares a transaction request for the ArbOwner contract.
 *
 * @template TFunctionName - Name of the function to prepare transaction for
 * @template TChain - Type of the chain or undefined
 * @param {PublicClient<Transport, TChain>} client - Public client to interact with the blockchain
 * @param {ArbOwnerPrepareTransactionRequestParameters<TFunctionName>} params - Parameters for preparing the transaction request
 * @param {Address} params.account - Account address
 * @param {TFunctionName} params.functionName - Name of the function to encode
 * @param {Array<any>} params.args - Arguments for the function
 * @param {Address | false} params.upgradeExecutor - Address of the upgrade executor or false if not applicable
 * @returns {Promise<Object>} Prepared transaction request including chainId
 * @throws Will throw an error if client.chain is undefined
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   account: '0xYourAccountAddress',
 *   functionName: 'yourFunctionName',
 *   args: [...],
 *   upgradeExecutor: '0xExecutorAddress',
 * };
 * const request = await arbOwnerPrepareTransactionRequest(client, params);
 * console.log(request);
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
