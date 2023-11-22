import { zeroAddress, parseGwei } from 'viem';

export const defaults = {
  nativeToken: zeroAddress,
  deployFactoriesToL2: false,
  maxFeePerGasForRetryables: parseGwei(String('0.1')),
};
