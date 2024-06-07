import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient, Address } from 'viem';

import {
  rollupAdminLogicReadContract,
  RollupAdminLogicFunctionName,
  RollupAdminLogicReadContractParameters,
  RollupAdminLogicReadContractReturnType,
} from '../rollupAdminLogicReadContract';
import {
  rollupAdminLogicPrepareTransactionRequest,
  RollupAdminLogicPrepareTransactionRequestParameters,
} from '../rollupAdminLogicPrepareTransactionRequest';

type RollupAdminLogicReadContractArgs<
  TRollupAdminLogic extends Address | undefined,
  TFunctionName extends RollupAdminLogicFunctionName,
> = TRollupAdminLogic extends Address
  ? Omit<RollupAdminLogicReadContractParameters<TFunctionName>, 'rollup'> & {
      rollup?: Address;
    }
  : RollupAdminLogicReadContractParameters<TFunctionName>;
type rollupAdminLogicPrepareTransactionRequestArgs<
  TRollupAdminLogic extends Address | undefined,
  TFunctionName extends RollupAdminLogicFunctionName,
> = TRollupAdminLogic extends Address
  ? Omit<RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>, 'rollup'> & {
      rollup?: Address;
    }
  : RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>;

export type RollupAdminLogicActions<
  TRollupAdminLogic extends Address | undefined,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /**
   * Reads data from the RollupAdminLogic contract.
   *
   * @template TFunctionName - The name of the function to call on the RollupAdminLogic contract.
   * @param {RollupAdminLogicReadContractArgs<TRollupAdminLogic, TFunctionName>} args - The arguments for reading the contract.
   * @param {Address} [args.rollup] - The address of the RollupAdminLogic contract (optional).
   * @returns {Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>} - The result of the contract call.
   */
  rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: RollupAdminLogicReadContractArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>;

  /**
   * Prepares a transaction request for the RollupAdminLogic contract.
   *
   * @template TFunctionName - The name of the function to call on the RollupAdminLogic contract.
   * @param {rollupAdminLogicPrepareTransactionRequestArgs<TRollupAdminLogic, TFunctionName>} args - The arguments for preparing the transaction request.
   * @param {Address} [args.rollup] - The address of the RollupAdminLogic contract (optional).
   * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - The prepared transaction request.
   */
  rollupAdminLogicPrepareTransactionRequest: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: rollupAdminLogicPrepareTransactionRequestArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * Creates an object containing public actions for interacting with the RollupAdminLogic contract.
 *
 * @template TParams - The parameters for creating the public actions.
 * @template TTransport - The transport type for the public client.
 * @template TChain - The chain type for the public client.
 * @param {Object} params - The parameters for creating the public actions.
 * @param {Address} [params.rollup] - The address of the RollupAdminLogic contract (optional).
 * @returns {(client: PublicClient<TTransport, TChain>) => RollupAdminLogicActions<TParams['rollup'], TChain>} - A function that takes a public client and returns the public actions.
 */
export function rollupAdminLogicPublicActions<
  TParams extends { rollup?: Address },
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
>({
  rollup,
}: TParams): (
  client: PublicClient<TTransport, TChain>,
) => RollupAdminLogicActions<TParams['rollup'], TChain> {
  return function rollupAdminLogicActionsWithRollupAdminLogicAddress(
    client: PublicClient<TTransport, TChain>,
  ) {
    const rollupAdminLogicExtensions: RollupAdminLogicActions<TParams['rollup'], TChain> = {
      /**
       * Reads data from the RollupAdminLogic contract.
       *
       * @template TFunctionName - The name of the function to call on the RollupAdminLogic contract.
       * @param {RollupAdminLogicReadContractArgs<TParams['rollup'], TFunctionName>} args - The arguments for reading the contract.
       * @param {Address} [args.rollup] - The address of the RollupAdminLogic contract (optional).
       * @returns {Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>} - The result of the contract call.
       */
      rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
        args: RollupAdminLogicReadContractArgs<TParams['rollup'], TFunctionName>,
      ) => {
        return rollupAdminLogicReadContract(client, {
          ...args,
          rollup: args.rollup || rollup,
        } as RollupAdminLogicReadContractParameters<TFunctionName>);
      },
      /**
       * Prepares a transaction request for the RollupAdminLogic contract.
       *
       * @template TFunctionName - The name of the function to call on the RollupAdminLogic contract.
       * @param {rollupAdminLogicPrepareTransactionRequestArgs<TParams['rollup'], TFunctionName>} args - The arguments for preparing the transaction request.
       * @param {Address} [args.rollup] - The address of the RollupAdminLogic contract (optional).
       * @returns {Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>} - The prepared transaction request.
       */
      rollupAdminLogicPrepareTransactionRequest: <
        TFunctionName extends RollupAdminLogicFunctionName,
      >(
        args: rollupAdminLogicPrepareTransactionRequestArgs<TParams['rollup'], TFunctionName>,
      ) => {
        return rollupAdminLogicPrepareTransactionRequest(client, {
          ...args,
          rollup: args.rollup || rollup,
        } as RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>);
      },
    };
    return rollupAdminLogicExtensions;
  };
}
