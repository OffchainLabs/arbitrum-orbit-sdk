import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'HEADER_LENGTH'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetHeaderLengthParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetHeaderLengthActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetHeaderLengthReturnType = ReadContractReturnType<SequencerInboxABI, 'HEADER_LENGTH'>;

export async function getHeaderLength<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetHeaderLengthParameters,
): Promise<GetHeaderLengthReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'HEADER_LENGTH',
    address: args.sequencerInbox,
  });
}
