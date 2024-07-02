import {
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

export type SetMinimumAssertionPeriodParameters<Curried extends boolean = false> = Prettify<
  WithAccount<WithContractAddress<{ newPeriod: bigint }, 'rollupAdminLogic', Curried>>
>;

export type SetMinimumAssertionPeriodReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({ newPeriod }: SetMinimumAssertionPeriodParameters) {
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setMinimumAssertionPeriod',
    args: [newPeriod],
  });
}

export async function setMinimumAssertionPeriod<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetMinimumAssertionPeriodParameters,
): Promise<SetMinimumAssertionPeriodReturnType> {
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
