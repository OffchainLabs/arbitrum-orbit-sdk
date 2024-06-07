import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient } from 'viem';

import {
  arbAggregatorReadContract,
  ArbAggregatorFunctionName,
  ArbAggregatorReadContractParameters,
  ArbAggregatorReadContractReturnType,
} from '../arbAggregatorReadContract';
import {
  arbAggregatorPrepareTransactionRequest,
  ArbAggregatorPrepareTransactionRequestFunctionName,
  ArbAggregatorPrepareTransactionRequestParameters,
} from '../arbAggregatorPrepareTransactionRequest';

export type ArbAggregatorActions<TChain extends Chain | undefined = Chain | undefined> = {
  /**
   * Reads data from the ArbAggregator contract.
   *
   * @template TFunctionName - The name of the function to call on the contract.
   * @param {ArbAggregatorReadContractParameters<TFunctionName>} args - The parameters for the read contract function.
   * @returns {Promise<ArbAggregatorReadContractReturnType<TFunctionName>>} - A promise that resolves to the return type of the read contract function.
   */
  arbAggregatorReadContract: <TFunctionName extends ArbAggregatorFunctionName>(
    args: ArbAggregatorReadContractParameters<TFunctionName>,
  ) => Promise<ArbAggregatorReadContractReturnType<TFunctionName>>;

  /**
   * Prepares a transaction request for the ArbAggregator contract.
   *
   * @template TFunctionName - The name of the function to call on the contract.
   * @param {ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>} args - The parameters for the transaction request preparation function.
   * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - A promise that resolves to the transaction request return type with the chain ID.
   */
  arbAggregatorPrepareTransactionRequest: <
    TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
  >(
    args: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Creates an object containing functions to interact with the ArbAggregator contract.
 *
 * @template TTransport - The type of transport used by the public client.
 * @template TChain - The type of chain or undefined.
 * @param {PublicClient<TTransport, TChain>} client - The public client used to interact with the blockchain.
 * @returns {ArbAggregatorActions<TChain>} - An object containing the functions to read from and prepare transaction requests for the ArbAggregator contract.
 */
export function arbAggregatorActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbAggregatorActions<TChain> {
  return {
    /**
     * Reads data from the ArbAggregator contract.
     *
     * @template TFunctionName - The name of the function to call on the contract.
     * @param {ArbAggregatorReadContractParameters<TFunctionName>} args - The parameters for the read contract function.
     * @returns {Promise<ArbAggregatorReadContractReturnType<TFunctionName>>} - A promise that resolves to the return type of the read contract function.
     */
    arbAggregatorReadContract: (args) => arbAggregatorReadContract(client, args),

    /**
     * Prepares a transaction request for the ArbAggregator contract.
     *
     * @template TFunctionName - The name of the function to call on the contract.
     * @param {ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>} args - The parameters for the transaction request preparation function.
     * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - A promise that resolves to the transaction request return type with the chain ID.
     */
    arbAggregatorPrepareTransactionRequest: (args) =>
      arbAggregatorPrepareTransactionRequest(client, args),
  };
}
