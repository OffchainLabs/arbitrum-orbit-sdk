import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'DATA_AUTHENTICATED_FLAG'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetDataAuthenticatedFlagParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetDataAuthenticatedFlagActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetDataAuthenticatedFlagReturnType = ReadContractReturnType<
  SequencerInboxABI,
  'DATA_AUTHENTICATED_FLAG'
>;

export async function getDataAuthenticatedFlag<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetDataAuthenticatedFlagParameters,
): Promise<GetDataAuthenticatedFlagReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'DATA_AUTHENTICATED_FLAG',
    address: args.sequencerInbox,
  });
}
