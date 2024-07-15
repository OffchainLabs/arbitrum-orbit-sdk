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

export type SetExtraChallengeTimeBlocksParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<ActionParameters<{ newExtraTimeBlocks: bigint }, 'rollupAdminLogic', Curried>>
  >
>;

export type SetExtraChallengeTimeBlocksReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setExtraChallengeTimeBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetExtraChallengeTimeBlocksParameters,
): Promise<SetExtraChallengeTimeBlocksReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const rollupAdminLogicAddresss = await getRollupAddress(client, params);
  const { account, upgradeExecutor, newExtraTimeBlocks } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: rollupAdminLogicAddresss,
      upgradeExecutor,
      args: [newExtraTimeBlocks],
      abi: rollupAdminLogic.abi,
      functionName: 'setExtraChallengeTimeBlocks',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
