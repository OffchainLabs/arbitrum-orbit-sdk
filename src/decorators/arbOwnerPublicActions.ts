import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient } from 'viem';

import {
  arbOwnerReadContract,
  ArbOwnerPublicFunctionName,
  ArbOwnerReadContractParameters,
  ArbOwnerReadContractReturnType,
} from '../arbOwnerReadContract';
import {
  arbOwnerPrepareTransactionRequest,
  ArbOwnerPrepareTransactionRequestFunctionName,
  ArbOwnerPrepareTransactionRequestParameters,
} from '../arbOwnerPrepareTransactionRequest';

export type ArbOwnerPublicActions<TChain extends Chain | undefined = Chain | undefined> = {
  /**
   * Reads data from the ArbOwner contract.
   *
   * @template TFunctionName - The name of the function to read from the contract.
   * @param {ArbOwnerReadContractParameters<TFunctionName>} args - The parameters for reading the contract.
   * @returns {Promise<ArbOwnerReadContractReturnType<TFunctionName>>} - The return type of the contract function.
   */
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName>(
    args: ArbOwnerReadContractParameters<TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TFunctionName>>;

  /**
   * Prepares a transaction request for the ArbOwner contract.
   *
   * @template TFunctionName - The name of the function to prepare the transaction request for.
   * @param {ArbOwnerPrepareTransactionRequestParameters<TFunctionName>} args - The parameters for preparing the transaction request.
   * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - The prepared transaction request and chain ID.
   */
  arbOwnerPrepareTransactionRequest: <
    TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Creates an object with public actions for interacting with the ArbOwner contract.
 *
 * @template TTransport - The type of transport.
 * @template TChain - The type of chain.
 * @param {PublicClient<TTransport, TChain>} client - The public client to interact with the contract.
 * @returns {ArbOwnerPublicActions<TChain>} - The public actions for the ArbOwner contract.
 */
export function arbOwnerPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbOwnerPublicActions<TChain> {
  return {
    arbOwnerReadContract: (args) => arbOwnerReadContract(client, args),

    arbOwnerPrepareTransactionRequest: (args) => arbOwnerPrepareTransactionRequest(client, args),
  };
}
