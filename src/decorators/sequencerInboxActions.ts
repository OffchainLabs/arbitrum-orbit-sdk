import { Transport, Chain, PublicClient, Address } from 'viem';

import {
  sequencerInboxReadContract,
  SequencerInboxFunctionName,
  SequencerInboxReadContractParameters,
  SequencerInboxReadContractReturnType,
} from '../sequencerInboxReadContract';
import {
  sequencerInboxPrepareTransactionRequest,
  SequencerInboxPrepareTransactionRequestParameters,
  SequencerInboxPrepareTransactionRequestReturnType,
  SequencerInboxPrepareTransactionRequestFunctionName,
} from '../sequencerInboxPrepareTransactionRequest';

type SequencerInboxReadContractArgs<
  TSequencerInbox extends Address | undefined,
  TFunctionName extends SequencerInboxFunctionName,
> = TSequencerInbox extends Address
  ? Omit<SequencerInboxReadContractParameters<TFunctionName>, 'sequencerInbox'> & {
      sequencerInbox?: Address;
    }
  : SequencerInboxReadContractParameters<TFunctionName>;
type sequencerInboxPrepareTransactionRequestArgs<
  TSequencerInbox extends Address | undefined,
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
> = TSequencerInbox extends Address
  ? Omit<SequencerInboxPrepareTransactionRequestParameters<TFunctionName>, 'sequencerInbox'> & {
      sequencerInbox?: Address;
    }
  : SequencerInboxPrepareTransactionRequestParameters<TFunctionName>;

export type SequencerInboxActions<
  TSequencerInbox extends Address | undefined,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxReadContractArgs<TSequencerInbox, TFunctionName>,
  ) => Promise<SequencerInboxReadContractReturnType<TFunctionName>>;

  sequencerInboxPrepareTransactionRequest: <
    TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
  >(
    args: sequencerInboxPrepareTransactionRequestArgs<TSequencerInbox, TFunctionName>,
  ) => Promise<SequencerInboxPrepareTransactionRequestReturnType<TChain>>;
};

export function sequencerInboxActions<
  TParams extends { sequencerInbox?: Address },
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
>({
  sequencerInbox,
}: TParams): (
  client: PublicClient<TTransport, TChain>,
) => SequencerInboxActions<TParams['sequencerInbox'], TChain> {
  return function sequencerInboxActionsWithSequencerInboxAddress(
    client: PublicClient<TTransport, TChain>,
  ) {
    const sequencerInboxExtensions: SequencerInboxActions<TParams['sequencerInbox'], TChain> = {
      sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
        args: SequencerInboxReadContractArgs<TParams['sequencerInbox'], TFunctionName>,
      ) => {
        return sequencerInboxReadContract(client, {
          ...args,
          sequencerInbox: sequencerInbox || args.sequencerInbox,
        } as SequencerInboxReadContractParameters<TFunctionName>);
      },
      sequencerInboxPrepareTransactionRequest: <
        TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
      >(
        args: sequencerInboxPrepareTransactionRequestArgs<TParams['sequencerInbox'], TFunctionName>,
      ) => {
        return sequencerInboxPrepareTransactionRequest(client, {
          ...args,
          sequencerInbox: sequencerInbox || args.sequencerInbox,
        } as SequencerInboxPrepareTransactionRequestParameters<TFunctionName>);
      },
    };
    return sequencerInboxExtensions;
  };
}
