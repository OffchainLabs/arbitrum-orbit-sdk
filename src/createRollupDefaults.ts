import { zeroAddress, parseGwei } from 'viem';

/**
 * Default configuration values for creating a rollup.
 * @type {Object}
 * @property {string} nativeToken - The default native token address, defaults to zero address (ETH).
 * @property {boolean} deployFactoriesToL2 - Flag to determine if factories should be deployed to L2, defaults to true.
 * @property {number} maxFeePerGasForRetryables - The maximum fee per gas for retryable transactions, defaults to 0.1 gwei.
 */
export const defaults = {
  /**
   * The default native token address, defaults to zero address (ETH).
   * @type {string}
   */ 
  nativeToken: zeroAddress,
  
  /**
   * Flag to determine if factories should be deployed to L2, defaults to true.
   * @type {boolean}
   */ 
  deployFactoriesToL2: true,
  
  /**
   * The maximum fee per gas for retryable transactions, defaults to 0.1 gwei.
   * @type {number}
   */ 
  maxFeePerGasForRetryables: parseGwei(String('0.1')),
};
