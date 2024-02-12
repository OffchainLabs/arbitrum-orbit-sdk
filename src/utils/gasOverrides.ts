type GasOverrideOptions = {
  base?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
};

export type TransactionRequestRetryableGasOverrides = {
  gasLimit?: GasOverrideOptions;
  maxSubmissionFee?: GasOverrideOptions;
  maxFeePerGas?: GasOverrideOptions;
  deposit?: GasOverrideOptions;
};

export function applyPercentIncrease({
  base,
  percentIncrease = 0n,
}: {
  base: bigint;
  percentIncrease?: bigint;
}) {
  return base + (base * percentIncrease) / 100n;
}
