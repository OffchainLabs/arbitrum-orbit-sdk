import {
  Chain,
  GetFunctionArgs,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { sequencerInbox } from '../contracts';
import { WithContractAddress, ActionParameters, WithAccount } from '../types/Actions';

type Args = GetFunctionArgs<SequencerInboxABI, 'addSequencerL2Batch'>;
type SequencerInboxABI = typeof sequencerInbox.abi;
type BuildAddSequencerL2BatchParameters<Curried extends boolean = false> = WithAccount<
  WithContractAddress<Args, 'sequencerInbox', Curried>
>;
export type BuildAddSequencerL2BatchActionParameters<Curried extends boolean> = WithAccount<
  ActionParameters<Args, 'sequencerInbox', Curried>
>;

export type BuildAddSequencerL2BatchReturnType = PrepareTransactionRequestReturnType;

function sequencerInboxFunctionData({ args }: BuildAddSequencerL2BatchParameters) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName: 'addSequencerL2Batch',
    args,
  });
}

export async function buildAddSequencerL2Batch<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: BuildAddSequencerL2BatchParameters,
): Promise<BuildAddSequencerL2BatchReturnType> {
  const data = sequencerInboxFunctionData(args);

  return client.prepareTransactionRequest({
    to: args.sequencerInbox,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
