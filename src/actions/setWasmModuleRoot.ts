import {
  Chain,
  Hex,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { rollupAdminLogic } from '../contracts';
import {
  WithAccount,
  ActionParameters,
  WithUpgradeExecutor,
  PrepareTransactionRequestReturnTypeWithChainId,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { getRollupAddress } from '../getRollupAddress';
import { withUpgradeExecutor } from '../withUpgradeExecutor';
import { validateParentChainPublicClient } from '../types/ParentChain';

export type SetWasmModuleRootParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<
      ActionParameters<
        {
          newWasmModuleRoot: Hex;
        },
        'rollupAdminLogic',
        Curried
      >
    >
  >
>;

export type SetWasmModuleRootReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setWasmModuleRoot<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetWasmModuleRootParameters,
): Promise<SetWasmModuleRootReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const rollupAdminLogicAddresss = await getRollupAddress(client, params);
  const { account, upgradeExecutor, newWasmModuleRoot } = params;

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: rollupAdminLogicAddresss,
      upgradeExecutor,
      args: [newWasmModuleRoot],
      abi: rollupAdminLogic.abi,
      functionName: 'setWasmModuleRoot',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
