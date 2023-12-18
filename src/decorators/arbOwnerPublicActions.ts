import {
  Transport,
  Chain,
  Account,
  Client,
  PrepareTransactionRequestReturnType,
  PublicClient,
} from 'viem';

import {
  arbOwnerPrepareTransactionRequest,
  ArbOwnerPrepareTransactionRequestParameters,
} from '../arbOwnerClient';

// arbOwnerReadContract
// arbOwnerSimulateContract
// arbOwnerPrepareTransactionRequest

type ArbOwnerPublicActions<
  TChain extends Chain | undefined = Chain | undefined
> = {
  arbOwnerPrepareTransactionRequest: (
    args: ArbOwnerPrepareTransactionRequestParameters
  ) => Promise<PrepareTransactionRequestReturnType<TChain>>;
};

export function arbOwnerPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
>(client: PublicClient<TTransport, TChain>): ArbOwnerPublicActions<TChain> {
  return {
    arbOwnerPrepareTransactionRequest: (args) =>
      arbOwnerPrepareTransactionRequest(client, args),
  };
}
