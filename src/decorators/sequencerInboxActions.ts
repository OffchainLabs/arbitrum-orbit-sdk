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

/**
 * Set of actions that can be performed on the sequencerInbox contract through wagmi public client
 *
 * @param {Object} sequencerInbox - Address of the sequencerInbox core contract
 * User can still overrides sequencerInbox address,
 * by passing it as an argument to sequencerInboxReadContract/sequencerInboxPrepareTransactionRequest calls
 *
 * @returns {Function} sequencerInboxActionsWithSequencerInbox - Function passed to client.extends() to extend the public client
 *
 * @example
 * const client = createPublicClient({
 *   chain: arbitrumOne,
 *   transport: http(),
 * }).extend(sequencerInboxActions(coreContracts.sequencerInbox));
 *
 * // SequencerInbox is set to `coreContracts.sequencerInbox` for every call
 * client.sequencerInboxReadContract({
 *   functionName: 'inboxAccs',
 * });
 *
 * // Overriding sequencerInbox address for this call only
 * client.sequencerInboxReadContract({
 *   functionName: 'inboxAccs',
 *   sequencerInbox: contractAddress.anotherSequencerInbox
 * });
 */
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
