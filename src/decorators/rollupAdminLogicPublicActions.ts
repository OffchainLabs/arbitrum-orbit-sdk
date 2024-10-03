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
  rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: RollupAdminLogicReadContractArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>;

  rollupAdminLogicPrepareTransactionRequest: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: rollupAdminLogicPrepareTransactionRequestArgs<TRollupAdminLogic, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

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
