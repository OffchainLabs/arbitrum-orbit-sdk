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

export type SetParentPricingRewardRateParameters = Prettify<
  WithAccount<{
    weiPerUnit: bigint;
  }>
>;

export type SetParentPricingRewardRateReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ weiPerUnit }: SetParentPricingRewardRateParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'setL1PricingRewardRate',
    args: [weiPerUnit],
  });
}

export async function setParentPricingRewardRate<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetParentPricingRewardRateParameters,
): Promise<SetParentPricingRewardRateReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
