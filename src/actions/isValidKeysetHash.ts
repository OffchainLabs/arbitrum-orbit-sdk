import { Chain, Hex, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters } from '../types/Actions';

type Args = {
  keysetHash: Hex;
};
type SequencerInboxABI = typeof sequencerInbox.abi;

export type IsValidKeysetHashParameters<Curried extends boolean = false> = ActionParameters<
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
    args: [args.keysetHash],
  });
}
