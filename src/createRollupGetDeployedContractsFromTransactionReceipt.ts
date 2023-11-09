import {
  TransactionReceipt,
  getAbiItem,
  getEventSelector,
  Log,
  decodeEventLog,
} from 'viem';

import { rollupCreator } from './contracts';

function findRollupCreatedEventLog(txReceipt: TransactionReceipt) {
  const abiItem = getAbiItem({ abi: rollupCreator.abi, name: 'RollupCreated' });
  const eventSelector = getEventSelector(abiItem);
  const log = txReceipt.logs.find((log) => log.topics[0] === eventSelector);

  if (typeof log === 'undefined') {
    throw new Error(
      `No "RollupCreated" logs found in logs for transaction: ${txReceipt.transactionHash}`
    );
  }

  return log;
}

function decodeRollupCreatedEventLog(log: Log<bigint, number>) {
  const decodedEventLog = decodeEventLog({ ...log, abi: rollupCreator.abi });

  if (decodedEventLog.eventName !== 'RollupCreated') {
    throw new Error(
      `Expected "RollupCreated" event but found: ${decodedEventLog.eventName}`
    );
  }

  return decodedEventLog;
}

export function createRollupGetDeployedContractsFromTransactionReceipt(
  txReceipt: TransactionReceipt
) {
  const eventLog = findRollupCreatedEventLog(txReceipt);
  const decodedEventLog = decodeRollupCreatedEventLog(eventLog);

  return decodedEventLog.args;
}
