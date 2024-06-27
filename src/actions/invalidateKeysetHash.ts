import {
  Chain,
  Hex,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { sequencerInbox } from '../contracts';
import { ActionParameters, WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

export type InvalidateKeysetHashParameters<Curried extends boolean = false> = Prettify<
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

export type InvalidateKeysetHashReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({ keysetHash }: InvalidateKeysetHashParameters) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName: 'invalidateKeysetHash',
    args: [keysetHash],
  });
}

export async function invalidateKeysetHash<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: InvalidateKeysetHashParameters,
): Promise<InvalidateKeysetHashReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
