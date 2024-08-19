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

export type BuildInvalidateKeysetHashParameters<Curried extends boolean = false> = Prettify<
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

export type BuildInvalidateKeysetHashReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({ keysetHash }: BuildInvalidateKeysetHashParameters) {
  return encodeFunctionData({
    abi: sequencerInboxABI,
    functionName: 'invalidateKeysetHash',
    args: [keysetHash],
  });
}

export async function buildInvalidateKeysetHash<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: BuildInvalidateKeysetHashParameters,
): Promise<BuildInvalidateKeysetHashReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
