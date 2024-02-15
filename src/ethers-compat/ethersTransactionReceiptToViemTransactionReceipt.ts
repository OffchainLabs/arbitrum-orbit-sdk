import {
  Log as EthersLog,
  TransactionReceipt as EthersTransactionReceipt,
} from '@ethersproject/abstract-provider';
import {
  Log as ViemLog,
  Hash,
  Hex,
  Address,
  TransactionReceipt as ViemTransactionReceipt,
} from 'viem';

function ethersLogToViemLog(log: EthersLog): ViemLog<bigint, number, false> {
  return {
    blockNumber: BigInt(log.blockNumber),
    blockHash: log.blockHash as Hash,
    transactionIndex: log.transactionIndex,
    removed: log.removed,
    address: log.address as Address,
    data: log.data as Hex,
    topics: log.topics as [Hex, ...Hex[]],
    transactionHash: log.transactionHash as Hash,
    logIndex: log.logIndex,
  };
}

export function ethersTransactionReceiptToViemTransactionReceipt(
  receipt: EthersTransactionReceipt,
): ViemTransactionReceipt {
  return {
    blockHash: receipt.blockHash as `0x${string}`,
    blockNumber: BigInt(receipt.blockNumber),
    contractAddress: receipt.contractAddress as Address,
    cumulativeGasUsed: receipt.cumulativeGasUsed.toBigInt(),
    effectiveGasPrice: receipt.effectiveGasPrice.toBigInt(),
    from: receipt.from as Address,
    gasUsed: receipt.gasUsed.toBigInt(),
    logs: receipt.logs.map((log) => ethersLogToViemLog(log)),
    logsBloom: receipt.logsBloom as `0x${string}`,
    status: receipt.status === 1 ? 'success' : 'reverted',
    to: receipt.to as Address,
    transactionHash: receipt.transactionHash as `0x${string}`,
    transactionIndex: receipt.transactionIndex,
    type: '0x' + receipt.type.toString(16),
  };
}
