import { Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { arbOwner } from '../contracts';
import {
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { validateChildChainPublicClient } from '../types/validateChildChainPublicClient';
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type SetParentPricingRewardRateParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      weiPerUnit: bigint;
    }>
  >
>;

export type SetParentPricingRewardRateReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setParentPricingRewardRate<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetParentPricingRewardRateParameters,
): Promise<SetParentPricingRewardRateReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, weiPerUnit } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [weiPerUnit],
      abi: arbOwner.abi,
      functionName: 'setL1PricingRewardRate',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
