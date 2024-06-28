import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbOwnerPublic } from '../contracts';

type ArbOwnerPublicABI = typeof arbOwnerPublic.abi;
export type GetInfraFeeAccountParameters = void;

export type GetInfraFeeAccountReturnType = ReadContractReturnType<
  ArbOwnerPublicABI,
  'getInfraFeeAccount'
>;

export async function getInfraFeeAccount<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetInfraFeeAccountReturnType> {
  return client.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'getInfraFeeAccount',
    address: arbOwnerPublic.address,
  });
}
