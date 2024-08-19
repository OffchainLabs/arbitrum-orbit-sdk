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
import { withUpgradeExecutor } from '../withUpgradeExecutor';

export type PrepareSetKeysetParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<
      ActionParameters<
        {
          keyset: Hex;
        },
        'sequencerInbox',
        Curried
      >
    >
  >
>;

export type PrepareSetKeysetReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function prepareSetKeyset<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: PrepareSetKeysetParameters,
): Promise<PrepareSetKeysetReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const { account, upgradeExecutor, sequencerInbox: sequencerInboxAddress, ...args } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: sequencerInboxAddress,
      upgradeExecutor,
      args: [args.keyset],
      abi: sequencerInboxABI,
      functionName: 'setValidKeyset',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
