import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { ActionParameters } from '../types/Actions';

export type GetMinimumAssertionPeriodParameters<Curried extends boolean = false> = ActionParameters<
  {},
  'rollupAdminLogic',
  Curried
>;

export type GetMinimumAssertionPeriodReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'minimumAssertionPeriod'
>;

export async function getMinimumAssertionPeriod<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetMinimumAssertionPeriodParameters,
): Promise<GetMinimumAssertionPeriodReturnType> {
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'minimumAssertionPeriod',
    address: args.rollupAdminLogic,
  });
}
