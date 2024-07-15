import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { arbOwner } from '../contracts';
import {
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { withUpgradeExecutor } from '../withUpgradeExecutor';
import { validateParentChainPublicClient } from '../types/ParentChain';
import { validateChildChainPublicClient } from '../types/validateChildChainPublicClient';

export type RemoveChainOwnerParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      owner: Address;
    }>
  >
>;

export type RemoveChainOwnerReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function removeChainOwner<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: RemoveChainOwnerParameters,
): Promise<RemoveChainOwnerReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, owner } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [owner],
      abi: arbOwner.abi,
      functionName: 'removeChainOwner',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
