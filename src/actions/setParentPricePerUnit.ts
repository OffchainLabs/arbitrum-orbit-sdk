import { Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { arbOwner } from '../contracts';
import {
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { withUpgradeExecutor } from '../withUpgradeExecutor';
import { validateChildChainPublicClient } from '../types/validateChildChainPublicClient';

export type SetParentPricePerUnitParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      pricePerUnit: bigint;
    }>
  >
>;

export type SetParentPricePerUnitReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setParentPricePerUnit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetParentPricePerUnitParameters,
): Promise<SetParentPricePerUnitReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, pricePerUnit } = params;

  const request = await client.prepareTransactionRequest({
    chain: validatedPublicClient.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [pricePerUnit],
      abi: arbOwner.abi,
      functionName: 'setL1PricePerUnit',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
