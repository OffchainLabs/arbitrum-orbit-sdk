import {
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

export type SetParentPricePerUnitParameters = Prettify<
  WithAccount<{
    pricePerUnit: bigint;
  }>
>;

export type SetParentPricePerUnitReturnType = PrepareTransactionRequestReturnType;

function arbOwnerFunctionData({ pricePerUnit }: SetParentPricePerUnitParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName: 'setL1PricePerUnit',
    args: [pricePerUnit],
  });
}

export async function setParentPricePerUnit<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: SetParentPricePerUnitParameters,
): Promise<SetParentPricePerUnitReturnType> {
  const data = arbOwnerFunctionData(args);

  return client.prepareTransactionRequest({
    to: arbOwner.address,
    value: BigInt(0),
    chain: client.chain,
    data,
    account: args.account,
  } satisfies PrepareTransactionRequestParameters);
}
