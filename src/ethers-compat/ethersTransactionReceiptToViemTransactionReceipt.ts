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

/**
 * Converts an Ethereum log (from `EthersLog`) to a Viem log (to `ViemLog`).
 * This function maps the fields from the Ethereum log to the corresponding fields in the Viem log,
 * including conversion of data types where necessary.
 *
 * @param {EthersLog} log - The Ethereum log to convert.
 * @returns {ViemLog<bigint, number, false>} The converted Viem log.
 */
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

/**
 * Converts an Ethereum transaction receipt (from `EthersTransactionReceipt`) to
 * a Viem transaction receipt (to `ViemTransactionReceipt`). This function maps
 * the fields from the Ethereum receipt to the corresponding fields in the Viem
 * receipt, including conversion of data types where necessary.
 *
 * @param {EthersTransactionReceipt} receipt - The Ethereum transaction receipt to convert.
 * @returns {ViemTransactionReceipt} The converted Viem transaction receipt.
 */
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
