import { Address, PublicClient, parseAbi } from 'viem';

export async function isCustomFeeTokenChain({
  rollup,
  parentChainPublicClient,
}: {
  rollup: Address;
  parentChainPublicClient: PublicClient;
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
