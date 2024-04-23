import { PublicClient, parseAbi } from 'viem';
import { ARB_SYS_ADDRESS } from '@arbitrum/sdk/dist/lib/dataEntities/constants';

/**
 * Returns the the ArbOS version from the provider passed in parameter.
 *
 * @param arbitrumPublicClient - viem public client
 * @throws if the provider is not an arbitrum chain
 * @returns the ArbOS version
 */
export async function getArbOSVersion(arbitrumPublicClient: PublicClient): Promise<number> {
  const arbOSVersion = await arbitrumPublicClient.readContract({
    address: ARB_SYS_ADDRESS,
    abi: parseAbi(['function arbOSVersion() view returns (uint256)']),
    functionName: 'arbOSVersion',
  });
  //
  /**
   * Version of the ArbOS is starting at 55
   * {@see https://github.com/OffchainLabs/nitro/blob/a20a1c70cc11ac52c7cfe6a20f00c880c2009a8f/precompiles/ArbSys.go#L62-L66}
   */
  return Number(arbOSVersion) - 55;
}
