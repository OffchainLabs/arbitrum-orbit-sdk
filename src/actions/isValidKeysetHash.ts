import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'isValidKeysetHash'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type IsValidKeysetHashParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type IsValidKeysetHashActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type IsValidKeysetHashReturnType = ReadContractReturnType<
  SequencerInboxABI,
  'isValidKeysetHash'
>;

export async function isValidKeysetHash<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: IsValidKeysetHashParameters,
): Promise<IsValidKeysetHashReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'isValidKeysetHash',
    address: args.sequencerInbox,
    args: args.args,
  });
}
