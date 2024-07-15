import { Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import {
  WithAccount,
  ActionParameters,
  WithUpgradeExecutor,
  PrepareTransactionRequestReturnTypeWithChainId,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { getRollupAddress } from '../getRollupAddress';
import { validateParentChainPublicClient } from '../types/ParentChain';
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type SetConfirmPeriodBlocksParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<ActionParameters<{ newPeriod: bigint }, 'rollupAdminLogic', Curried>>
  >
>;

export type SetConfirmPeriodBlocksReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setConfirmPeriodBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetConfirmPeriodBlocksParameters,
): Promise<SetConfirmPeriodBlocksReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const rollupAdminLogicAddresss = await getRollupAddress(client, params);
  const { account, upgradeExecutor, newPeriod } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: rollupAdminLogicAddresss,
      upgradeExecutor,
      args: [newPeriod],
      abi: rollupAdminLogic.abi,
      functionName: 'setConfirmPeriodBlocks',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
