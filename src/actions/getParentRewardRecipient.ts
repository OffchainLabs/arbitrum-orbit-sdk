import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbGasInfo } from '../contracts';

type ArbGasInfoABI = typeof arbGasInfo.abi;
export type GetParentRewardRecipientParameters = void;

export type GetParentRewardRecipientReturnType = ReadContractReturnType<
  ArbGasInfoABI,
  'getL1RewardRecipient'
>;

export async function getParentRewardRecipient<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetParentRewardRecipientReturnType> {
  return client.readContract({
    abi: arbGasInfo.abi,
    functionName: 'getL1RewardRecipient',
    address: arbGasInfo.address,
  });
}
