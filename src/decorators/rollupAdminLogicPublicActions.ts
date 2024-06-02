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
   * Reads data from the Rollup Admin Logic smart contract.
   *
   * @param {RollupAdminLogicReadContractArgs} args - The arguments for reading the contract.
   * @param {Address} [args.rollup] - The optional rollup address.
   * @param {RollupAdminLogicFunctionName} args.functionName - The name of the function to call on the contract.
   * @returns {Promise<RollupAdminLogicReadContractReturnType>} - The data read from the contract.
   */
  rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: RollupAdminLogicReadContractArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>;

  /**
   * Prepares a transaction request for the Rollup Admin Logic smart contract.
   *
   * @param {rollupAdminLogicPrepareTransactionRequestArgs} args - The arguments for preparing the transaction request.
   * @param {Address} [args.rollup] - The optional rollup address.
   * @param {RollupAdminLogicFunctionName} args.functionName - The name of the function to call on the contract.
   * @returns {Promise<PrepareTransactionRequestReturnType & { chainId: number }>} - The prepared transaction request.
   */
  rollupAdminLogicPrepareTransactionRequest: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: rollupAdminLogicPrepareTransactionRequestArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

/**
 * The function rollupAdminLogicPublicActions returns a {@link
 * RollupAdminLogicActions} object that contains two methods:
 * rollupAdminLogicReadContract and rollupAdminLogicPrepareTransactionRequest.
 * These methods allow interacting with the Rollup Admin Logic smart contract by
 * reading contract data and preparing transaction requests.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Address} [params.rollup] - The optional rollup address.
 * @returns {(client: PublicClient) => RollupAdminLogicActions} - A function that takes a PublicClient and returns RollupAdminLogicActions.
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
      rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
        args: RollupAdminLogicReadContractArgs<TParams['rollup'], TFunctionName>,
      ) => {
        return rollupAdminLogicReadContract(client, {
          ...args,
          rollup: args.rollup || rollup,
        } as RollupAdminLogicReadContractParameters<TFunctionName>);
      },
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
