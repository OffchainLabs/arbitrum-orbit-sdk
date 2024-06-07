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
 * Converts an Ethers.js log to a Viem log.
 *
 * @param {EthersLog} log - The log object from Ethers.js
 * @returns {ViemLog<bigint, number, false>} - The converted log object for Viem
 */
function ethersLogToViemLog(log: EthersLog): ViemLog<bigint, number, false> {
  return {
    address: log.address as Address,
    blockHash: log.blockHash as Hash,
    blockNumber: BigInt(log.blockNumber),
    data: log.data as Hex,
    logIndex: log.logIndex,
    removed: log.removed,
    topics: log.topics as Hash[],
    transactionHash: log.transactionHash as Hash,
    transactionIndex: log.transactionIndex,
  };
}

/**
 * Converts an Ethers.js transaction receipt to a Viem transaction receipt.
 *
 * @param {EthersTransactionReceipt} receipt - The transaction receipt from Ethers.js
 * @returns {ViemTransactionReceipt} - The converted transaction receipt for Viem
 */
export function ethersTransactionReceiptToViemTransactionReceipt(
  receipt: EthersTransactionReceipt,
): ViemTransactionReceipt {
  return {
    blockHash: receipt.blockHash as Hash,
    blockNumber: BigInt(receipt.blockNumber),
    contractAddress: receipt.contractAddress as Address,
    cumulativeGasUsed: BigInt(receipt.cumulativeGasUsed.toString()),
    effectiveGasPrice: BigInt(receipt.effectiveGasPrice.toString()),
    from: receipt.from as Address,
    gasUsed: BigInt(receipt.gasUsed.toString()),
    logs: receipt.logs.map(ethersLogToViemLog),
    logsBloom: receipt.logsBloom as Hex,
    status: receipt.status === 1n ? 'success' : 'failure',
    to: receipt.to as Address,
    transactionHash: receipt.transactionHash as Hash,
    transactionIndex: receipt.transactionIndex,
    type: receipt.type,
  };
}
