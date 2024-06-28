import { Address, Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { upgradeExecutor } from '../contracts';
import { ActionParameters } from '../types/Actions';
import { UpgradeExecutorRole } from '../upgradeExecutorEncodeFunctionData';

type Args = {
  role: UpgradeExecutorRole;
  address: Address;
};
type UpgradeExecutorABI = typeof upgradeExecutor.abi;
export type hasRoleParameters<Curried extends boolean = false> = ActionParameters<
  Args,
  'upgradeExecutor',
  Curried
>;

export type hasRoleReturnType = ReadContractReturnType<UpgradeExecutorABI, 'hasRole'>;

export async function hasRole<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: hasRoleParameters,
): Promise<hasRoleReturnType> {
  return client.readContract({
    abi: upgradeExecutor.abi,
    functionName: 'hasRole',
    address: args.upgradeExecutor,
    args: [args.role, args.address],
  });
}
