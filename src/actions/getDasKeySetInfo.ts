import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'dasKeySetInfo'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetDasKeySetInfoParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetDasKeySetInfoActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetDasKeySetInfoReturnType = ReadContractReturnType<SequencerInboxABI, 'dasKeySetInfo'>;

export async function getDasKeySetInfo<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetDasKeySetInfoParameters,
): Promise<GetDasKeySetInfoReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'dasKeySetInfo',
    address: args.sequencerInbox,
    args: args.args,
  });
}
