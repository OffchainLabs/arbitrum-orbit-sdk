import { zeroAddress } from 'viem';

export const defaults = {
  maxDataSize: BigInt(104_857),
  nativeToken: zeroAddress,
  deployFactoriesToL2: false,
  maxFeePerGasForRetryables: BigInt(0),
};
