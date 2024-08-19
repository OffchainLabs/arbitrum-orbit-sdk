import {
  Chain,
  Hex,
  PrepareTransactionRequestParameters,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { sequencerInboxABI } from '../contracts/SequencerInbox';
import {
  ActionParameters,
  PrepareTransactionRequestReturnTypeWithChainId,
  WithAccount,
} from '../types/Actions';
import { Prettify } from '../types/utils';
import { validateParentChainPublicClient } from '../types/ParentChain';

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

export type BuildInvalidateKeysetHashReturnType = PrepareTransactionRequestReturnTypeWithChainId;

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
  const validatedPublicClient = validateParentChainPublicClient(client);
  const data = sequencerInboxFunctionData(args);

  const request = await client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);

  return { ...request, chainId: validatedPublicClient.chain.id };
}
