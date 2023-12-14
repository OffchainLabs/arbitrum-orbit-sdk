import { Address, encodeFunctionData } from 'viem';

import { upgradeExecutor } from './contracts';

export function executeCallEncodeFunctionData(
  args: [target: Address, targetCallData: `0x${string}`]
) {
  return encodeFunctionData({
    abi: upgradeExecutor.abi,
    functionName: 'executeCall',
    args,
  });
}
