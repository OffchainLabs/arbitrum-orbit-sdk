import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'maxTimeVariation'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetMaxTimeVariationParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetMaxTimeVariationActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetMaxTimeVariationReturnType = ReadContractReturnType<
  SequencerInboxABI,
  'maxTimeVariation'
>;

export async function getMaxTimeVariation<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetMaxTimeVariationParameters,
): Promise<GetMaxTimeVariationReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'maxTimeVariation',
    address: args.sequencerInbox,
  });
}
