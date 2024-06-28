import {
  Address,
  Chain,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PublicClient,
  Transport,
  encodeFunctionData,
} from 'viem';
import { arbOwner } from '../contracts';
import { WithAccount } from '../types/Actions';
import { Prettify } from '../types/utils';

export type RemoveChainOwnerParameters = Prettify<
  WithAccount<{
    owner: Address;
  }>
>;

export type RemoveChainOwnerReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ owner }: RemoveChainOwnerParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'removeChainOwner',
    args: [owner],
  });
}

export async function removeChainOwner<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: RemoveChainOwnerParameters,
): Promise<RemoveChainOwnerReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
