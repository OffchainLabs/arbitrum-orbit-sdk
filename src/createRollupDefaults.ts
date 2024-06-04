import { zeroAddress, parseGwei } from 'viem';

/**
 * The `defaults` object provides default values for various settings such as
 * the native token, deployment to L2, and maximum fee per gas for retryables.
 * It includes properties like `nativeToken`, `deployFactoriesToL2`, and
 * `maxFeePerGasForRetryables`.
 */
export const defaults = {
  nativeToken: zeroAddress,
  deployFactoriesToL2: true,
  maxFeePerGasForRetryables: parseGwei(String('0.1')),
};
