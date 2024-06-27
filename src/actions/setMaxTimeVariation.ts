import {
  Chain,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

type Args = {
  delayBlocks: bigint;
  futureBlocks: bigint;
  delaySeconds: bigint;
  futureSeconds: bigint;
};
export type SetMaxTimeVariationParameters<Curried extends boolean = false> = Prettify<
  WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>
>;

export type SetMaxTimeVariationReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData(args: SetMaxTimeVariationParameters) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName: 'setMaxTimeVariation',
    args: [args],
  });
}

export async function setMaxTimeVariation<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetMaxTimeVariationParameters,
): Promise<SetMaxTimeVariationReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
