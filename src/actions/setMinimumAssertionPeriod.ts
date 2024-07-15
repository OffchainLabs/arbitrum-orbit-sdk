import { Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { rollupAdminLogic } from '../contracts';
import {
  WithAccount,
  ActionParameters,
  PrepareTransactionRequestReturnTypeWithChainId,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { getRollupAddress } from '../getRollupAddress';
import { validateParentChainPublicClient } from '../types/ParentChain';
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type SetMinimumAssertionPeriodParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<ActionParameters<{ newPeriod: bigint }, 'rollupAdminLogic', Curried>>
  >
>;

export type SetMinimumAssertionPeriodReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setMinimumAssertionPeriod<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetMinimumAssertionPeriodParameters,
): Promise<SetMinimumAssertionPeriodReturnType> {
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
      functionName: 'setMinimumAssertionPeriod',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
