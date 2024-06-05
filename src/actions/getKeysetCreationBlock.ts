import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'getKeysetCreationBlock'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetKeysetCreationBlockParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetKeysetCreationBlockActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetKeysetCreationBlockReturnType = ReadContractReturnType<
  SequencerInboxABI,
  'getKeysetCreationBlock'
>;

export async function getKeysetCreationBlock<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetKeysetCreationBlockParameters,
): Promise<GetKeysetCreationBlockReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'getKeysetCreationBlock',
    address: args.sequencerInbox,
    args: args.args,
  });
}
