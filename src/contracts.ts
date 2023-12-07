import { parseAbi } from 'viem';

import {
  erc20ABI,
  arbOwnerConfig,
  rollupCreatorConfig,
  tokenBridgeCreatorConfig,
} from './generated';

export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

export const rollupCreator = rollupCreatorConfig;
export const tokenBridgeCreator = tokenBridgeCreatorConfig;

export { erc20ABI };
export const upgradeExecutorABI = parseAbi([
  'function executeCall(address target, bytes targetCallData)',
]);
