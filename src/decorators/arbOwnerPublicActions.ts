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
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

const defaultArbOsVersion = 20;

// Client is passed explicitly
// `arbOwnerPublicActions(client)`, `arbOwnerPublicActions(client, { arbOsVersion: 20 })`
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  { arbOsVersion }: { arbOsVersion: TArbOsVersion },
): ArbOwnerPublicActions<TArbOsVersion, TChain>;
// arbOsVersion is passed as a parameter
// `client.extend(arbOwnerPublicActions({ arbOsVersion: 10 }))`
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(param: {
  arbOsVersion: TArbOsVersion;
}): (client: Client<TTransport, TChain, TAccount>) => ArbOwnerPublicActions<TArbOsVersion, TChain>;
// No parameter are passed
// `client.extend(arbOwnerPublicActions)`
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  param: Client<TTransport, TChain, TAccount>,
): ArbOwnerPublicActions<typeof defaultArbOsVersion, TChain>;
export function arbOwnerPublicActions<
  TArbOsVersion extends ArbOSVersions,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  paramOrClient: { arbOsVersion: TArbOsVersion } | Client<TTransport, TChain, TAccount>,
  options?: { arbOsVersion: TArbOsVersion },
) {
  // arbOsVersion is passed as a parameter, return actions with curried arbOsVersion
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

  /**
   * Parameter is a client, we either have:
   * - client.extend(arbOwnerPublicActions)
   * - arbOwnerPublicActions(client)
   * - arbOwnerPublicActions(client, { arbOsVersion: X })
   *
   * If we don't have arbOsVersion (the 2 first cases), default the version to defaultArbOsVersion
   */
  const version = options?.arbOsVersion ?? defaultArbOsVersion;
  const result: ArbOwnerPublicActions<typeof version, TChain> = {
    arbOwnerReadContract: (args) =>
      // @ts-ignore (todo: fix viem type issue)
      arbOwnerReadContract(paramOrClient, { ...args, arbOsVersion: version }),
    arbOwnerPrepareTransactionRequest: (args) =>
      // @ts-ignore (todo: fix viem type issue)
      arbOwnerPrepareTransactionRequest(paramOrClient, {
        ...args,
        arbOsVersion: version,
      }),
  };
  return result;
}
