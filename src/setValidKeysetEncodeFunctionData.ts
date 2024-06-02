import { encodeFunctionData, parseAbi } from 'viem';

/**
 * Encodes the function data for setting a valid keyset by parsing the ABI and
 * encoding the function name and arguments.
 *
 * @param {string} keyset - The keyset in hexadecimal string format prefixed with '0x'.
 * @returns {string} - The encoded function data for setting a valid keyset.
 */
export function setValidKeysetEncodeFunctionData(keyset: `0x${string}`) {
  return encodeFunctionData({
    abi: parseAbi(['function setValidKeyset(bytes keysetBytes)']),
    functionName: 'setValidKeyset',
    args: [keyset],
  });
}
