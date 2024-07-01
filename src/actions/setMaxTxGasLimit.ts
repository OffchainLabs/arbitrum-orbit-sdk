import {
  Chain,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { arbOwner } from '../contracts';
import { WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

export type SetMaxTxGasLimitParameters = Prettify<
  WithAccount<{
    limit: bigint;
  }>
>;

export type SetMaxTxGasLimitReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ limit }: SetMaxTxGasLimitParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'setMaxTxGasLimit',
    args: [limit],
  });
}

export async function setMaxTxGasLimit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetMaxTxGasLimitParameters,
): Promise<SetMaxTxGasLimitReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
