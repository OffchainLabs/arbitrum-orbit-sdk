import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetParentbaseFeeEstimateParameters = void;

export type GetParentbaseFeeEstimateReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getL1BaseFeeEstimate'
>;

export async function getParentbaseFeeEstimate<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetParentbaseFeeEstimateReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getL1BaseFeeEstimate',
    address: arbGasInfo.address,
  });
}
