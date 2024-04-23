import { PublicClient } from 'viem';
import { ArbSys__factory } from '@arbitrum/sdk/dist/lib/abi/factories/ArbSys__factory';
import { ARB_SYS_ADDRESS } from '@arbitrum/sdk/dist/lib/dataEntities/constants';
import { publicClientToProvider } from '../ethers-compat/publicClientToProvider';

/**
 * Returns the the ArbOS version from the provider passed in parameter.
 *
 * @param arbitrumPublicClient - viem public client
 * @throws if the provider is not an arbitrum chain
 * @returns the ArbOS version
 */
export async function getArbOSVersion(arbitrumPublicClient: PublicClient): Promise<number> {
  const arbOsVersion = await ArbSys__factory.connect(
    ARB_SYS_ADDRESS,
    publicClientToProvider(arbitrumPublicClient),
  ).arbOSVersion();
  return arbOsVersion.toNumber();
}
