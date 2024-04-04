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

export type SequencerInboxActions<TChain extends Chain | undefined = Chain | undefined> = {
  sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxReadContractParameters<TFunctionName>,
  ) => Promise<SequencerInboxReadContractReturnType<TFunctionName>>;

  sequencerInboxPrepareTransactionRequest: (
    args: SequencerInboxPrepareTransactionRequestParameters,
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
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  sequencerInbox: CoreContracts['sequencerInbox'],
): (client: PublicClient<TTransport, TChain>) => SequencerInboxActions<TChain> {
  return function sequencerInboxActionsWithSequencerInbox(
    client: PublicClient<TTransport, TChain>,
  ): SequencerInboxActions<TChain> {
    return {
      sequencerInboxReadContract: (args) =>
        sequencerInboxReadContract(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        }),

      sequencerInboxPrepareTransactionRequest: (args) =>
        sequencerInboxPrepareTransactionRequest(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        }),
    };
  };
}
