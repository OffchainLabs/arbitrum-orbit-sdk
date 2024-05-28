import {
  Abi,
  Address,
  PublicClient,
  decodeFunctionData,
  getAbiItem,
  getFunctionSelector,
} from 'viem';
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

export async function getValidators(
  client: PublicClient,
  { rollupAddress }: { rollupAddress: Address },
) {
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

  const validators = txs.flatMap((tx) => {
    const txSelectedFunction = tx.input.slice(0, 10);

    switch (txSelectedFunction) {
      case createRollupFunctionSelector: {
        const [data] = getValidatorsFromFunctionData({
          abi: rollupCreator.abi,
          data: tx.input,
        });
        if (typeof data === 'object' && 'validators' in data) {
          return data.validators;
        }

        console.warn(
          `[getValidators:createRollupFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        return [];
      }
      case setValidatorFunctionSelector: {
        const [decodedValidators] = getValidatorsFromFunctionData({
          abi: rollupAdminLogicABI,
          data: tx.input,
        });

        if (typeof decodedValidators === 'string') {
          return decodedValidators;
        }

        console.warn(
          `[getValidators:setValidatorFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        return [];
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
        if (typeof isAdd === 'boolean' && typeof decodedValidators === 'string') {
          return isAdd ? decodedValidators : [];
        }

        console.warn(
          `[getValidators:setValidatorFunctionSelector] invalid data, tx id: ${tx.hash}`,
        );
        return [];
      }
      default: {
        console.warn(`[getValidators] unknown 4bytes, tx id: ${tx.hash}`);
      }
    }
  });

  return validators.filter((validator) => validator) as `0x${string}`[];
}
