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

export type AddChainOwnerParameters = Prettify<
  WithAccount<{
    newOwner: Address;
  }>
>;

export type AddChainOwnerReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ newOwner }: AddChainOwnerParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'addChainOwner',
    args: [newOwner],
  });
}

export async function addChainOwner<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: AddChainOwnerParameters,
): Promise<AddChainOwnerReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
