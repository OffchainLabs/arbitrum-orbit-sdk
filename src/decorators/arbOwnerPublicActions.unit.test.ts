import { describe, it, expect, expectTypeOf } from 'vitest';

import { AbiFunctionNotFoundError, createPublicClient, http } from 'viem';
import { nitroTestnodeL2 } from '../chains';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const client10 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOsVersion: 10 }));
const client11 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOsVersion: 11 }));
const client20 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOsVersion: 20 }));
const randomAccount = privateKeyToAccount(generatePrivateKey());
const upgradeExecutorAddress = '0x24198F8A339cd3C47AEa3A764A20d2dDaB4D1b5b';

describe('Accept function name based on arbOSVersion', async () => {
  it('Version 10', () => {
    expectTypeOf<typeof client10.arbOwnerReadContract<'onlyOnArbOS10'>>().toBeCallableWith({
      functionName: 'onlyOnArbOS10',
    });

    expectTypeOf<
      typeof client10.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [[randomAccount.address, randomAccount.address]],
    });

    expect(
      client10.arbOwnerReadContract({
        // @ts-expect-error Not available for version 10
        functionName: 'onlyOnArbOS20',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });

  it('Version 11', () => {
    expectTypeOf<typeof client11.arbOwnerReadContract<'onlyOnArbOS11'>>().toBeCallableWith({
      functionName: 'onlyOnArbOS11',
    });

    expectTypeOf<
      typeof client11.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [100n],
    });

    expect(
      client11.arbOwnerReadContract({
        // @ts-expect-error Not available for version 11
        functionName: 'onlyOnArbOS20',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });

  it('Version 20', () => {
    expectTypeOf<typeof client20.arbOwnerReadContract<'getInfraFeeAccount'>>().toBeCallableWith({
      functionName: 'getInfraFeeAccount',
    });

    expectTypeOf<
      typeof client20.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [randomAccount.address],
    });

    expect(
      client20.arbOwnerReadContract({
        // @ts-expect-error Not available for version 20
        functionName: 'onlyOnArbOS10',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
});

// Those tests won't fail if the return type is wrong
// But they will display an error in the IDE
describe('Type return values for function in multiple versions', () => {
  it('Version 10', () => {
    expectTypeOf(
      client10.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<`0x${string}`>();
  });

  it('Version 11', () => {
    expectTypeOf(
      client11.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<bigint>();
  });
  it('Version 11', () => {
    expectTypeOf(
      client20.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<readonly `0x${string}`[]>();
  });
});
