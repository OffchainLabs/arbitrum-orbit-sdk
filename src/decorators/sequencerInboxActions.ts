import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient, Address } from 'viem';

import {
  sequencerInboxReadContract,
  SequencerInboxReadContractParameters,
  SequencerInboxReadContractReturnType,
} from '../sequencerInboxReadContract';
import {
  SequencerInboxFunctionName,
  sequencerInboxPrepareTransactionRequest,
  SequencerInboxPrepareTransactionRequestParameters,
} from '../sequencerInboxPrepareTransactionRequest';

type SequencerInboxReadContractArgs<
  TSequencerInbox extends Address | undefined,
  TFunctionName extends SequencerInboxFunctionName,
> = TSequencerInbox extends Address
  ? Omit<SequencerInboxReadContractParameters<TFunctionName>, 'sequencerInbox'> & {
      sequencerInbox?: Address;
    }
  : SequencerInboxReadContractParameters<TFunctionName>;
type SequencerInboxPrepareTransactionRequestArgs<
  TSequencerInbox extends Address | undefined,
  TFunctionName extends SequencerInboxFunctionName,
> = TSequencerInbox extends Address
  ? Omit<SequencerInboxPrepareTransactionRequestParameters<TFunctionName>, 'sequencerInbox'> & {
      sequencerInbox?: Address;
    }
  : SequencerInboxPrepareTransactionRequestParameters<TFunctionName>;

export type SequencerInboxActions<
  TSequencerInbox extends Address | undefined,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /**
   * Reads data from the sequencerInbox contract
   *
   * @param {SequencerInboxReadContractArgs<TSequencerInbox, TFunctionName>} args - Arguments for reading the contract
   * @returns {Promise<SequencerInboxReadContractReturnType<TFunctionName>>} - The data read from the contract
   */
  sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxReadContractArgs<TSequencerInbox, TFunctionName>,
  ) => Promise<SequencerInboxReadContractReturnType<TFunctionName>>;

  /**
   * Prepares a transaction request for the sequencerInbox contract
   *
   * @param {SequencerInboxPrepareTransactionRequestArgs<TSequencerInbox, TFunctionName>} args - Arguments for preparing the transaction request
   * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - The prepared transaction request
   */
  sequencerInboxPrepareTransactionRequest: <TFunctionName extends SequencerInboxFunctionName>(
    args: SequencerInboxPrepareTransactionRequestArgs<TSequencerInbox, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Set of actions that can be performed on the sequencerInbox contract through wagmi public client
 *
 * @param {Object} params - Parameters object
 * @param {Address} params.sequencerInbox - Address of the sequencerInbox core contract
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
  TChain extends Chain | undefined = Chain | undefined,
>({ sequencerInbox }: TParams) {
  return function sequencerInboxActionsWithSequencerInbox(
    client: PublicClient<TTransport, TChain>,
  ) {
    const sequencerInboxExtensions: SequencerInboxActions<TParams['sequencerInbox'], TChain> = {
      /**
       * Reads data from the sequencerInbox contract
       *
       * @param {SequencerInboxReadContractArgs<TParams['sequencerInbox'], TFunctionName>} args - Arguments for reading the contract
       * @returns {Promise<SequencerInboxReadContractReturnType<TFunctionName>>} - The data read from the contract
       */
      sequencerInboxReadContract: <TFunctionName extends SequencerInboxFunctionName>(
        args: SequencerInboxReadContractArgs<TParams['sequencerInbox'], TFunctionName>,
      ) => {
        return sequencerInboxReadContract(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        } as SequencerInboxReadContractParameters<TFunctionName>);
      },
      /**
       * Prepares a transaction request for the sequencerInbox contract
       *
       * @param {SequencerInboxPrepareTransactionRequestArgs<TParams['sequencerInbox'], TFunctionName>} args - Arguments for preparing the transaction request
       * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - The prepared transaction request
       */
      sequencerInboxPrepareTransactionRequest: <TFunctionName extends SequencerInboxFunctionName>(
        args: SequencerInboxPrepareTransactionRequestArgs<TParams['sequencerInbox'], TFunctionName>,
      ) => {
        return sequencerInboxPrepareTransactionRequest(client, {
          ...args,
          sequencerInbox: args.sequencerInbox || sequencerInbox,
        } as SequencerInboxPrepareTransactionRequestParameters<TFunctionName>);
      },
    };
    return sequencerInboxExtensions;
  };
}
