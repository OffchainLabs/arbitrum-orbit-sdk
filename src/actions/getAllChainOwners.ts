import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbOwnerPublic } from '../contracts';

type ArbOwnerPublicABI = typeof arbOwnerPublic.abi;
export type GetAllChainOwnersParameters = void;

export type GetAllChainOwnersReturnType = ReadContractReturnType<
  ArbOwnerPublicABI,
  'getAllChainOwners'
>;

export async function getAllChainOwners<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetAllChainOwnersReturnType> {
  return client.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'getAllChainOwners',
    address: arbOwnerPublic.address,
  });
}
