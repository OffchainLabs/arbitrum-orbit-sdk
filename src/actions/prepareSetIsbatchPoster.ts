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

export type PrepareSetIsBatchPosterParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>>
>;

export type PrepareSetIsBatchPosterReturnType = PrepareTransactionRequestReturnTypeWithChainId;

async function prepareSetIsBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: PrepareSetIsBatchPosterParameters & { enable: boolean },
): Promise<PrepareSetIsBatchPosterReturnType> {
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

export async function prepareEnableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: PrepareSetIsBatchPosterParameters,
): Promise<PrepareSetIsBatchPosterReturnType> {
  return prepareSetIsBatchPoster(client, {
    ...args,
    enable: true,
  });
}

export async function prepareDisableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: PrepareSetIsBatchPosterParameters,
): Promise<PrepareSetIsBatchPosterReturnType> {
  return prepareSetIsBatchPoster(client, {
    ...args,
    enable: false,
  });
}
