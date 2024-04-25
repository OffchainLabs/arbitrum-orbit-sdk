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
import { CoreContracts } from '../types/CoreContracts';

type WrapWithRollupAdminLogicAddress<
  TArgs extends Object,
  TAddress extends Address | undefined,
> = TAddress extends Address
  ? TArgs & {
      // If the Contract was passed to the actions, it's now optional for each call
      rollupAdminLogicAddress?: Address;
    }
  : TArgs & {
      rollupAdminLogicAddress: Address;
    };

export type RollupAdminLogicActions<
  TRollupAdminLogicAddress extends CoreContracts['rollup'] | undefined,
  TChain extends Chain | undefined = Chain,
> = {
  rollupAdminLogicReadContract: <TFunctionName extends RollupAdminLogicFunctionName>(
    args: WrapWithRollupAdminLogicAddress<
      RollupAdminLogicReadContractParameters<TFunctionName>,
      TRollupAdminLogicAddress
    >,
  ) => Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>;

  rollupAdminLogicPrepareTransactionRequest: (
    args: WrapWithRollupAdminLogicAddress<
      RollupAdminLogicPrepareTransactionRequestParameters,
      TRollupAdminLogicAddress
    >,
  ) => Promise<PrepareTransactionRequestReturnType<TChain>>;
};

export function rollupAdminLogicPublicActions<
  TRollupAdminLogicAddress extends CoreContracts['rollup'] | undefined,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
>({
  rollupAdminLogicAddress,
}: {
  rollupAdminLogicAddress: TRollupAdminLogicAddress;
}): (
  client: PublicClient<TTransport, TChain>,
) => RollupAdminLogicActions<TRollupAdminLogicAddress, TChain> {
  return (client) => {
    return {
      rollupAdminLogicReadContract: (args) => {
        // rollupAdminLogicAddress is either passed initially, or mandatory when user call this function
        const contractAddress = (args.rollupAdminLogicAddress ||
          rollupAdminLogicAddress) as unknown as Address;
        return rollupAdminLogicReadContract(client, {
          ...args,
          rollupAdminLogicAddress: contractAddress,
        });
      },
      rollupAdminLogicPrepareTransactionRequest: (args) => {
        // rollupAdminLogicAddress is either passed initially, or mandatory when user call this function
        const contractAddress = (args.rollupAdminLogicAddress ||
          rollupAdminLogicAddress) as unknown as Address;
        return rollupAdminLogicPrepareTransactionRequest(client, {
          ...args,
          rollupAdminLogicAddress: contractAddress,
        });
      },
    };
  };
}
