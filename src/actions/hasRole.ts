import { Address, Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { upgradeExecutor } from '../contracts';
import { ActionParameters } from '../types/Actions';
import { UpgradeExecutorRole } from '../upgradeExecutorEncodeFunctionData';

type Args = {
  role: UpgradeExecutorRole;
  address: Address;
};
type UpgradeExecutorABI = typeof upgradeExecutor.abi;
export type HasRoleParameters<Curried extends boolean = false> = ActionParameters<
  Args,
  'upgradeExecutor',
  Curried
>;

export type HasRoleReturnType = ReadContractReturnType<UpgradeExecutorABI, 'hasRole'>;

export async function hasRole<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: HasRoleParameters,
): Promise<HasRoleReturnType> {
  return client.readContract({
    abi: upgradeExecutor.abi,
    functionName: 'hasRole',
    address: args.upgradeExecutor,
    args: [args.role, args.address],
  });
}
