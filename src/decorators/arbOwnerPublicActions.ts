import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient } from 'viem';

import {
  arbOwnerReadContract,
  ArbOwnerPublicFunctionName,
  ArbOwnerReadContractParameters,
  ArbOwnerReadContractReturnType,
} from '../arbOwnerReadContract';
import {
  arbOwnerPrepareTransactionRequest,
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
    TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TArbOsVersion, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>({ arbOsVersion }: { arbOsVersion: TArbOsVersion }) {
  return (
    client: PublicClient<TTransport, TChain>,
  ): ArbOwnerPublicActions<TArbOsVersion, TChain> => {
    return {
      arbOwnerReadContract: (args) => arbOwnerReadContract(client, { ...args, arbOsVersion }),

      arbOwnerPrepareTransactionRequest: (args) =>
        arbOwnerPrepareTransactionRequest(client, { ...args, arbOsVersion }),
    };
  };
}
