import {
  Address,
  Chain,
  GetFunctionArgs,
  PublicClient,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { sequencerInbox } from './contracts';
import {
  SequencerInboxAbi,
  SequencerInboxFunctionName,
} from './sequencerInboxPrepareTransactionRequest';

export type SequencerInboxReadContractParameters<TFunctionName extends SequencerInboxFunctionName> =
  {
    functionName: TFunctionName;
    // SequencerInbox address is different for each rollup, so user needs to pass it as a parameter
    sequencerInbox: Address;
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
