import { Address, DecodeEventLogReturnType } from 'viem';

import { rollupCreator } from '../contracts';

export type RollupContractsRaw = DecodeEventLogReturnType<
  typeof rollupCreator.abi,
  'RollupCreated'
>['args'];

export type RollupContracts = Omit<
  RollupContractsRaw,
  'rollupAddress' | 'inboxAddress'
> & { rollup: Address; inbox: Address };

export function sanitizeRollupContracts(
  params: RollupContractsRaw
): RollupContracts {
  const { rollupAddress, inboxAddress, ...rest } = params;

  return { ...rest, rollup: rollupAddress, inbox: inboxAddress };
}
