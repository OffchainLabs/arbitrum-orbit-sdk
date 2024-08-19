import {
  Chain,
  Hex,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { sequencerInboxABI } from '../contracts/SequencerInbox';
import { ActionParameters, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

export type PrepareInvalidateKeysetHashParameters<Curried extends boolean = false> = Prettify<
  WithAccount<
    ActionParameters<
      {
        keysetHash: Hex;
      },
      'sequencerInbox',
      Curried
    >
  >
>;

export type PrepareInvalidateKeysetHashReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({ keysetHash }: PrepareInvalidateKeysetHashParameters) {
  return encodeFunctionData({
    abi: sequencerInboxABI,
    functionName: 'invalidateKeysetHash',
    args: [keysetHash],
  });
}

export async function prepareInvalidateKeysetHash<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: PrepareInvalidateKeysetHashParameters,
): Promise<PrepareInvalidateKeysetHashReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
