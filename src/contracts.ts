import { parseAbi } from 'viem';

import {
  erc20ABI,
  arbOwnerConfig,
  rollupCreatorConfig,
  tokenBridgeCreatorConfig,
} from './generated';

export const erc20 = {
  abi: erc20ABI,
};

export const arbOwner = {
  ...arbOwnerConfig,
  address: Object.values(arbOwnerConfig.address)[0],
} as const;

export const rollupCreator = rollupCreatorConfig;
export const tokenBridgeCreator = tokenBridgeCreatorConfig;

export const upgradeExecutor = {
  abi: parseAbi([
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
  ]),
};
