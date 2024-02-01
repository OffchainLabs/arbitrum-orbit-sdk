import { parseEther } from 'viem';

export const deterministicFactoriesDeploymentEstimatedFees = parseEther(String('0.125'));
export const createTokenBridgeEstimatedFees = parseEther(String('0.02'));
export const createTokenBridgeDefaultGasLimit = 5_000_000n;
export const createTokenBridgeDefaultValue = parseEther('0.02');
