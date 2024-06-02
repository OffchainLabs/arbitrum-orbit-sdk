import { TransactionReceipt, getAbiItem, getEventSelector, Log, decodeEventLog } from 'viem';

import { rollupCreator } from './contracts';
import { CoreContracts } from './types/CoreContracts';

/**
 * Finds the "RollupCreated" event log within the given transaction receipt.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt to search for the event log.
 * @returns {Log} The log containing the "RollupCreated" event.
 * @throws Will throw an error if no "RollupCreated" logs are found.
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
 * Decodes the "RollupCreated" event log.
 *
 * @param {Log<bigint, number>} log - The log to decode.
 * @returns {Object} The decoded event log.
 * @throws Will throw an error if the event name is not "RollupCreated".
 */
function decodeRollupCreatedEventLog(log: Log<bigint, number>) {
  const decodedEventLog = decodeEventLog({ ...log, abi: rollupCreator.abi });

  if (decodedEventLog.eventName !== 'RollupCreated') {
    throw new Error(`Expected "RollupCreated" event but found: ${decodedEventLog.eventName}`);
  }

  return decodedEventLog;
}

export type CreateRollupTransactionReceipt = TransactionReceipt & {
  getCoreContracts(): CoreContracts;
};

/**
 * Creates a transaction receipt for preparing a rollup, including core contract
 * information. Returns a {@link CreateRollupTransactionReceipt}.
 *
 * @param {TransactionReceipt} txReceipt - The transaction receipt from which to create the rollup receipt.
 * @returns {CreateRollupTransactionReceipt} The rollup transaction receipt with core contracts information.
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
