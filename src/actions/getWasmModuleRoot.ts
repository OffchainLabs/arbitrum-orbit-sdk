import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { ActionParameters } from '../types/Actions';

export type GetWasmModuleRootParameters<Curried extends boolean = false> = ActionParameters<
  {},
  'rollupAdminLogic',
  Curried
>;

export type GetWasmModuleRootReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'wasmModuleRoot'
>;

export async function getWasmModuleRoot<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetWasmModuleRootParameters,
): Promise<GetWasmModuleRootReturnType> {
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'wasmModuleRoot',
    address: args.rollupAdminLogic,
  });
}
