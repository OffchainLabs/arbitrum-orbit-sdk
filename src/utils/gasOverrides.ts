export type GasOverrideOptions = {
  base?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
};

/**
 * applyPercentIncrease applies a percent increase to a base value and returns
 * the updated value.
 */
export function applyPercentIncrease({
  base,
  percentIncrease = 0n,
}: {
  base: bigint;
  percentIncrease?: bigint;
}) {
  return base + (base * percentIncrease) / 100n;
}
