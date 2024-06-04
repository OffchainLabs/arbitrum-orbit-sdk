import { parseEther } from 'viem';

/**
 * createRollupDefaultRetryablesFees is the default fee value for retryable
 * transactions in Rollup and is set to 0.125 {@link Ether}.
 */
export const createRollupDefaultRetryablesFees = parseEther('0.125');

/**
 * createTokenBridgeDefaultRetryablesFees returns a parsed value representing
 * the default retryable fees for token bridge transactions.
 */
export const createTokenBridgeDefaultRetryablesFees = parseEther('0.02');
