import { Log as ViemLog, TransactionReceipt as ViemTransactionReceipt } from 'viem';
import {
  Log as EthersLog,
  TransactionReceipt as EthersTransactionReceipt,
} from '@ethersproject/abstract-provider';
import { BigNumber } from 'ethers';

/**
 * Converts a Viem log to an Ethers log.
 *
 * @param {ViemLog} log - The log object from Viem.
 * @returns {EthersLog} - The converted log object for Ethers.
 */
function viemLogToEthersLog(log: ViemLog): EthersLog {
  return {
    blockNumber: Number(log.blockNumber),
    blockHash: log.blockHash!,
    transactionIndex: log.transactionIndex!,
    removed: log.removed,
    address: log.address,
    data: log.data,
    topics: log.topics,
    transactionHash: log.transactionHash!,
    logIndex: log.logIndex!,
  };
}

/**
 * Converts a Viem transaction receipt to an Ethers transaction receipt.
 *
 * @param {ViemTransactionReceipt} receipt - The transaction receipt object from Viem.
 * @returns {EthersTransactionReceipt} - The converted transaction receipt object for Ethers.
 */
export function viemTransactionReceiptToEthersTransactionReceipt(
  receipt: ViemTransactionReceipt,
): EthersTransactionReceipt {
  return {
    to: receipt.to!,
    from: receipt.from!,
    contractAddress: receipt.contractAddress!,
    transactionIndex: receipt.transactionIndex,
    gasUsed: BigNumber.from(receipt.gasUsed),
    logsBloom: receipt.logsBloom,
    blockHash: receipt.blockHash,
    transactionHash: receipt.transactionHash,
    logs: receipt.logs.map((log) => viemLogToEthersLog(log)),
    blockNumber: Number(receipt.blockNumber),
    // todo: if we need this we can add it later
    confirmations: -1,
    cumulativeGasUsed: BigNumber.from(receipt.cumulativeGasUsed),
    effectiveGasPrice: BigNumber.from(receipt.effectiveGasPrice),
    // all transactions that we care about are well past byzantium
    byzantium: true,
    type: Number(receipt.type),
    status: receipt.status === 'success' ? 1 : 0,
  };
}
