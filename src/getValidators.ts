import {
  Address,
  Chain,
  Hex,
  PublicClient,
  Transport,
  decodeFunctionData,
  getAbiItem,
  getFunctionSelector,
} from 'viem';

import { rollupCreatorABI } from './contracts/RollupCreator';
import { rollupCreatorABI as rollupCreatorV1Dot1ABI } from './contracts/RollupCreator/v1.1';
import { upgradeExecutorABI } from './contracts/UpgradeExecutor';
import { gnosisSafeL2ABI } from './contracts/GnosisSafeL2';
import { rollupABI } from './contracts/Rollup';

import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { getLogsWithBatching } from './utils/getLogsWithBatching';

const createRollupABI = getAbiItem({ abi: rollupCreatorABI, name: 'createRollup' });
const createRollupFunctionSelector = getFunctionSelector(createRollupABI);

const createRollupV1Dot1ABI = getAbiItem({ abi: rollupCreatorV1Dot1ABI, name: 'createRollup' });
const createRollupV1Dot1FunctionSelector = getFunctionSelector(createRollupV1Dot1ABI);

const setValidatorABI = getAbiItem({ abi: rollupABI, name: 'setValidator' });
const setValidatorFunctionSelector = getFunctionSelector(setValidatorABI);

const executeCallABI = getAbiItem({ abi: upgradeExecutorABI, name: 'executeCall' });
const upgradeExecutorExecuteCallFunctionSelector = getFunctionSelector(executeCallABI);

const execTransactionABI = getAbiItem({ abi: gnosisSafeL2ABI, name: 'execTransaction' });
const safeL2FunctionSelector = getFunctionSelector(execTransactionABI);

const ownerFunctionCalledEventAbi = getAbiItem({ abi: rollupABI, name: 'OwnerFunctionCalled' });

function getValidatorsFromFunctionData<
  TAbi extends
    | (typeof createRollupABI)[]
    | (typeof createRollupV1Dot1ABI)[]
    | (typeof setValidatorABI)[],
>({ abi, data }: { abi: TAbi; data: Hex }) {
  const { args } = decodeFunctionData({
    abi,
    data,
  });
  return args;
}

function updateAccumulator(acc: Set<Address>, input: Hex) {
  const [validators, states] = getValidatorsFromFunctionData({
    abi: [setValidatorABI],
    data: input,
  });

  validators.forEach((validator, i) => {
    const isAdd = states[i];
    if (isAdd) {
      acc.add(validator);
    } else {
      acc.delete(validator);
    }
  });

  return acc;
}

export type GetValidatorsParams = {
  /** Address of the rollup we're getting list of validators from */
  rollup: Address;
};
export type GetValidatorsReturnType = {
  /**
   * If logs contain unknown signature, validators list might:
   * - contain false positives (validators that were removed, but returned as validator)
   * - contain false negatives (validators that were added, but not present in the list)
   */
  isAccurate: boolean;
  /** List of validators for the given rollup */
  validators: Address[];
};

/**
 *
 * @param {PublicClient} publicClient - The chain Viem Public Client
 * @param {GetValidatorsParams} GetValidatorsParams {@link GetValidatorsParams}
 *
 * @returns Promise<{@link GetValidatorsReturnType}>
 *
 * @remarks validators list is not guaranteed to be exhaustive if the `isAccurate` flag is false.
 * It might contain false positive (validators that were removed, but returned as validator)
 * or false negative (validators that were added, but not present in the list)
 *
 * @example
 * const { isAccurate, validators } = getValidators(client, { rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336' });
 *
 * if (isAccurate) {
 *   // Validators were all fetched properly
 * } else {
 *   // Validators list is not guaranteed to be accurate
 * }
 */
export async function getValidators<TChain extends Chain>(
  publicClient: PublicClient<Transport, TChain>,
  { rollup }: GetValidatorsParams,
): Promise<GetValidatorsReturnType> {
  let blockNumber: bigint;
  try {
    const createRollupTransactionHash = await createRollupFetchTransactionHash({
      rollup,
      publicClient,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: createRollupTransactionHash,
    });
    blockNumber = receipt.blockNumber;
  } catch (e) {
    blockNumber = 0n;
  }

  const events = await getLogsWithBatching(publicClient, {
    address: rollup,
    event: ownerFunctionCalledEventAbi,
    args: { id: 6n },
    fromBlock: blockNumber,
  });

  const txs = await Promise.all(
    events.map((event) =>
      publicClient.getTransaction({
        hash: event.transactionHash,
      }),
    ),
  );

  let isAccurate = true;
  const validators = txs.reduce((acc, tx) => {
    const txSelectedFunction = tx.input.slice(0, 10);

    switch (txSelectedFunction) {
      case createRollupFunctionSelector: {
        const [{ validators }] = getValidatorsFromFunctionData({
          abi: [createRollupABI],
          data: tx.input,
        });

        return new Set([...acc, ...validators]);
      }
      case createRollupV1Dot1FunctionSelector: {
        const [{ validators }] = getValidatorsFromFunctionData({
          abi: [createRollupV1Dot1ABI],
          data: tx.input,
        });

        return new Set([...acc, ...validators]);
      }
      case setValidatorFunctionSelector: {
        return updateAccumulator(acc, tx.input);
      }
      case upgradeExecutorExecuteCallFunctionSelector: {
        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: tx.input,
        });
        return updateAccumulator(acc, executeCallCalldata[1]);
      }
      case safeL2FunctionSelector: {
        const { args: execTransactionCalldata } = decodeFunctionData({
          abi: [execTransactionABI],
          data: tx.input,
        });

        const execTransactionCalldataData = execTransactionCalldata[2];
        const execTransactionCalldataDataFnSelector = execTransactionCalldataData.slice(0, 10);

        if (execTransactionCalldataDataFnSelector !== upgradeExecutorExecuteCallFunctionSelector) {
          console.warn(
            `[getValidators] unable to decode "execTransaction" calldata, tx id: ${tx.hash}`,
          );
          isAccurate = false;
          return acc;
        }

        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: execTransactionCalldataData,
        });

        return updateAccumulator(acc, executeCallCalldata[1]);
      }
      default: {
        console.warn(`[getValidators] unknown 4bytes, tx id: ${tx.hash}`);
        isAccurate = false;
        return acc;
      }
    }
  }, new Set<Address>());

  return {
    isAccurate,
    validators: [...validators],
  };
}
