import { Address, encodeFunctionData } from 'viem';

import { upgradeExecutorABI } from './contracts';

export function executeCallEncodeFunctionData(
  args: [target: Address, targetCallData: `0x${string}`]
) {
  return encodeFunctionData({
    abi: upgradeExecutorABI,
    functionName: 'executeCall',
    args,
  });
}
