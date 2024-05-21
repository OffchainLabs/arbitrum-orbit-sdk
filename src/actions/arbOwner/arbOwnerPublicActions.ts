import { Account, Chain, Client, PublicClient, Transport, createPublicClient, http } from 'viem';
import { IsChainOwnerParameters, IsChainOwnerReturnType, isChainOwner } from './isChainOwner';
import { mainnet } from 'viem/chains';

export type ArbOwnerPublicActions = {
  /**
   * Returns true if the address is the chain owner
   * @param parameters - {@link IsChainOwnerParameters}
   * @returns true if the address is the chain owner. {@link IsChainOwnerReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { arbOwnerPublicActions } from '@arbitrum/orbit-sdk'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(arbOwnerPublicActions)
   * const result = await client.isChainOwner({ address: '0x...' })
   */
  isChainOwner: ({ address }: IsChainOwnerParameters) => Promise<IsChainOwnerReturnType>;
};

/**
 * Extends the viem client with ArbOwner public actions
 * @param client - The viem {@link Client} object to add the ArbOwner public actions to
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { arbOwnerPublicActions } from '@arbitrum/orbit-sdk'
 *
 * const clientWithArbOwner = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(arbOwnerPublicActions)
 */
export const arbOwnerPublicActions = <
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: PublicClient<TTransport, TChain, TAccount>,
): ArbOwnerPublicActions => ({
  isChainOwner(parameters) {
    return isChainOwner(client, parameters);
  },
});

// Usage
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(arbOwnerPublicActions);

client.isChainOwner({
  address: '0x',
});
