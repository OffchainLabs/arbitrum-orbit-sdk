import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient } from 'viem';

import {
  sequencerInboxReadContract,
  SequencerInboxFunctionName,
  SequencerInboxReadContractParameters,
  SequencerInboxReadContractReturnType,
} from '../sequencerInboxReadContract';
import {
  sequencerInboxPrepareTransactionRequest,
  SequencerInboxPrepareTransactionRequestParameters,
} from '../sequencerInboxPrepareTransactionRequest';

export type SequencerInboxActions<TChain extends Chain | undefined = Chain | undefined> = {
  sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxReadContractParameters<TFunctionName>,
  ) => Promise<SequencerInboxReadContractReturnType<TFunctionName>>;

  sequencerInboxPrepareTransactionRequest: (
    args: SequencerInboxPrepareTransactionRequestParameters,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

export function sequencerInboxActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): SequencerInboxActions<TChain> {
  return {
    sequencerInboxReadContract: (args) => sequencerInboxReadContract(client, args),

    sequencerInboxPrepareTransactionRequest: (args) =>
      sequencerInboxPrepareTransactionRequest(client, args),
  };
}
