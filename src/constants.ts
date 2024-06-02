import { parseEther } from 'viem';

/**
 * Represents the default retryables fees for rollup transactions.
 *
 * This constant returns an Ether value representing the default fees
 * for retryable transactions in rollups.
 *
 * @constant {bigint} createRollupDefaultRetryablesFees
 */
export const createRollupDefaultRetryablesFees = parseEther('0.125');

/**
 * Represents the default fees for retryable transactions in the TokenBridge.
 *
 * This constant returns an Ether value representing the default fees
 * for retryable transactions in the TokenBridge.
 *
 * @constant {bigint} createTokenBridgeDefaultRetryablesFees
 */
export const createTokenBridgeDefaultRetryablesFees = parseEther('0.02');
