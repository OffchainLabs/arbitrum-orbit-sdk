import { Transaction, decodeFunctionData } from 'viem';

import { rollupCreator } from './contracts';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';

function createRollupDecodeFunctionData(data: `0x${string}`) {
  return decodeFunctionData({
    abi: rollupCreator.abi,
    data,
  });
}

export type CreateRollupTransaction = Transaction & {
  getInputs(): CreateRollupFunctionInputs;
};

export function createRollupPrepareTransaction(tx: Transaction): CreateRollupTransaction {
  return {
    ...tx,
    getInputs: function () {
      const { functionName, args } = createRollupDecodeFunctionData(tx.input);

      if (functionName !== 'createRollup') {
        throw new Error(`
          [createRollupPrepareTransaction] expected function name to be "createRollup" but got "${functionName}"
        `);
      }

      if (typeof args === 'undefined') {
        throw new Error(`[createRollupPrepareTransaction] failed to decode function data`);
      }

      return args;
    },
  };
}
