import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { ActionParameters } from '../types/Actions';

export type GetExtraChallengeTimeBlocksParameters<Curried extends boolean = false> =
  ActionParameters<{}, 'rollupAdminLogic', Curried>;

export type GetExtraChallengeTimeBlocksReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'extraChallengeTimeBlocks'
>;

export async function getExtraChallengeTimeBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetExtraChallengeTimeBlocksParameters,
): Promise<GetExtraChallengeTimeBlocksReturnType> {
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'extraChallengeTimeBlocks',
    address: args.rollupAdminLogic,
  });
}
