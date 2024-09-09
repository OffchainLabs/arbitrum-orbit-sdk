import { Chain, Hex, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
import { sequencerInboxABI } from '../contracts/SequencerInbox';
import {
  ActionParameters,
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
  WithUpgradeExecutor,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { validateParentChainPublicClient } from '../types/ParentChain';
import { prepareUpgradeExecutorCallParameters } from '../prepareUpgradeExecutorCallParameters';

export type BuildInvalidateKeysetHashParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<
      ActionParameters<
        {
          keysetHash: Hex;
        },
        'sequencerInbox',
        Curried
      >
    >
  >
>;

export type BuildInvalidateKeysetHashReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function buildInvalidateKeysetHash<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: BuildInvalidateKeysetHashParameters,
): Promise<BuildInvalidateKeysetHashReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const { account, upgradeExecutor, sequencerInbox: sequencerInboxAddress, ...args } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...prepareUpgradeExecutorCallParameters({
      to: sequencerInboxAddress,
      upgradeExecutor,
      args: [args.keysetHash],
      abi: sequencerInboxABI,
      functionName: 'invalidateKeysetHash',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
