import { encodeFunctionData, parseAbi } from 'viem';

export function setL2BaseFeeEnocdeFunctionData(priceInWei: bigint) {
  return encodeFunctionData({
    abi: parseAbi(['function setL2BaseFee(uint256 priceInWei)']),
    functionName: 'setL2BaseFee',
    args: [priceInWei],
  });
}

export function setMinimumL2BaseFeeEnocdeFunctionData(priceInWei: bigint) {
  return encodeFunctionData({
    abi: parseAbi(['function setMinimumL2BaseFee(uint256 priceInWei)']),
    functionName: 'setMinimumL2BaseFee',
    args: [priceInWei],
  });
}
