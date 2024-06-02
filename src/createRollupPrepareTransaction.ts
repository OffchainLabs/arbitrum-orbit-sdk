import { Transaction, decodeFunctionData } from 'viem';

import { rollupCreator } from './contracts';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';

/**
 * Decodes the function data for the createRollup function call using the Rollup Creator ABI.
 *
 * @param {string} data - The hexadecimal string representing the encoded function data.
 * @returns {Object} The decoded function data.
 */
function createRollupDecodeFunctionData(data: `0x${string}`) {
  return decodeFunctionData({
    abi: rollupCreator.abi,
    data,
  });
}

export type CreateRollupTransaction = Transaction & {
  /**
   * Retrieves the inputs for the createRollup function call.
   *
   * @returns {CreateRollupFunctionInputs} The inputs for the createRollup function.
   */
  getInputs(): CreateRollupFunctionInputs;
};

/**
 * Creates a transaction object for preparing a createRollup function call,
 * which extends the base Transaction type and includes a method to retrieve the
 * inputs for creating a rollup.
 *
 * @param {Transaction} tx - The base transaction object.
 * @returns {CreateRollupTransaction} The prepared transaction object with added getInputs method.
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
