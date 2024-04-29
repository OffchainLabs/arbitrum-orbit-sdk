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

export type ArbOwnerPublicActions<TChain extends Chain | undefined = Chain | undefined> = {
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName>(
    args: ArbOwnerReadContractParameters<TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TFunctionName>>;

  arbOwnerPrepareTransactionRequest: <
    TFunctionName extends ArbOwnerPrepareTransactionRequestFunctionName,
  >(
    args: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }>;
};

export function arbOwnerPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbOwnerPublicActions<TChain> {
  return {
    arbOwnerReadContract: (args) => arbOwnerReadContract(client, args),

    arbOwnerPrepareTransactionRequest: (args) => arbOwnerPrepareTransactionRequest(client, args),
  };
}
