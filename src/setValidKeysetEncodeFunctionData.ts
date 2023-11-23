import { encodeFunctionData, parseAbi } from 'viem';

export function setValidKeysetEncodeFunctionData(keyset: `0x${string}`) {
  return encodeFunctionData({
    abi: parseAbi(['function setValidKeyset(bytes keysetBytes)']),
    functionName: 'setValidKeyset',
    args: [keyset],
  });
}
