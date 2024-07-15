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

export type SetValidatorWhitelistDisabledParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<WithAccount<ActionParameters<{}, 'rollupAdminLogic', Curried>>>
>;

export type SetValidatorWhitelistDisabledReturnType =
  PrepareTransactionRequestReturnTypeWithChainId;

async function setValidatorWhitelistDisabled<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetValidatorWhitelistDisabledParameters & { enable: boolean },
): Promise<SetValidatorWhitelistDisabledReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const rollupAdminLogicAddresss = await getRollupAddress(client, params);
  const { account, upgradeExecutor, enable } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: rollupAdminLogicAddresss,
      upgradeExecutor,
      args: [enable],
      abi: rollupAdminLogic.abi,
      functionName: 'setValidatorWhitelistDisabled',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}

export async function enableValidatorWhitelist<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetValidatorWhitelistDisabledParameters,
): Promise<SetValidatorWhitelistDisabledReturnType> {
  return setValidatorWhitelistDisabled(client, {
    ...args,
    enable: true,
  });
}

export async function disableValidatorWhitelist<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetValidatorWhitelistDisabledParameters,
): Promise<SetValidatorWhitelistDisabledReturnType> {
  return setValidatorWhitelistDisabled(client, {
    ...args,
    enable: false,
  });
}
