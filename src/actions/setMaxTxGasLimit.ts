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

export type SetMaxTxGasLimitParameters = Prettify<
  WithUpgradeExecutor<
    WithAccount<{
      limit: bigint;
    }>
  >
>;

export type SetMaxTxGasLimitReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setMaxTxGasLimit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetMaxTxGasLimitParameters,
): Promise<SetMaxTxGasLimitReturnType> {
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
      functionName: 'setMaxTxGasLimit',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
