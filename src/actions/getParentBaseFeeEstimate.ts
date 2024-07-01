import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetParentBaseFeeEstimateParameters = void;

export type GetParentBaseFeeEstimateReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getL1BaseFeeEstimate'
>;

export async function getParentBaseFeeEstimate<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetParentBaseFeeEstimateReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getL1BaseFeeEstimate',
    address: arbGasInfo.address,
  });
}
