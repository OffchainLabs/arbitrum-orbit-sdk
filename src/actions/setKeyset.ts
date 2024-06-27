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

export type SetKeysetParameters<Curried extends boolean = false> = Prettify<
  WithAccount<
    ActionParameters<
      {
        keyset: Hex;
      },
      'sequencerInbox',
      Curried
    >
  >
>;

export type SetKeysetReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({ keyset }: SetKeysetParameters) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName: 'setValidKeyset',
    args: [keyset],
  });
}

export async function setKeyset<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetKeysetParameters,
): Promise<SetKeysetReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
