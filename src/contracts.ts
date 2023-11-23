import { parseAbi } from 'viem';

import {
  erc20ABI,
  rollupCreatorConfig,
  tokenBridgeCreatorConfig,
} from './generated';

export const rollupCreator = rollupCreatorConfig;
export const tokenBridgeCreator = tokenBridgeCreatorConfig;

export { erc20ABI };
export const upgradeExecutorABI = parseAbi([
  'function executeCall(address target, bytes targetCallData)',
]);
