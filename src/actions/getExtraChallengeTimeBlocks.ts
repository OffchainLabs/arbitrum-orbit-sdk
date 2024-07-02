import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { WithContractAddress } from '../types/Actions';
import { getRollupAddress } from '../getRollupAddress';

export type GetExtraChallengeTimeBlocksParameters<Curried extends boolean = false> =
  WithContractAddress<{}, 'rollupAdminLogic', Curried>;

export type GetExtraChallengeTimeBlocksReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'extraChallengeTimeBlocks'
>;

export async function getExtraChallengeTimeBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetExtraChallengeTimeBlocksParameters,
): Promise<GetExtraChallengeTimeBlocksReturnType> {
  const rollupAdminLogicAddresss = await getRollupAddress(client, args);
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'extraChallengeTimeBlocks',
    address: rollupAdminLogicAddresss,
  });
}
