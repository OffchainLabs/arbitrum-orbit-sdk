import { Transport, Chain, PrepareTransactionRequestReturnType, Client, Account } from 'viem';

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
  TArbOsVersion extends ArbOSVersions = 20,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>>(
    args: ArbOwnerReadContractParameters<TArbOsVersion, TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TArbOsVersion, TFunctionName>>;

  arbOwnerPrepareTransactionRequest: <
    TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TArbOsVersion, TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain>>;
};

const defaultArbOsVersion = 20;

// arbOsVersion is passed as a parameter `client.extend(arbOwnerPublicActions({ arbOsVersion: 10 }))`
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(param: {
  arbOsVersion: TArbOsVersion;
}): (client: Client) => ArbOwnerPublicActions<TArbOsVersion, TChain>;
// No parameter are passed `client.extend(arbOwnerPublicActions)`
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(param: Client<TTransport, TChain, TAccount>): ArbOwnerPublicActions<typeof defaultArbOsVersion, TChain>;
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(paramOrClient: { arbOsVersion: TArbOsVersion } | Client<TTransport, TChain, TAccount>) {
  if ('arbOsVersion' in paramOrClient) {
    const result: (
      client: Client<TTransport, TChain, TAccount>,
    ) => ArbOwnerPublicActions<TArbOsVersion, TChain> = (client) => ({
      arbOwnerReadContract: (args) =>
        arbOwnerReadContract(client, { ...args, arbOsVersion: paramOrClient.arbOsVersion }),
      arbOwnerPrepareTransactionRequest: (args) =>
        // @ts-ignore (todo: fix viem type issue)
        arbOwnerPrepareTransactionRequest(client, {
          ...args,
          arbOsVersion: paramOrClient.arbOsVersion,
        }),
    });

    return result;
  }

  const result: ArbOwnerPublicActions<typeof defaultArbOsVersion, TChain> = {
    arbOwnerReadContract: (args) =>
      // @ts-ignore (todo: fix viem type issue)
      arbOwnerReadContract(paramOrClient, { ...args, arbOsVersion: defaultArbOsVersion }),
    arbOwnerPrepareTransactionRequest: (args) =>
      // @ts-ignore (todo: fix viem type issue)
      arbOwnerPrepareTransactionRequest(paramOrClient, {
        ...args,
        arbOsVersion: defaultArbOsVersion,
      }),
  };
  return result;
}
