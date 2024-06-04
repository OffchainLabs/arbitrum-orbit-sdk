/**
 * Generates a random chain ID that is a positive integer less than
 * 100,000,000,001.
 */
export function generateChainId() {
  return Math.floor(Math.random() * 100000000000) + 1;
}
