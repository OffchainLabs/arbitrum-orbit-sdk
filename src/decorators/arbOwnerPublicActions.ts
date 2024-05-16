import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient } from 'viem';

import {
  arbOwnerReadContract,
  ArbOwnerReadContractParameters,
  ArbOwnerReadContractReturnType,
  ArbOwnerPublicFunctionName,
} from '../arbOwnerReadContract';
import {
  arbOwnerPrepareTransactionRequest,
  ArbOwnerPrepareTransactionRequestParameters,
  ArbOwnerPrepareTransactionRequestReturnType,
  ArbOwnerFunctionName,
} from '../arbOwnerPrepareTransactionRequest';

export type ArbOwnerPublicActions<TChain extends Chain | undefined = Chain | undefined> = {
  arbOwnerReadContract: <TFunctionName extends ArbOwnerPublicFunctionName>(
    args: ArbOwnerReadContractParameters<TFunctionName>,
  ) => Promise<ArbOwnerReadContractReturnType<TFunctionName>>;

  arbOwnerPrepareTransactionRequest: <TFunctionName extends ArbOwnerFunctionName>(
    args: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
  ) => Promise<ArbOwnerPrepareTransactionRequestReturnType<TChain>>;
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
