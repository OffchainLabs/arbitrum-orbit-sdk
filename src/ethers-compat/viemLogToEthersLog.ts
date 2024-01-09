import { Log as ViemLog } from 'viem';
import { Log as EthersLog } from '@ethersproject/abstract-provider';

export function viemLogToEthersLog(log: ViemLog): EthersLog {
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
