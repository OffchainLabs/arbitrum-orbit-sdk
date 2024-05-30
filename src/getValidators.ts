import { Address, PublicClient, decodeFunctionData, getAbiItem, getFunctionSelector } from 'viem';
import { rollupCreator, upgradeExecutor } from './contracts';
import { rollupAdminLogicABI } from './abi';

const createRollupFunctionSelector = getFunctionSelector(
  getAbiItem({ abi: rollupCreator.abi, name: 'createRollup' }),
);

const setValidatorFunctionSelector = getFunctionSelector(
  getAbiItem({ abi: rollupAdminLogicABI, name: 'setValidator' }),
);

const upgradeExecutorExecuteCallFunctionSelector = getFunctionSelector(
  getAbiItem({ abi: upgradeExecutor.abi, name: 'executeCall' }),
);

const ownerFunctionCalledEventAbi = getAbiItem({
  abi: rollupAdminLogicABI,
  name: 'OwnerFunctionCalled',
});

function getValidatorsFromFunctionData<
  TAbi extends typeof rollupCreator.abi | typeof rollupAdminLogicABI | typeof upgradeExecutor.abi,
>({ abi, data }: { abi: TAbi; data: `0x${string}` }) {
  const { args } = decodeFunctionData({
    abi,
    data,
  });
  if (typeof args === 'undefined') {
    return [];
  }
  return args;
}

type GetValidatorsParams = {
  /** Address of the rollup we're getting list of validators from */
  rollupAddress: Address;
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
 * @param GetValidatorsParams.rollupAddress
 *
 * @returns Promise<{@link GetValidatorsReturnType}> - The validators with a flag, whether or not we guarantee that all validators were fetched
 *
 * @example
 * const { isComplete, validators } = getValidators(client, { rollupAddress: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336' });
 *
 * if (isComplete) {
 *   // Validators were all fetched properly
 * } else {
 *   // Some validators might be missing
 * }
 */
export async function getValidators(
  client: PublicClient,
  { rollupAddress }: GetValidatorsParams,
): Promise<GetValidatorsReturnType> {
  const events = await client.getLogs({
    address: rollupAddress,
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
        const [data] = getValidatorsFromFunctionData({
          abi: rollupCreator.abi,
          data: tx.input,
        });
        if (typeof data === 'object' && 'validators' in data) {
          acc = new Set([...acc, ...data.validators]);
          return acc;
        }

        console.warn(
          `[getValidators:createRollupFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        isComplete = false;
        return acc;
      }
      case setValidatorFunctionSelector: {
        const [decodedValidator, isAdd] = getValidatorsFromFunctionData({
          abi: rollupAdminLogicABI,
          data: tx.input,
        });

        if (typeof decodedValidator === 'string' && typeof isAdd === 'boolean') {
          if (isAdd) {
            acc.add(decodedValidator);
          } else {
            acc.delete(decodedValidator);
          }
          return acc;
        }

        console.warn(
          `[getValidators:setValidatorFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        isComplete = false;
        return acc;
      }
      case upgradeExecutorExecuteCallFunctionSelector: {
        const upgradeExecutorCall = decodeFunctionData({
          abi: upgradeExecutor.abi,
          data: tx.input,
        });
        const [decodedValidators, isAdd] = getValidatorsFromFunctionData({
          abi: rollupAdminLogicABI,
          data: upgradeExecutorCall.args[1],
        });
        if (
          Array.isArray(isAdd) &&
          typeof isAdd[0] === 'boolean' &&
          Array.isArray(decodedValidators) &&
          typeof decodedValidators[0] === 'string'
        ) {
          decodedValidators.forEach((validator, i) => {
            if (isAdd[i]) {
              acc.add(validator);
            } else {
              acc.delete(validator);
            }
          });
          return acc;
        }

        console.warn(
          `[getValidators:upgradeExecutorExecuteCallFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        isComplete = false;
        return acc;
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
