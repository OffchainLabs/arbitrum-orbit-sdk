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
import { rollupCreator, upgradeExecutor } from './contracts';
import { rollupAdminLogicABI, safeL2ABI } from './abi';

const createRollupABI = getAbiItem({ abi: rollupCreator.abi, name: 'createRollup' });
const createRollupFunctionSelector = getFunctionSelector(createRollupABI);

const setValidatorABI = getAbiItem({ abi: rollupAdminLogicABI, name: 'setValidator' });
const setValidatorFunctionSelector = getFunctionSelector(setValidatorABI);

const executeCallABI = getAbiItem({ abi: upgradeExecutor.abi, name: 'executeCall' });
const upgradeExecutorExecuteCallFunctionSelector = getFunctionSelector(executeCallABI);

const execTransactionABI = getAbiItem({ abi: safeL2ABI, name: 'execTransaction' });
const safeL2FunctionSelector = getFunctionSelector(execTransactionABI);

const ownerFunctionCalledEventAbi = getAbiItem({
  abi: rollupAdminLogicABI,
  name: 'OwnerFunctionCalled',
});

function getValidatorsFromFunctionData<
  TAbi extends (typeof createRollupABI)[] | (typeof setValidatorABI)[],
>({ abi, data }: { abi: TAbi; data: Hex }) {
  const { args } = decodeFunctionData({
    abi,
    data,
  });
  if (typeof args === 'undefined') {
    return [];
  }
  return args;
}

function setValidators(acc: Set<Address>, input: Hex) {
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

type GetValidatorsParams = {
  /** Address of the rollup we're getting list of validators from */
  rollup: Address;
};
type GetValidatorsReturnType = {
  /** If logs contain unknown signature, validators list is not guaranteed to be complete */
  isComplete: boolean;
  /** List of validators for the given rollup */
  validators: Address[];
};

/**
 *
 * @param {PublicClient} client - The chain Viem Public Client
 * @param {GetValidatorsParams} GetValidatorsParams {@link GetValidatorsParams}
 * @param GetValidatorsParams.rollup
 *
 * @returns Promise<{@link GetValidatorsReturnType}> - The validators with a flag, whether or not we guarantee that all validators were fetched
 *
 * @example
 * const { isComplete, validators } = getValidators(client, { rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336' });
 *
 * if (isComplete) {
 *   // Validators were all fetched properly
 * } else {
 *   // Some validators might be missing
 * }
 */
export async function getValidators<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { rollup }: GetValidatorsParams,
): Promise<GetValidatorsReturnType> {
    address: rollup,
    event: ownerFunctionCalledEventAbi,
    args: { id: 6n },
    fromBlock: 0n,
    toBlock: 'latest',
  });

  const txs = await Promise.all(
    events.map((event) =>
      client.getTransaction({
        hash: event.transactionHash,
      }),
    ),
  );

  let isComplete = true;
  const validators = txs.reduce((acc, tx) => {
    const txSelectedFunction = tx.input.slice(0, 10);

    switch (txSelectedFunction) {
      case createRollupFunctionSelector: {
        const [{ validators }] = getValidatorsFromFunctionData({
          abi: [createRollupABI],
          data: tx.input,
        });

        acc = new Set([...acc, ...validators]);
        return acc;
      }
      case setValidatorFunctionSelector: {
        return setValidators(acc, tx.input);
      }
      case upgradeExecutorExecuteCallFunctionSelector: {
        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: tx.input,
        });
        return setValidators(acc, executeCallCalldata[1]);
      }
      case safeL2FunctionSelector: {
        const { args: execTransactionCalldata } = decodeFunctionData({
          abi: [execTransactionABI],
          data: tx.input,
        });
        const { args: executeCallCalldata } = decodeFunctionData({
          abi: [executeCallABI],
          data: execTransactionCalldata[2],
        });
        return setValidators(acc, executeCallCalldata[1]);
      }
      default: {
        console.warn(`[getValidators] unknown 4bytes, tx id: ${tx.hash}`);
        isComplete = false;
        return acc;
      }
    }
  }, new Set<Address>());

  return {
    isComplete,
    validators: [...validators],
  };
}
