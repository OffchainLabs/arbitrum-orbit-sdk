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

export type SetSpeedLimitParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      limit: bigint;
    }>
  >
>;

export type SetSpeedLimitReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setSpeedLimit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetSpeedLimitParameters,
): Promise<SetSpeedLimitReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, limit } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [limit],
      abi: arbOwner.abi,
      functionName: 'setSpeedLimit',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
