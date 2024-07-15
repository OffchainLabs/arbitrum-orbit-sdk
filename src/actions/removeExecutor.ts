import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { upgradeExecutor } from '../contracts';
import { PrepareTransactionRequestReturnTypeWithChainId, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';
import { UPGRADE_EXECUTOR_ROLE_EXECUTOR } from '../upgradeExecutorEncodeFunctionData';
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type RemoveExecutorParameters = Prettify<
  WithAccount<{
    upgradeExecutor: Address;
    address: Address;
  }>
>;

export type RemoveExecutorReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function removeExecutor<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: RemoveExecutorParameters,
): Promise<RemoveExecutorReturnType> {
  if (!client.chain) {
    throw new Error("[removeExecutor] client doesn't have a chain property");
  }
  const { account, upgradeExecutor: upgradeExecutorAddress, address } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: upgradeExecutorAddress,
      upgradeExecutor: upgradeExecutorAddress,
      args: [UPGRADE_EXECUTOR_ROLE_EXECUTOR, address],
      abi: upgradeExecutor.abi,
      functionName: 'revokeRole',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: client.chain.id };
}
