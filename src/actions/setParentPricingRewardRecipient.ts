import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { arbOwner } from '../contracts';
import {
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { validateChildChainPublicClient } from '../types/validateChildChainPublicClient';
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type SetParentPricingRewardRecipientParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      recipient: Address;
    }>
  >
>;

export type SetParentPricingRewardRecipientReturnType =
  PrepareTransactionRequestReturnTypeWithChainId;

export async function setParentPricingRewardRecipient<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetParentPricingRewardRecipientParameters,
): Promise<SetParentPricingRewardRecipientReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, recipient } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [recipient],
      abi: arbOwner.abi,
      functionName: 'setL1PricingRewardRecipient',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
