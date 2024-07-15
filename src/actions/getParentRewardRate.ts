import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetParentRewardRateParameters = void;

export type GetParentRewardRateReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getL1RewardRate'
>;

export async function getParentRewardRate<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetParentRewardRateReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getL1RewardRate',
    address: arbGasInfo.address,
  });
}
