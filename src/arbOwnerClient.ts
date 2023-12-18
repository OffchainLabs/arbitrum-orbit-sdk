import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  PrepareTransactionRequestReturnType,
  zeroAddress,
  Chain,
  Transport,
  Abi,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { GetFunctionName,  PickReadFunctionFromAbi, Prettify } from './types/utils';

type ArbOwnerEncodeFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof arbOwner.abi, string>, 'abi'>
>;

type X = GetFunctionName<PickReadFunctionFromAbi<typeof arbOwner.abi>>

function arbOwnerEncodeFunctionData({
  functionName,
  args,
}: ArbOwnerEncodeFunctionDataParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName,
    args,
  });
}

export type ArbOwnerPrepareTransactionRequestParameters = Prettify<
  ArbOwnerEncodeFunctionDataParameters & {
    account: Address;
  }
>;

type ArbOwnerClientPrepareFunctionDataResult = {
  to: Address;
  data: `0x${string}`;
  value: bigint;
};

export type CreateArbOwnerClientParams = {
  publicClient: PublicClient;
  upgradeExecutor: Address | false; // this one is intentionally not optional, so you have to explicitly pass `upgradeExecutor: false` if you're not using one
};

export type ArbOwnerClient = ReturnType<typeof createArbOwnerClient>;

// arbOwnerSimulateContract
// arbOwnerPrepareTransactionRequest

export function createArbOwnerClient({
  publicClient,
  upgradeExecutor,
}: CreateArbOwnerClientParams) {
  return {
    prepareFunctionData(
      params: ArbOwnerEncodeFunctionDataParameters
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
      params: ArbOwnerPrepareTransactionRequestParameters
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

function arbOwnerPrepareFunctionData(
  params: ArbOwnerEncodeFunctionDataParameters
): ArbOwnerClientPrepareFunctionDataResult {
  const upgradeExecutor = zeroAddress;

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
}

function applyDefaults<T>(obj: T,defaults: { abi: Abi }) {
  return {
    return {...obj, abi: defaults.abi}
  };
}

function arbOwnerReadContract<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: { functionName: string, args: any }
) {
  return client.readContract({
    address: arbOwner.address,
    abi: arbOwner.abi,
    functionName: params.functionName,
    args: params.args
  });
}

export async function arbOwnerPrepareTransactionRequest<
  TChain extends Chain | undefined
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters
) {
  const { to, data, value } = arbOwnerPrepareFunctionData(params);

  // @ts-ignore
  return client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });
}
