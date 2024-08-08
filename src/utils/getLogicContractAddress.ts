import { Chain, Transport, PublicClient, Address, zeroAddress } from 'viem';

export async function getLogicContractAddress<TChain extends Chain | undefined>({
  client,
  address,
}: {
  client: PublicClient<Transport, TChain>;
  address: Address;
}): Promise<Address> {
  const value = await client.getStorageAt({
    address,
    // https://eips.ethereum.org/EIPS/eip-1967#logic-contract-address
    slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
  });

  return typeof value !== 'undefined' ? `0x${value.slice(26)}` : zeroAddress;
}
