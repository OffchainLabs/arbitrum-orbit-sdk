import { it, expect, expectTypeOf, describe, vi } from 'vitest';

import {
  AbiEncodingLengthMismatchError,
  AbiFunctionNotFoundError,
  InvalidAddressError,
  createPublicClient,
  http,
} from 'viem';
import { rollupAdminLogicPublicActions } from './rollupAdminLogicPublicActions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { mainnet } from 'viem/chains';

const rollupAdminLogicAddress = '0x5eF0D09d1E6204141B4d37530808eD19f60FBa35';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(rollupAdminLogicPublicActions({ rollup: rollupAdminLogicAddress }));

const randomAccount = privateKeyToAccount(generatePrivateKey());

describe('RollupAdminLogic parameter:', () => {
  it('require rollupAdminLogic parameter if not passed initially to the actions during initialization', () => {
    const clientWithoutRollupAdminLogicAddress = createPublicClient({
      chain: mainnet,
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
      rollup: rollupAdminLogicAddress,
    });
  });

  it('Doesn`t require rollupAdminLogic parameter if passed initially to the actions during initialization', () => {
    const clientWithRollupAdminLogicAddress = createPublicClient({
      chain: mainnet,
      transport: http(),
    }).extend(rollupAdminLogicPublicActions({ rollup: rollupAdminLogicAddress }));

    expectTypeOf<
      typeof clientWithRollupAdminLogicAddress.rollupAdminLogicReadContract<'amountStaked'>
    >().toBeCallableWith({
      functionName: 'amountStaked',
      args: [randomAccount.address],
    });
  });

  it('Allow rollupAdminLogic override parameter if passed initially to the actions during initialization', async () => {
    const clientWithRollupAdminLogicAddress = createPublicClient({
      chain: mainnet,
      transport: http(),
    }).extend(rollupAdminLogicPublicActions({ rollup: randomAccount.address }));

    expectTypeOf<
      typeof clientWithRollupAdminLogicAddress.rollupAdminLogicReadContract<'amountStaked'>
    >().toBeCallableWith({
      functionName: 'amountStaked',
      args: [randomAccount.address],
      rollup: rollupAdminLogicAddress,
    });

    const readContractSpy = vi.spyOn(clientWithRollupAdminLogicAddress, 'readContract');
    await clientWithRollupAdminLogicAddress.rollupAdminLogicReadContract({
      functionName: 'amountStaked',
      args: [randomAccount.address],
      rollup: rollupAdminLogicAddress,
    });

    expect(readContractSpy).toHaveBeenCalledWith({
      address: rollupAdminLogicAddress,
      abi: RollupAdminLogic__factory.abi,
      functionName: 'amountStaked',
      args: [randomAccount.address],
    });
    readContractSpy.mockClear();
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
