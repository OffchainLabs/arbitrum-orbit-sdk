import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { WithContractAddress } from '../types/Actions';
import { getRollupAddress } from '../getRollupAddress';

export type GetMinimumAssertionPeriodParameters<Curried extends boolean = false> =
  WithContractAddress<{}, 'rollupAdminLogic', Curried>;

export type GetMinimumAssertionPeriodReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'minimumAssertionPeriod'
>;

export async function getMinimumAssertionPeriod<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetMinimumAssertionPeriodParameters,
): Promise<GetMinimumAssertionPeriodReturnType> {
  const rollupAdminLogicAddresss = await getRollupAddress(client, args);
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'minimumAssertionPeriod',
    address: rollupAdminLogicAddresss,
  });
}
