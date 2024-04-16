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
import { CoreContracts } from '../types/CoreContracts';

type SequencerInboxReadContractArgs<
  TSequencerInbox extends CoreContracts['sequencerInbox'] | undefined,
  TFunctionName extends SequencerInboxFunctionName,
> = TSequencerInbox extends CoreContracts['sequencerInbox']
  ? Omit<SequencerInboxReadContractParameters<TFunctionName>, 'sequencerInbox'> & {
      sequencerInbox?: CoreContracts['sequencerInbox'];
    }
  : SequencerInboxReadContractParameters<TFunctionName>;
type SequencerInboxPrepareTransactionRequestArgs<
  TSequencerInbox extends CoreContracts['sequencerInbox'] | undefined,
> = TSequencerInbox extends CoreContracts['sequencerInbox']
  ? Omit<SequencerInboxPrepareTransactionRequestParameters, 'sequencerInbox'> & {
      sequencerInbox?: CoreContracts['sequencerInbox'];
    }
  : SequencerInboxPrepareTransactionRequestParameters;

export type SequencerInboxActions<
  TSequencerInbox extends CoreContracts['sequencerInbox'] | undefined,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxReadContractArgs<TSequencerInbox, TFunctionName>,
  ) => Promise<SequencerInboxReadContractReturnType<TFunctionName>>;

  sequencerInboxPrepareTransactionRequest: (
    args: SequencerInboxPrepareTransactionRequestArgs<TSequencerInbox>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
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
  TSequencerInbox extends CoreContracts['sequencerInbox'] | undefined,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(sequencerInbox: TSequencerInbox) {
  return function sequencerInboxActionsWithSequencerInbox(
    client: PublicClient<TTransport, TChain>,
  ) {
    const sequencerInboxExtensions: SequencerInboxActions<TSequencerInbox, TChain> = {
      sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
        args: SequencerInboxReadContractArgs<TSequencerInbox, TFunctionName>,
      ) => {
        return sequencerInboxReadContract(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        } as SequencerInboxReadContractParameters<TFunctionName>);
      },
      sequencerInboxPrepareTransactionRequest: (
        args: SequencerInboxPrepareTransactionRequestArgs<TSequencerInbox>,
      ) => {
        return sequencerInboxPrepareTransactionRequest(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        } as SequencerInboxPrepareTransactionRequestParameters);
      },
    };
    return sequencerInboxExtensions;
  };
}
