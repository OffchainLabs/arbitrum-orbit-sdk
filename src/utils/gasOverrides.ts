export type GasOverrideOptions = {
  base?: bigint;
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  gasLimit?: GasOverrideOptions;
};

/**
 * Calculates the gas limit with a percentage increase based on the provided base and percent increase values.
 *
 * @param {Object} params - The parameters for the gas limit calculation.
 * @param {bigint} params.base - The base gas limit.
 * @param {bigint} [params.percentIncrease=0n] - The percentage increase to apply to the base gas limit.
 *
 * @returns {bigint} - The calculated gas limit with the percentage increase applied.
 *
 * @example
 * const gasLimit = applyPercentIncrease({ base: 1000n, percentIncrease: 20n });
 * console.log(gasLimit); // Outputs: 1200n
 */
export function applyPercentIncrease({
  base,
  percentIncrease = 0n,
}: {
  base: bigint;
  percentIncrease?: bigint;
}): bigint {
  return base + (base * percentIncrease) / 100n;
}
