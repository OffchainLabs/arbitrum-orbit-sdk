import { Transaction, decodeFunctionData } from 'viem';

import { rollupCreator } from './contracts';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';

/**
 * Decodes the function data for the createRollup function.
 *
 * @param {`0x${string}`} data - The encoded function data
 * @returns {Object} The decoded function data
 */
function createRollupDecodeFunctionData(data: `0x${string}`) {
  return decodeFunctionData({
    abi: rollupCreator.abi,
    data,
  });
}

/**
 * @typedef {Object} CreateRollupTransaction
 * @property {Function} getInputs - Retrieves the inputs for the createRollup function
 */
export type CreateRollupTransaction = Transaction & {
  getInputs(): CreateRollupFunctionInputs;
};

/**
 * Prepares a transaction object by adding a method to decode its inputs.
 *
 * @param {Transaction} tx - The transaction object
 * @returns {CreateRollupTransaction} The transaction object with an added method to decode its inputs
 */
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
