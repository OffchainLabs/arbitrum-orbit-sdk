import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithContractAddress } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'bridge'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type GetBridgeParameters<Curried extends boolean = false> = WithContractAddress<
  Args,
  'sequencerInbox',
  Curried
>;
export type GetBridgeActionParameters<Curried extends boolean> = ActionParameters<
  Args,
  'sequencerInbox',
  Curried
>;

export type GetBridgeReturnType = ReadContractReturnType<SequencerInboxABI, 'bridge'>;

export async function getBridge<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: GetBridgeParameters,
): Promise<GetBridgeReturnType> {
  return client.readContract({
    abi: sequencerInbox.abi,
    functionName: 'bridge',
    address: args.sequencerInbox,
  });
}
