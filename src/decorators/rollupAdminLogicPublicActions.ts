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

export type RollupAdminLogicActions<TChain extends Chain | undefined = Chain> = {
  rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: RollupAdminLogicReadContractParameters<TFunctionName> & { rollupAddress: Address },
  ) => Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>;

  rollupAdminLogicPrepareTransactionRequest: (
    args: RollupAdminLogicPrepareTransactionRequestParameters,
  ) => Promise<PrepareTransactionRequestReturnType<TChain>>;
};

export function rollupAdminLogicPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
>(client: PublicClient<TTransport, TChain>): RollupAdminLogicActions<TChain> {
  return {
    rollupAdminLogicReadContract: (args) => rollupAdminLogicReadContract(client, args),

    rollupAdminLogicPrepareTransactionRequest: (args) =>
      rollupAdminLogicPrepareTransactionRequest(client, args),
  };
}
