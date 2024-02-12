import { parseEther } from 'viem';

export const deterministicFactoriesDeploymentEstimatedFees = parseEther(String('0.125'));
export const createTokenBridgeDefaultRetryablesFees = parseEther('0.02');
export const createTokenBridgeDefaultGasLimit = 5_000_000n;
