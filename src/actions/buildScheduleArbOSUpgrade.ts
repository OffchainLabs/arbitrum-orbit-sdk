import { Address, Chain, PublicClient, Transport } from 'viem';

import { Prettify } from '../types/utils';
import { arbOwnerPrepareTransactionRequest } from '../arbOwnerPrepareTransactionRequest';
import { PrepareTransactionRequestReturnTypeWithChainId } from '../types/Actions';

export type BuildScheduleArbOSUpgradeParameters = Prettify<{
  account: Address;
  upgradeExecutor: Address | false;
  args: readonly [newVersion: bigint, timestamp: bigint];
}>;

export type BuildScheduleArbOSUpgradeReturnType = PrepareTransactionRequestReturnTypeWithChainId;

export async function buildScheduleArbOSUpgrade<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { account, upgradeExecutor, args }: BuildScheduleArbOSUpgradeParameters,
): Promise<BuildScheduleArbOSUpgradeReturnType> {
  return arbOwnerPrepareTransactionRequest(client, {
    account,
    upgradeExecutor,
    functionName: 'scheduleArbOSUpgrade',
    args,
  });
}
