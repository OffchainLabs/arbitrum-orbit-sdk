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

export type SetSpeedLimitParameters = Prettify<
  WithAccount<{
    limit: bigint;
  }>
>;

export type SetSpeedLimitReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ limit }: SetSpeedLimitParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'setSpeedLimit',
    args: [limit],
  });
}

export async function setSpeedLimit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetSpeedLimitParameters,
): Promise<SetSpeedLimitReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
