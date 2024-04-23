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
import { ArbOSVersions } from '../contracts';

export type ArbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>>(
    args: ArbOwnerReadContractParameters<TArbOsVersion, TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TArbOsVersion, TFunctionName>>;

  arbOwnerPrepareTransactionRequest: <
    TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>({ arbOSVersion }: { arbOSVersion: TArbOsVersion }) {
  return (
    client: PublicClient<TTransport, TChain>,
  ): ArbOwnerPublicActions<TArbOsVersion, TChain> => {
    return {
      arbOwnerReadContract: (args) => arbOwnerReadContract(client, { ...args, arbOSVersion }),

      arbOwnerPrepareTransactionRequest: (args) =>
        arbOwnerPrepareTransactionRequest(client, { ...args, arbOSVersion }),
    };
  };
}
