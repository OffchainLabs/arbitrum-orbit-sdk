import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import { ActionParameters } from '../types/Actions';
import { getRollupAddress } from '../getRollupAddress';

export type GetConfirmPeriodBlocksParameters<Curried extends boolean = false> = ActionParameters<
  {},
  'rollupAdminLogic',
  Curried
>;

export type GetConfirmPeriodBlocksReturnType = ReadContractReturnType<
  typeof rollupAdminLogic.abi,
  'confirmPeriodBlocks'
>;

export async function getConfirmPeriodBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetConfirmPeriodBlocksParameters,
): Promise<GetConfirmPeriodBlocksReturnType> {
  const rollupAdminLogicAddresss = await getRollupAddress(client, args);
  return client.readContract({
    abi: rollupAdminLogic.abi,
    functionName: 'confirmPeriodBlocks',
    address: rollupAdminLogicAddresss,
  });
}
