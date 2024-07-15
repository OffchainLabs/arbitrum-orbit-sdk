import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { arbOwner } from '../contracts';
import {
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { withUpgradeExecutor } from '../withUpgradeExecutor';
import { validateChildChainPublicClient } from '../types/validateChildChainPublicClient';

export type AddChainOwnerParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      newOwner: Address;
    }>
  >
>;

export type AddChainOwnerReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function addChainOwner<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: AddChainOwnerParameters,
): Promise<AddChainOwnerReturnType> {
  const validatedPublicClient = validateChildChainPublicClient(client);
  const { account, upgradeExecutor, newOwner } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: arbOwner.address,
      upgradeExecutor,
      args: [newOwner],
      abi: arbOwner.abi,
      functionName: 'addChainOwner',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
