import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbOwnerPublic } from '../contracts';

type ArbOwnerPublicABI = typeof arbOwnerPublic.abi;
export type GetNetworkFeeAccountParameters = void;

export type GetNetworkFeeAccountReturnType = ReadContractReturnType<
  ArbOwnerPublicABI,
  'getNetworkFeeAccount'
>;

export async function getNetworkFeeAccount<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetNetworkFeeAccountReturnType> {
  return client.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'getNetworkFeeAccount',
    address: arbOwnerPublic.address,
  });
}
