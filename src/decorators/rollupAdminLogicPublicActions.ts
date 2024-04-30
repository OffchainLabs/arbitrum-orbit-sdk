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
  ? Omit<RollupAdminLogicReadContractParameters<TFunctionName>, 'rollupAdminLogic'> & {
      rollupAdminLogic?: Address;
    }
  : RollupAdminLogicReadContractParameters<TFunctionName>;
type rollupAdminLogicPrepareTransactionRequestArgs<
  TRollupAdminLogic extends Address | undefined,
  TFunctionName extends RollupAdminLogicFunctionName,
> = TRollupAdminLogic extends Address
  ? Omit<RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>, 'rollupAdminLogic'> & {
      rollupAdminLogic?: Address;
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
  TParams extends { rollupAdminLogic?: Address },
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
>({
  rollupAdminLogic,
}: TParams): (
  client: PublicClient<TTransport, TChain>,
) => RollupAdminLogicActions<TParams['rollupAdminLogic'], TChain> {
  return function rollupAdminLogicActionsWithRollupAdminLogicAddress(
    client: PublicClient<TTransport, TChain>,
  ) {
    const rollupAdminLogicExtensions: RollupAdminLogicActions<TParams['rollupAdminLogic'], TChain> =
      {
        rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
          args: RollupAdminLogicReadContractArgs<TParams['rollupAdminLogic'], TFunctionName>,
        ) => {
          return rollupAdminLogicReadContract(client, {
            ...args,
            rollupAdminLogic: rollupAdminLogic || args.rollupAdminLogic,
          } as RollupAdminLogicReadContractParameters<TFunctionName>);
        },
        rollupAdminLogicPrepareTransactionRequest: <
          TFunctionName extends RollupAdminLogicFunctionName,
        >(
          args: rollupAdminLogicPrepareTransactionRequestArgs<
            TParams['rollupAdminLogic'],
            TFunctionName
          >,
        ) => {
          return rollupAdminLogicPrepareTransactionRequest(client, {
            ...args,
            rollupAdminLogic: rollupAdminLogic || args.rollupAdminLogic,
          } as RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>);
        },
      };
    return rollupAdminLogicExtensions;
  };
}
