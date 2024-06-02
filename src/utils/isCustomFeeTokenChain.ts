import { Address, PublicClient, parseAbi } from 'viem';

/**
 * Checks if the given rollup chain is a custom fee token chain by verifying the
 * existence of a native token on the bridge contract. Returns true if it is a
 * custom fee token chain, false otherwise.
 *
 * @param {Object} params - The parameters for the function
 * @param {Address} params.rollup - The address of the rollup
 * @param {PublicClient} params.parentChainPublicClient - The public client for the parent chain
 *
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the rollup chain is a custom fee token chain, false otherwise
 */
export async function isCustomFeeTokenChain({
  rollup,
  parentChainPublicClient,
}: {
  /**
   * The address of the rollup
   * @type {Address}
   */
  rollup: Address;
  /**
   * The public client for the parent chain
   * @type {PublicClient}
   */
  parentChainPublicClient: PublicClient;
}): Promise<boolean> {
  const bridge = await parentChainPublicClient.readContract({
    address: rollup,
    abi: parseAbi(['function bridge() view returns (address)']),
    functionName: 'bridge',
  });

  try {
    await parentChainPublicClient.readContract({
      address: bridge,
      abi: parseAbi(['function nativeToken() view returns (address)']),
      functionName: 'nativeToken',
    });
  } catch {
    return false;
  }

  return true;
}
