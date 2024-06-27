import {
  Address,
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
  batchPoster: Address;
};

export type SetIsBatchPosterParameters<Curried extends boolean = false> = Prettify<
  WithAccount<ActionParameters<Args, 'sequencerInbox', Curried>>
>;

export type SetIsBatchPosterReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({
  batchPoster,
  enable,
}: SetIsBatchPosterParameters & { enable: boolean }) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName: 'setIsBatchPoster',
    args: [batchPoster, enable],
  });
}

async function setIsBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsBatchPosterParameters & { enable: boolean },
): Promise<SetIsBatchPosterReturnType> {
  const data = sequencerInboxFunctionData(args);
  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}

export async function enableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsBatchPosterParameters,
): Promise<SetIsBatchPosterReturnType> {
  return setIsBatchPoster(client, {
    ...args,
    enable: true,
  });
}

export async function disableBatchPoster<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetIsBatchPosterParameters,
): Promise<SetIsBatchPosterReturnType> {
  return setIsBatchPoster(client, {
    ...args,
    enable: false,
  });
}
