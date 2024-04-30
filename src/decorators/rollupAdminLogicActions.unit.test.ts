import { it, expect, expectTypeOf, describe } from 'vitest';

import {
  AbiEncodingLengthMismatchError,
  AbiFunctionNotFoundError,
  InvalidAddressError,
  createPublicClient,
  http,
} from 'viem';
import { nitroTestnodeL2 } from '../chains';
import { rollupAdminLogicPublicActions } from './rollupAdminLogicPublicActions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const rollupAdminLogicAddress = '0x42b5da0625cf278067955f07045f63cafd79274f';

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(rollupAdminLogicPublicActions({ rollupAdminLogic: rollupAdminLogicAddress }));

const randomAccount = privateKeyToAccount(generatePrivateKey());

describe('RollupAdminLogic parameter:', () => {
  it('require rollupAdminLogic parameter if not passed initially to the actions during initialization', () => {
    const clientWithoutRollupAdminLogicAddress = createPublicClient({
      chain: nitroTestnodeL2,
      transport: http(),
    }).extend(rollupAdminLogicPublicActions({}));

    // @ts-expect-error rollupAdminLogic is required
    clientWithoutRollupAdminLogicAddress.rollupAdminLogicReadContract({
      functionName: 'amountStaked',
      args: [randomAccount.address],
    });

    expectTypeOf<
      typeof clientWithoutRollupAdminLogicAddress.rollupAdminLogicReadContract<'amountStaked'>
    >().toBeCallableWith({
      functionName: 'amountStaked',
      args: [randomAccount.address],
      rollupAdminLogic: rollupAdminLogicAddress,
    });
  });

  it('Doesn`t require rollupAdminLogic parameter if passed initially to the actions during initialization', () => {
    const clientWithRollupAdminLogicAddress = createPublicClient({
      chain: nitroTestnodeL2,
      transport: http(),
    }).extend(rollupAdminLogicPublicActions({ rollupAdminLogic: rollupAdminLogicAddress }));

    expectTypeOf<
      typeof clientWithRollupAdminLogicAddress.rollupAdminLogicReadContract<'amountStaked'>
    >().toBeCallableWith({
      functionName: 'amountStaked',
      args: [randomAccount.address],
    });
  });

  it('Allow rollupAdminLogic override parameter if passed initially to the actions during initialization', () => {
    const clientWithRollupAdminLogicAddress = createPublicClient({
      chain: nitroTestnodeL2,
      transport: http(),
    }).extend(rollupAdminLogicPublicActions({ rollupAdminLogic: rollupAdminLogicAddress }));

    expectTypeOf<
      typeof clientWithRollupAdminLogicAddress.rollupAdminLogicReadContract<'amountStaked'>
    >().toBeCallableWith({
      functionName: 'amountStaked',
      args: [randomAccount.address],
      rollupAdminLogic: rollupAdminLogicAddress,
    });
  });
});

it('Infer parameters based on function name', async () => {
  expect(
    client.rollupAdminLogicPrepareTransactionRequest({
      functionName: 'setLoserStakeEscrow',
      // @ts-expect-error Args are missing
      args: [],
      upgradeExecutor: false,
      account: randomAccount.address,
    }),
  ).rejects.toThrowError(AbiEncodingLengthMismatchError);

  expect(
    client.rollupAdminLogicPrepareTransactionRequest({
      functionName: 'setLoserStakeEscrow',
      // @ts-expect-error Args are of the wrong type
      args: [true],
      upgradeExecutor: false,
      account: randomAccount.address,
    }),
  ).rejects.toThrowError(InvalidAddressError);

  expect(
    client
      // @ts-expect-error Args are required for `setLoserStakeEscrow`
      .rollupAdminLogicPrepareTransactionRequest({
        functionName: 'setLoserStakeEscrow',
        upgradeExecutor: false,
        account: randomAccount.address,
      }),
  ).rejects.toThrow(AbiEncodingLengthMismatchError);

  expectTypeOf<
    typeof client.rollupAdminLogicPrepareTransactionRequest<'setLoserStakeEscrow'>
  >().toBeCallableWith({
    functionName: 'setLoserStakeEscrow',
    args: [randomAccount.address],
    upgradeExecutor: false,
    account: randomAccount.address,
  });

  // Function doesn't exist
  expect(
    client.rollupAdminLogicPrepareTransactionRequest({
      // @ts-expect-error Function not available
      functionName: 'notExisting',
    }),
  ).rejects.toThrowError(AbiFunctionNotFoundError);
});
