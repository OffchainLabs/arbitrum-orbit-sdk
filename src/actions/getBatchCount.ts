import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'batchCount'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetBatchCountParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetBatchCountActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetBatchCountReturnType = ReadContractReturnType<SequencerInboxABI, 'batchCount'>;

export async function getBatchCount<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetBatchCountParameters,
): Promise<GetBatchCountReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'batchCount',
    address: args.sequencerInbox,
  });
}
