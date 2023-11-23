import { Transaction, decodeFunctionData } from 'viem';

import { rollupCreator } from './contracts';
import { CreateRollupFunctionParams } from './createRollup';

function createRollupDecodeFunctionData(data: `0x${string}`) {
  return decodeFunctionData({
    abi: rollupCreator.abi,
    data,
  });
}

export type CreateRollupTransaction = Transaction & {
  getInput(): CreateRollupFunctionParams;
};

export function createRollupPrepareTransaction(
  tx: Transaction
): CreateRollupTransaction {
  return {
    ...tx,
    getInput: function () {
      const args = createRollupDecodeFunctionData(tx.input).args;

      if (typeof args === 'undefined') {
        throw new Error(
          `[createRollupPrepareTransaction] failed to decode function data`
        );
      }

      const [input] = args;

      if (typeof input === 'undefined' || typeof input === 'string') {
        throw new Error(
          `[createRollupPrepareTransaction] failed to decode function data`
        );
      }

      return input;
    },
  };
}
