/**
 * Generates a random chain ID as a number.
 *
 * @returns {number} A randomly generated chain ID.
 *
 * @example
 * const chainId = generateChainId();
 * console.log(chainId); // Outputs a random chain ID
 */
export function generateChainId() {
  return Math.floor(Math.random() * 100000000000) + 1;
}
