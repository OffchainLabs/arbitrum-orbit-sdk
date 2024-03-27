import { Transport, Chain, PublicClient } from 'viem';

import {
  arbGasInfoReadContract,
  ArbGasInfoFunctionName,
  ArbGasInfoReadContractParameters,
  ArbGasInfoReadContractReturnType,
} from '../arbGasInfoReadContract';

export type ArbGasInfoPublicActions<TChain extends Chain | undefined = Chain | undefined> = {
  arbGasInfoReadContract: <TFunctionName extends ArbGasInfoFunctionName>(
    args: ArbGasInfoReadContractParameters<TFunctionName>,
  ) => Promise<ArbGasInfoReadContractReturnType<TFunctionName>>;
};

export function arbGasInfoPublicActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): ArbGasInfoPublicActions<TChain> {
  return {
    arbGasInfoReadContract: (args) => arbGasInfoReadContract(client, args),
  };
}
