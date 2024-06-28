import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetMinimumGasPriceParameters = void;

export type GetMinimumGasPriceReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getMinimumGasPrice'
>;

export async function getMinimumGasPrice<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetMinimumGasPriceReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getMinimumGasPrice',
    address: arbGasInfo.address,
  });
}
