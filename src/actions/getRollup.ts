import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'rollup'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetRollupParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetRollupActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetRollupReturnType = ReadContractReturnType<SequencerInboxABI, 'rollup'>;

export async function getRollup<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetRollupParameters,
): Promise<GetRollupReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'rollup',
    address: args.sequencerInbox,
  });
}
