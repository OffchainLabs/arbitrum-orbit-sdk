import { parseAbi } from 'viem';

import { rollupAdminLogicABI } from './abi';

export const upgradeExecutor = {
  abi: parseAbi([
    'function execute(address upgrade, bytes upgradeCallData)',
    'function executeCall(address target, bytes targetCallData)',
    'function hasRole(bytes32 role, address account) public view returns (bool)',
    'function grantRole(bytes32 role, address account)',
    'function revokeRole(bytes32 role, address account)',
  ]),
};

export const rollupAdminLogic = {
  abi: rollupAdminLogicABI,
};
