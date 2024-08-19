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

export type SetIsBatchPosterParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>>
>;

export type SetIsBatchPosterReturnType = PrepareTransactionRequestReturnTypeWithChainId;

async function setIsBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetIsBatchPosterParameters & { enable: boolean },
): Promise<SetIsBatchPosterReturnType> {
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

export async function enableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsBatchPosterParameters,
): Promise<SetIsBatchPosterReturnType> {
  return setIsBatchPoster(client, {
    ...args,
    enable: true,
  });
}

export async function disableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsBatchPosterParameters,
): Promise<SetIsBatchPosterReturnType> {
  return setIsBatchPoster(client, {
    ...args,
    enable: false,
  });
}
