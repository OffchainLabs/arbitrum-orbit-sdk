import type {
  Address,
  PublicClient,
  ContractFunctionReturnType,
  Transport,
  Chain,
  Account,
} from 'viem';
import { arbOwner, arbOwnerPublic } from '../../contracts';

export type IsChainOwnerParameters = {
  /** TSDoc for Address parameter */
  address: Address;
};
export type IsChainOwnerReturnType = ContractFunctionReturnType<
  typeof arbOwnerPublic.abi,
  'pure' | 'view',
  'isChainOwner'
>;

/**
 * Returns true if the address is the chain owner
 * @param client - {@link PublicClient}
 * @param parameters - {@link IsChainOwnerParameters}
 * @returns true if the address is the chain owner. {@link IsChainOwnerReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { isChainOwner } from '@arbitrum/orbit-sdk'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await isChainOwner(client, { address: '0x...' })
 */
export function isChainOwner<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends Account | undefined = Account | undefined,
>(client: PublicClient<TTransport, TChain, TAccount>, { address }: IsChainOwnerParameters) {
  return client.readContract({
    functionName: 'isChainOwner',
    abi: arbOwner.abi,
    address: arbOwner.address,
    args: [address],
  });
}
