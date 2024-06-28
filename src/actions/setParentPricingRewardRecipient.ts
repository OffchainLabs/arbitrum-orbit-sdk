import {
  Address,
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

export type SetParentPricingRewardRecipientParameters = Prettify<
  WithAccount<{
    recipient: Address;
  }>
>;

export type SetParentPricingRewardRecipientReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ recipient }: SetParentPricingRewardRecipientParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'setL1PricingRewardRecipient',
    args: [recipient],
  });
}

export async function setParentPricingRewardRecipient<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetParentPricingRewardRecipientParameters,
): Promise<SetParentPricingRewardRecipientReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
