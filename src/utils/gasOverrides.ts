export type GasOverrideOptions = {
  /**
   * The base gas value.
   * @type {bigint}
   */
  base?: bigint;
  /**
   * The percentage increase to apply to the base gas value.
   * @type {bigint}
   */
  percentIncrease?: bigint;
};

export type TransactionRequestGasOverrides = {
  /**
   * Gas limit override options.
   * @type {GasOverrideOptions}
   */
  gasLimit?: GasOverrideOptions;
};

/**
 * Applies a percentage increase to a base gas value.
 *
 * @param {Object} params - The parameters for the function.
 * @param {bigint} params.base - The base gas value.
 * @param {bigint} [params.percentIncrease=0n] - The percentage increase to apply to the base gas value.
 * @returns {bigint} The new gas value after applying the percentage increase.
 *
 * @example
 * const newGasValue = applyPercentIncrease({ base: 1000n, percentIncrease: 10n });
 * console.log(newGasValue); // 1100n
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
