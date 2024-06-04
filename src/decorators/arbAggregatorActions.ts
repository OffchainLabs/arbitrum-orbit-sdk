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
 * arbAggregatorActions returns an object with two methods:
 * arbAggregatorReadContract and arbAggregatorPrepareTransactionRequest. The
 * arbAggregatorReadContract method takes arguments related to a specific
 * function name and returns a Promise with the corresponding return type. The
 * arbAggregatorPrepareTransactionRequest method takes arguments related to a
 * specific function name and returns a Promise with the
 * PrepareTransactionRequestReturnType along with the chainId.
 */
export function arbAggregatorActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbAggregatorActions<TChain> {
  return {
    arbAggregatorReadContract: (args) => arbAggregatorReadContract(client, args),

    arbAggregatorPrepareTransactionRequest: (args) =>
      arbAggregatorPrepareTransactionRequest(client, args),
  };
}
