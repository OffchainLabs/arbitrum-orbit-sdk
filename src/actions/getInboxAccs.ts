import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'inboxAccs'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetInboxAccsParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetInboxAccsActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetInboxAccsReturnType = ReadContractReturnType<SequencerInboxABI, 'inboxAccs'>;

export async function getInboxAccs<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetInboxAccsParameters,
): Promise<GetInboxAccsReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'inboxAccs',
    address: args.sequencerInbox,
    args: args.args,
  });
}
