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
import { ActionParameters, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

type Args = {
  add: Address[];
  remove: Address[];
};

export type SetIsValidatorParameters<Curried extends boolean = false> = Prettify<
  WithAccount<ActionParameters<Args, 'rollupAdminLogic', Curried>>
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
  return client.prepareTransactionRequest({
    to: args.rollupAdminLogic,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
