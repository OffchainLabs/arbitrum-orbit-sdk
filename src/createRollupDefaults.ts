import { zeroAddress, parseGwei } from 'viem';

export const defaults = {
  maxDataSize: BigInt(104_857),
  nativeToken: zeroAddress,
  deployFactoriesToL2: false,
  maxFeePerGasForRetryables: parseGwei(String('0.1')),
};
