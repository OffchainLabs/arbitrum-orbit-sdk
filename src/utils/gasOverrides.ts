type GasOverrideOptions = {
  base?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
};

export type TransactionRequestRetryableGasOverrides = {
  deposit?: GasOverrideOptions;
};

export function applyGasOverrides({
  gasOverrides,
  estimatedGas,
  defaultGas,
}: {
  gasOverrides: GasOverrideOptions;
  estimatedGas?: bigint;
  defaultGas: bigint;
}) {
  const baseEstimatedGas = gasOverrides.base ?? estimatedGas ?? defaultGas;

  return gasOverrides.percentIncrease
    ? baseEstimatedGas + (baseEstimatedGas * gasOverrides.percentIncrease) / 100n
    : baseEstimatedGas;
}
