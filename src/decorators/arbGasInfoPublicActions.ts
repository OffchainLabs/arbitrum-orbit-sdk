import { Transport, Chain, PublicClient } from 'viem';

import {
  arbGasInfoReadContract,
  ArbGasInfoFunctionName,
  ArbGasInfoReadContractParameters,
  ArbGasInfoReadContractReturnType,
} from '../arbGasInfoReadContract';

export type ArbGasInfoPublicActions<TChain extends Chain | undefined = Chain | undefined> = {
  arbGasInfoReadContract: <TFunctionName extends ArbGasInfoFunctionName>(
    args: ArbGasInfoReadContractParameters<TFunctionName>,
  ) => Promise<ArbGasInfoReadContractReturnType<TFunctionName>>;
};

/**
 * Returns an object with a method `arbGasInfoReadContract` that allows for
 * reading contract information related to gas costs on the Arbitrum network.
 *
 * @template TTransport - The type of transport used by the PublicClient.
 * @template TChain - The type of chain, can be defined or undefined.
 * @param {PublicClient<TTransport, TChain>} client - The public client for the specified transport and chain.
 * @returns {ArbGasInfoPublicActions<TChain>} An object containing the `arbGasInfoReadContract` method.
 */
export function arbGasInfoPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbGasInfoPublicActions<TChain> {
  return {
    /**
     * Reads contract information related to gas costs on the Arbitrum network.
     *
     * @param {ArbGasInfoReadContractParameters<TFunctionName>} args - The parameters for reading the contract.
     * @returns {Promise<ArbGasInfoReadContractReturnType<TFunctionName>>} The result of the contract read operation.
     */
    arbGasInfoReadContract: (args) => arbGasInfoReadContract(client, args),
  };
}
