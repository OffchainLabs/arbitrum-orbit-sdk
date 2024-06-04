import { Address, PublicClient, Transport, Chain, parseAbi } from 'viem';

/**
 * Checks if the specified chain is a custom fee token chain by verifying if it
 * has a native token contract.
 */
export async function isCustomFeeTokenChain<TChain extends Chain | undefined>({
  rollup,
  parentChainPublicClient,
}: {
  rollup: Address;
  parentChainPublicClient: PublicClient<Transport, TChain>;
}) {
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
