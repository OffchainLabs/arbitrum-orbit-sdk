import { Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { sequencerInboxABI } from '../contracts/SequencerInbox';
import {
  ActionParameters,
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { withUpgradeExecutor } from '../withUpgradeExecutor';
import { validateParentChainPublicClient } from '../types/ParentChain';

type Args = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};
export type BuildSetMaxTimeVariationParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>>
>;

export type BuildSetMaxTimeVariationReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function buildSetMaxTimeVariation<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: BuildSetMaxTimeVariationParameters,
): Promise<BuildSetMaxTimeVariationReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const { account, upgradeExecutor, sequencerInbox: sequencerInboxAddress, ...args } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: sequencerInboxAddress,
      upgradeExecutor,
      args: [args],
      abi: sequencerInboxABI,
      functionName: 'setMaxTimeVariation',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
