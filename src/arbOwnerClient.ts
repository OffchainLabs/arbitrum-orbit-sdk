import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  PrepareTransactionRequestReturnType,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { Prettify } from './types/utils';

type ArbOwnerFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof arbOwner.abi, string>, 'abi'>
>;

function arbOwnerEncodeFunctionData({
  functionName,
  args,
}: ArbOwnerFunctionDataParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName,
    args,
  });
}

type ArbOwnerClient = {
  prepareFunctionData(
    params: ArbOwnerFunctionDataParameters
  ): ArbOwnerClientPrepareFunctionDataResult;

  prepareTransactionRequest(
    params: ArbOwnerClientPrepareTransactionRequestParams
  ): Promise<PrepareTransactionRequestReturnType>;
};

type ArbOwnerClientPrepareTransactionRequestParams = Prettify<
  ArbOwnerFunctionDataParameters & {
    account: Address;
  }
>;

type ArbOwnerClientPrepareFunctionDataResult = {
  to: Address;
  data: `0x${string}`;
  value: bigint;
};

type CreateArbOwnerClientParams = {
  publicClient: PublicClient;
  upgradeExecutor: Address | false; // this one is intentionally not optional, so you have to explicitly pass `upgradeExecutor: false` if you're not using one
};

export function createArbOwnerClient({
  publicClient,
  upgradeExecutor,
}: CreateArbOwnerClientParams): ArbOwnerClient {
  return {
    prepareFunctionData(
      params: ArbOwnerFunctionDataParameters
    ): ArbOwnerClientPrepareFunctionDataResult {
      if (!upgradeExecutor) {
        return {
          to: arbOwner.address,
          data: arbOwnerEncodeFunctionData(params),
          value: BigInt(0),
        };
      }

      return {
        to: upgradeExecutor,
        data: upgradeExecutorEncodeFunctionData({
          functionName: 'executeCall',
          args: [
            arbOwner.address, // target
            arbOwnerEncodeFunctionData(params), // targetCallData
          ],
        }),
        value: BigInt(0),
      };
    },

    async prepareTransactionRequest(
      params: ArbOwnerClientPrepareTransactionRequestParams
    ): Promise<PrepareTransactionRequestReturnType> {
      const { to, data, value } = this.prepareFunctionData(params);

      return publicClient.prepareTransactionRequest({
        chain: publicClient.chain,
        to,
        data,
        value,
        account: params.account,
      });
    },
  };
}
