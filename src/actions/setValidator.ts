import { Address, Chain, PrepareTransactionRequestParameters, PublicClient, Transport } from 'viem';
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

export type SetIsValidatorParameters<Curried extends boolean = false> = Prettify<
  WithUpgradeExecutor<
    WithAccount<
      ActionParameters<
        {
          add: Address[];
          remove: Address[];
        },
        'rollupAdminLogic',
        Curried
      >
    >
  >
>;

export type SetIsValidatorReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function setValidators<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: SetIsValidatorParameters,
): Promise<SetIsValidatorReturnType> {
  const validatedPublicClient = validateParentChainPublicClient(client);
  const rollupAdminLogicAddresss = await getRollupAddress(client, params);
  const { account, upgradeExecutor, add: addressesToAdd, remove: addressesToRemove } = params;

  const addState: boolean[] = new Array(addressesToAdd.length).fill(true);
  const removeState: boolean[] = new Array(addressesToRemove.length).fill(false);

  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    account,
    ...withUpgradeExecutor({
      to: rollupAdminLogicAddresss,
      upgradeExecutor,
      args: [addressesToAdd.concat(addressesToRemove), addState.concat(removeState)],
      abi: rollupAdminLogic.abi,
      functionName: 'setValidator',
    }),
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
