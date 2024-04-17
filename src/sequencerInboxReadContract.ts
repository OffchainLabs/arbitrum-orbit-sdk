import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { sequencerInbox } from './contracts';
import { GetFunctionName } from './types/utils';
import { CoreContracts } from './types/CoreContracts';

export type SequencerInboxAbi = typeof sequencerInbox.abi;
export type SequencerInboxFunctionName = GetFunctionName<SequencerInboxAbi>;

export type SequencerInboxReadContractParameters<TFunctionName extends SequencerInboxFunctionName> =
  {
    functionName: TFunctionName;
    // SequencerInbox address is different for each rollup, so user needs to pass it as a parameter
    sequencerInbox: CoreContracts['sequencerInbox'];
  } & GetFunctionArgs<SequencerInboxAbi, TFunctionName>;

export type SequencerInboxReadContractReturnType<TFunctionName extends SequencerInboxFunctionName> =
  ReadContractReturnType<SequencerInboxAbi, TFunctionName>;

export function sequencerInboxReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends SequencerInboxFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: SequencerInboxReadContractParameters<TFunctionName>,
): Promise<SequencerInboxReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: params.sequencerInbox,
    abi: sequencerInbox.abi,
    functionName: params.functionName,
    args: params.args,
  });
}