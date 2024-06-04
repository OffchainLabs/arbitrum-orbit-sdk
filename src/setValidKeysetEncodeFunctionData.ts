import { encodeFunctionData, parseAbi } from 'viem';

/**
 * setValidKeysetEncodeFunctionData encodes a keyset into function data to set a
 * valid keyset.
 */
export function setValidKeysetEncodeFunctionData(keyset: `0x${string}`) {
  return encodeFunctionData({
    abi: parseAbi(['function setValidKeyset(bytes keysetBytes)']),
    functionName: 'setValidKeyset',
    args: [keyset],
  });
}
