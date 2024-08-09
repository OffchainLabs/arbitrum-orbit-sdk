import { Address, Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters } from '../types/Actions';

type Args = {
  batchPoster: Address;
};
type SequencerInboxABI = typeof sequencerInbox.abi;
export type IsBatchPosterParameters<Curried extends boolean = false> = ActionParameters<
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
    args: [args.batchPoster],
  });
}
