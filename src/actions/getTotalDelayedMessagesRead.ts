import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'totalDelayedMessagesRead'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetTotalDelayedMessagesReadParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetTotalDelayedMessagesReadActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetTotalDelayedMessagesReadReturnType = ReadContractReturnType<
  SequencerInboxABI,
  'totalDelayedMessagesRead'
>;

export async function getTotalDelayedMessagesRead<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetTotalDelayedMessagesReadParameters,
): Promise<GetTotalDelayedMessagesReadReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'totalDelayedMessagesRead',
    address: args.sequencerInbox,
  });
}
