import { encodeFunctionData, parseAbi } from 'viem';

/**
 * Encodes the function data for setting a valid keyset.
 *
 * @param {`0x${string}`} keyset - The keyset in bytes format prefixed with '0x'.
 * @returns {string} The encoded function data.
 */
export function setValidKeysetEncodeFunctionData(keyset: `0x${string}`): string {
  return encodeFunctionData({
    abi: parseAbi(['function setValidKeyset(bytes keysetBytes)']),
    functionName: 'setValidKeyset',
    args: [keyset],
  });
}
