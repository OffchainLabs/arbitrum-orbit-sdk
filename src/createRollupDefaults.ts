import { zeroAddress, parseGwei } from 'viem';

/**
 * The `defaults` object provides default values for various settings, including
 * the native token address, deployment to Layer 2, and maximum fee per gas for
 * retryable transactions.
 */
export const defaults = {
  /**
   * The address of the native token. Defaults to zero address.
   * @type {string}
   */
  nativeToken: zeroAddress,
  /**
   * Whether to deploy factories to Layer 2. Defaults to true.
   * @type {boolean}
   */
  deployFactoriesToL2: true,
  /**
   * The maximum fee per gas for retryable transactions. Defaults to 0.1 gwei.
   * @type {BigInt}
   */
  maxFeePerGasForRetryables: parseGwei(String('0.1')),
};
