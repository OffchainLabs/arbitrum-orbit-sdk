import { parseEther } from 'viem';

/**
 * Default retryable fees for creating a rollup
 * @constant {BigInt}
 */
export const createRollupDefaultRetryablesFees = parseEther('0.125');

/**
 * Default retryable fees for creating a token bridge
 * @constant {BigInt}
 */
export const createTokenBridgeDefaultRetryablesFees = parseEther('0.02');
