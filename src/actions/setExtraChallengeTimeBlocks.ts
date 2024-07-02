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

export type SetExtraChallengeTimeBlocksParameters<Curried extends boolean = false> = Prettify<
  WithAccount<WithContractAddress<{ newExtraTimeBlocks: bigint }, 'rollupAdminLogic', Curried>>
>;

export type SetExtraChallengeTimeBlocksReturnType = PrepareTransactionRequestReturnType;

function rollupAdminLogicFunctionData({
  newExtraTimeBlocks,
}: SetExtraChallengeTimeBlocksParameters) {
  return encodeFunctionData({
    abi: rollupAdminLogic.abi,
    functionName: 'setExtraChallengeTimeBlocks',
    args: [newExtraTimeBlocks],
  });
}

export async function setExtraChallengeTimeBlocks<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetExtraChallengeTimeBlocksParameters,
): Promise<SetExtraChallengeTimeBlocksReturnType> {
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
