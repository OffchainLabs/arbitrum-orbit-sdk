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
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName>(
    args: ArbOwnerReadContractParameters<TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TFunctionName>>;

  arbOwnerPrepareTransactionRequest: <
    TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Returns an object with two functions: `arbOwnerReadContract` and
 * `arbOwnerPrepareTransactionRequest`, which interact with the ArbOwner
 * contract by reading contract data and preparing transaction requests,
 * respectively.
 *
 * @param {PublicClient} client - The public client used to interact with the blockchain.
 *
 * @returns {ArbOwnerPublicActions} An object containing the functions to read contract data and prepare transaction requests.
 *
 * @example
 * const publicClient = new PublicClient(...);
 * const actions = arbOwnerPublicActions(publicClient);
 *
 * const readResult = await actions.arbOwnerReadContract({
 *   functionName: 'someFunction',
 *   args: [...],
 * });
 *
 * const txRequest = await actions.arbOwnerPrepareTransactionRequest({
 *   functionName: 'someOtherFunction',
 *   args: [...],
 * });
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
