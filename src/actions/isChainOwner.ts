import { Address, Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbOwnerPublic } from '../contracts';

type ArbOwnerPublicABI = typeof arbOwnerPublic.abi;
export type IsChainOwnerParameters = {
  address: Address;
};

export type IsChainOwnerReturnType = ReadContractReturnType<ArbOwnerPublicABI, 'isChainOwner'>;

export async function isChainOwner<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  args: IsChainOwnerParameters,
): Promise<IsChainOwnerReturnType> {
  return client.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'isChainOwner',
    address: arbOwnerPublic.address,
    args: [args.address],
  });
}
