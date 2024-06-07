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
 * Creates an object with public actions for interacting with the ArbGasInfo contract.
 *
 * @template TTransport - The type of transport being used by the client.
 * @template TChain - The type of chain or undefined.
 * @param {PublicClient<TTransport, TChain>} client - The public client instance used to interact with the contract.
 * @returns {ArbGasInfoPublicActions<TChain>} An object containing methods to interact with the ArbGasInfo contract.
 */
export function arbGasInfoPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbGasInfoPublicActions<TChain> {
  return {
    /**
     * Reads data from the ArbGasInfo contract.
     *
     * @template TFunctionName - The name of the function being called on the ArbGasInfo contract.
     * @param {ArbGasInfoReadContractParameters<TFunctionName>} args - The parameters for the contract function call.
     * @returns {Promise<ArbGasInfoReadContractReturnType<TFunctionName>>} The return type of the contract function call.
     */
    arbGasInfoReadContract: (args) => arbGasInfoReadContract(client, args),
  };
}
