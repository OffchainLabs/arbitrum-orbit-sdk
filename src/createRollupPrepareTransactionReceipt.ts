import {
  TransactionReceipt,
  getAbiItem,
  getEventSelector,
  Log,
  decodeEventLog,
  DecodeEventLogReturnType,
} from 'viem';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { CoreContracts } from './types/CoreContracts';

function findRollupCreatedEventLog(txReceipt: TransactionReceipt): Log<bigint, number> {
  const abiItem = getAbiItem({ abi: rollupCreatorABI, name: 'RollupCreated' });
  const eventSelector = getEventSelector(abiItem);
  const log = txReceipt.logs.find((log) => log.topics[0] === eventSelector);

  if (typeof log === 'undefined') {
    throw new Error(
      `No "RollupCreated" logs found in logs for transaction: ${txReceipt.transactionHash}`,
    );
  }

  return log;
}

type DecodeRollupCreatedEventLogReturnType = DecodeEventLogReturnType<
  typeof rollupCreatorABI,
  'RollupCreated'
>;

function decodeRollupCreatedEventLog(
  log: Log<bigint, number>,
): DecodeRollupCreatedEventLogReturnType {
  const decodedEventLog = decodeEventLog({ ...log, abi: rollupCreatorABI });

  if (decodedEventLog.eventName !== 'RollupCreated') {
    throw new Error(`Expected "RollupCreated" event but found: ${decodedEventLog.eventName}`);
  }

  return decodedEventLog;
}

export type CreateRollupTransactionReceipt = TransactionReceipt & {
  getCoreContracts(): CoreContracts;
};

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
