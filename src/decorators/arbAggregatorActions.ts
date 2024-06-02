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
  arbAggregatorReadContract: <TFunctionName extends ArbAggregatorFunctionName>(
    args: ArbAggregatorReadContractParameters<TFunctionName>,
  ) => Promise<ArbAggregatorReadContractReturnType<TFunctionName>>;

  arbAggregatorPrepareTransactionRequest: <
    TFunctionName extends ArbAggregatorPrepareTransactionRequestFunctionName,
  >(
    args: ArbAggregatorPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Returns an object with methods to interact with the ArbAggregator smart contract on the specified chain.
 *
 * @param {PublicClient} client - The public client to use for interacting with the blockchain.
 * @returns {ArbAggregatorActions} An object containing methods to read from and prepare transaction requests for the ArbAggregator contract.
 */
export function arbAggregatorActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbAggregatorActions<TChain> {
  return {
    /**
     * Reads data from the ArbAggregator contract.
     *
     * @param {ArbAggregatorReadContractParameters} args - The parameters required to read from the contract.
     * @returns {Promise<ArbAggregatorReadContractReturnType>} The data read from the contract.
     */
    arbAggregatorReadContract: (args) => arbAggregatorReadContract(client, args),

    /**
     * Prepares a transaction request for the ArbAggregator contract.
     *
     * @param {ArbAggregatorPrepareTransactionRequestParameters} args - The parameters required to prepare the transaction request.
     * @returns {Promise<PrepareTransactionRequestReturnType & { chainId: number }>} The prepared transaction request and chain ID.
     */
    arbAggregatorPrepareTransactionRequest: (args) =>
      arbAggregatorPrepareTransactionRequest(client, args),
  };
}
