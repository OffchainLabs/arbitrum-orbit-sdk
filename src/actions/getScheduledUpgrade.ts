import { Chain, PublicClient, ReadContractReturnType, Transport } from 'viem';
import { arbOwnerPublic } from '../contracts';

type ArbOwnerPublicABI = typeof arbOwnerPublic.abi;
export type GetScheduledUpgradeParameters = void;

type GetScheduledUpgradeRawReturnType = ReadContractReturnType<
  ArbOwnerPublicABI,
  'getScheduledUpgrade'
>;
export type GetScheduledUpgradeReturnType = {
  arbosVersion: GetScheduledUpgradeRawReturnType[0];
  scheduledForTimestamp: GetScheduledUpgradeRawReturnType[1];
};

export async function getScheduledUpgrade<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
): Promise<GetScheduledUpgradeReturnType> {
  const [arbosVersion, scheduledForTimestamp] = await client.readContract({
    abi: arbOwnerPublic.abi,
    functionName: 'getScheduledUpgrade',
    address: arbOwnerPublic.address,
  });
  return {
    arbosVersion,
    scheduledForTimestamp,
  };
}
