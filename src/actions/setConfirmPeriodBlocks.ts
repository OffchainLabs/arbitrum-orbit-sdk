import {
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

export type SetConfirmPeriodBlocksParameters<Curried extends boolean = false> = Prettify<
  WithAccount<
    ActionParameters<
      {
        newPeriod: bigint;
      },
      'rollupAdminLogic',
      Curried
    >
  >
>;

export type SetConfirmPeriodBlocksReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({ newPeriod }: SetConfirmPeriodBlocksParameters) {
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setConfirmPeriodBlocks',
    args: [newPeriod],
  });
}

export async function setConfirmPeriodBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetConfirmPeriodBlocksParameters,
): Promise<SetConfirmPeriodBlocksReturnType> {
  const data = rollupAdminLogicFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.rollupAdminLogic,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
