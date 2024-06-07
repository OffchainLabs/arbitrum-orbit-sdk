import { TransactionReceipt, getAbiItem, getEventSelector, Log, decodeEventLog } from 'viem';
import { rollupCreator } from './contracts';
import { CoreContracts } from './types/CoreContracts';

/**
 * Finds the RollupCreated event log in the transaction receipt logs.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt
 * @returns {Log<bigint, number>} - The log containing the RollupCreated event
 * @throws {Error} - If no RollupCreated log is found
 */
function findRollupCreatedEventLog(txReceipt: TransactionReceipt) {
  const abiItem = getAbiItem({ abi: rollupCreator.abi, name: 'RollupCreated' });
  const eventSelector = getEventSelector(abiItem);
  const log = txReceipt.logs.find((log) => log.topics[0] === eventSelector);

  if (typeof log === 'undefined') {
    throw new Error(
      `No "RollupCreated" logs found in logs for transaction: ${txReceipt.transactionHash}`,
    );
  }

  return log;
}

/**
 * Decodes the RollupCreated event log.
 *
 * @param {Log<bigint, number>} log - The log to decode
 * @returns {Object} - The decoded event log
 * @throws {Error} - If the event name is not RollupCreated
 */
function decodeRollupCreatedEventLog(log: Log<bigint, number>) {
  const decodedEventLog = decodeEventLog({ ...log, abi: rollupCreator.abi });

  if (decodedEventLog.eventName !== 'RollupCreated') {
    throw new Error(`Expected "RollupCreated" event but found: ${decodedEventLog.eventName}`);
  }

  return decodedEventLog;
}

export type CreateRollupTransactionReceipt = TransactionReceipt & {
  /**
   * Gets the core contracts from the transaction receipt.
   *
   * @returns {CoreContracts} - The core contracts
   */
  getCoreContracts(): CoreContracts;
};

/**
 * Prepares the transaction receipt by adding a method to get core contracts.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt
 * @returns {CreateRollupTransactionReceipt} - The prepared transaction receipt
 */
export function createRollupPrepareTransactionReceipt(
  txReceipt: TransactionReceipt,
): CreateRollupTransactionReceipt {
  return {
    ...txReceipt,
    getCoreContracts: function () {
      const eventLog = findRollupCreatedEventLog(txReceipt);
      const decodedEventLog = decodeRollupCreatedEventLog(eventLog);

      const { rollupAddress, inboxAddress, ...rest } = decodedEventLog.args;

      return {
        rollup: rollupAddress,
        inbox: inboxAddress,
        ...rest,
        deployedAtBlockNumber: Number(txReceipt.blockNumber),
      };
    },
  };
}
