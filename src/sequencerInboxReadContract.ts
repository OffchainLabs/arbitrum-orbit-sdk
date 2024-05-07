import {
  Address,
  Chain,
  ContractFunctionArgs,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { sequencerInbox } from './contracts';

import { GetReadContractFunctionName } from './types/utils';

export type SequencerInboxAbi = typeof sequencerInbox.abi;
export type SequencerInboxFunctionName = GetReadContractFunctionName<SequencerInboxAbi>;

type SequencerInboxContractArgs<TFunctionName extends SequencerInboxFunctionName> =
  ContractFunctionArgs<SequencerInboxAbi, 'pure' | 'view', TFunctionName>;

export type SequencerInboxReadContractParameters<
  TFunctionName extends SequencerInboxFunctionName,
  TArgs extends SequencerInboxContractArgs<TFunctionName> = SequencerInboxContractArgs<TFunctionName>,
> = Omit<ReadContractParameters<SequencerInboxAbi, TFunctionName, TArgs>, 'abi' | 'address'> & {
  sequencerInbox: Address;
};
export type SequencerInboxReadContractReturnType<
  TFunctionName extends SequencerInboxFunctionName,
  TArgs extends SequencerInboxContractArgs<TFunctionName> = SequencerInboxContractArgs<TFunctionName>,
> = ReadContractReturnType<SequencerInboxAbi, TFunctionName, TArgs>;

export function sequencerInboxReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends SequencerInboxFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: SequencerInboxReadContractParameters<TFunctionName>,
): Promise<SequencerInboxReadContractReturnType<TFunctionName>> {
  return client.readContract({
    address: params.sequencerInbox,
    abi: sequencerInbox.abi,
    functionName: params.functionName,
    args: params.args,
  } as unknown as ReadContractParameters<SequencerInboxAbi, TFunctionName>);
}
