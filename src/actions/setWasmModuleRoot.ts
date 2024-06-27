import {
  Chain,
  Hex,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { rollupAdminLogic } from '../contracts';
import { ActionParameters, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

export type SetWasmModuleRootParameters<Curried extends boolean = false> = Prettify<
  WithAccount<
    ActionParameters<
      {
        newWasmModuleRoot: Hex;
      },
      'rollupAdminLogic',
      Curried
    >
  >
>;

export type SetWasmModuleRootReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({ newWasmModuleRoot }: SetWasmModuleRootParameters) {
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setWasmModuleRoot',
    args: [newWasmModuleRoot],
  });
}

export async function setWasmModuleRoot<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetWasmModuleRootParameters,
): Promise<SetWasmModuleRootReturnType> {
  const data = rollupAdminLogicFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.rollupAdminLogic,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
