import { Address, PublicClient, parseAbi } from 'viem';

/**
 * Checks if the given rollup chain uses a custom fee token.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Address} params.rollup - The address of the rollup contract.
 * @param {PublicClient} params.parentChainPublicClient - The public client for interacting with the parent chain.
 * @returns {Promise<boolean>} - Returns true if the rollup chain uses a custom fee token, otherwise false.
 *
 * @example
 * const isCustomTokenChain = await isCustomFeeTokenChain({
 *   rollup: '0x1234567890abcdef1234567890abcdef12345678',
 *   parentChainPublicClient,
 * });
 * console.log(isCustomTokenChain); // true or false
 */
export async function isCustomFeeTokenChain({
  rollup,
  parentChainPublicClient,
}: {
  rollup: Address;
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
