import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetGasAccountingParamsParameters = void;

export type GetGasAccountingParamsReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getGasAccountingParams'
>;

export async function getGasAccountingParams<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetGasAccountingParamsReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getGasAccountingParams',
    address: arbGasInfo.address,
  });
}
