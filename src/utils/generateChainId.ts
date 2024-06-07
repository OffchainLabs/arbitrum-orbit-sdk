/**
 * Generates a random chain ID.
 *
 * @returns {number} A randomly generated chain ID.
 *
 * @example
 * const chainId = generateChainId();
 * console.log(chainId); // Example output: 123456789
 */
export function generateChainId() {
  return Math.floor(Math.random() * 100000000000) + 1;
}
