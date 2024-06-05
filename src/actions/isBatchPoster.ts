import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'isBatchPoster'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type IsBatchPosterParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type IsBatchPosterActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type IsBatchPosterReturnType = ReadContractReturnType<SequencerInboxABI, 'isBatchPoster'>;

export async function isBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: IsBatchPosterParameters,
): Promise<IsBatchPosterReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'isBatchPoster',
    address: args.sequencerInbox,
    args: args.args,
  });
}
