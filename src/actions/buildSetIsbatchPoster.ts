import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
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
  batchPoster: Address;
};

export type BuildSetIsBatchPosterParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>>
>;

export type BuildSetIsBatchPosterReturnType = PrepareTransactionRequestReturnTypeWithChainId;

async function buildSetIsBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: BuildSetIsBatchPosterParameters & { enable: boolean },
): Promise<BuildSetIsBatchPosterReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const { account, upgradeExecutor, sequencerInbox: sequencerInboxAddress, ...args } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: sequencerInboxAddress,
      upgradeExecutor,
      args: [args.batchPoster, args.enable],
      abi: sequencerInboxABI,
      functionName: 'setIsBatchPoster',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}

export async function buildEnableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: BuildSetIsBatchPosterParameters,
): Promise<BuildSetIsBatchPosterReturnType> {
  return buildSetIsBatchPoster(client, {
    ...args,
    enable: true,
  });
}

export async function buildDisableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: BuildSetIsBatchPosterParameters,
): Promise<BuildSetIsBatchPosterReturnType> {
  return buildSetIsBatchPoster(client, {
    ...args,
    enable: false,
  });
}
