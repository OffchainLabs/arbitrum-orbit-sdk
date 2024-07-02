import {
  Address,
  Chain,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { rollupAdminLogic } from '../contracts';
import { WithAccount, WithContractAddress } from '../types/Actions';
import { Prettify } from '../types/utils';
import { getRollupAddress } from '../getRollupAddress';

export type SetIsValidatorParameters<Curried extends boolean = false> = Prettify<
  WithAccount<
    WithContractAddress<
      {
        add: Address[];
        remove: Address[];
      },
      'rollupAdminLogic',
      Curried
    >
  >
>;

export type SetIsValidatorReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({ add, remove }: SetIsValidatorParameters) {
  const addState: boolean[] = new Array(add.length).fill(true);
  const removeState: boolean[] = new Array(remove.length).fill(false);
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setValidator',
    args: [add.concat(remove), addState.concat(removeState)],
  });
}

export async function setValidators<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsValidatorParameters,
): Promise<SetIsValidatorReturnType> {
  const data = rollupAdminLogicFunctionData(args);
  const rollupAdminLogicAddresss = await getRollupAddress(client, args);
  return client.prepareTransactionRequest({
    to: rollupAdminLogicAddresss,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
