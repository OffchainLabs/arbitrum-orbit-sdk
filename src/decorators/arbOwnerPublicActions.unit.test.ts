import { describe, it, expect, expectTypeOf } from 'vitest';

import { AbiFunctionNotFoundError, createPublicClient, http } from 'viem';
import { nitroTestnodeL2 } from '../chains';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const clientWithoutParam = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions);
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

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});
const actionsWithVersion = arbOwnerPublicActions(client, { arbOsVersion: 11 });
const actionsWithDefaultVersion = arbOwnerPublicActions(client);

describe('Accept function name based on arbOSVersion', async () => {
  it('Client with actions (version 10)', () => {
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
  it('Client with actions (version 11)', () => {
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
  it('Client with actions (version 20)', () => {
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
  it('Client with actions (default version)', () => {
    // arbOwnerPublicActions without params is defaulted to arbOsVersion 20
    expectTypeOf<
      typeof clientWithoutParam.arbOwnerReadContract<'getInfraFeeAccount'>
    >().toBeCallableWith({
      functionName: 'getInfraFeeAccount',
    });

    expectTypeOf<
      typeof clientWithoutParam.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [randomAccount.address],
    });

    expect(
      clientWithoutParam.arbOwnerReadContract({
        // @ts-expect-error Not available for version 20
        functionName: 'onlyOnArbOS10',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
  it('Standalone actions (version 11) ', () => {
    expectTypeOf<
      typeof actionsWithVersion.arbOwnerReadContract<'onlyOnArbOS11'>
    >().toBeCallableWith({
      functionName: 'onlyOnArbOS11',
    });

    expectTypeOf<
      typeof actionsWithVersion.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [100n],
    });

    expect(
      actionsWithVersion.arbOwnerReadContract({
        // @ts-expect-error Not available for version 11
        functionName: 'onlyOnArbOS20',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
  it('Standalone actions (default version) ', () => {
    expectTypeOf<
      typeof actionsWithDefaultVersion.arbOwnerReadContract<'getInfraFeeAccount'>
    >().toBeCallableWith({
      functionName: 'getInfraFeeAccount',
    });

    expectTypeOf<
      typeof actionsWithDefaultVersion.arbOwnerPrepareTransactionRequest<'setL1PricingRewardRecipient'>
    >().toBeCallableWith({
      functionName: 'setL1PricingRewardRecipient',
      account: randomAccount.address,
      upgradeExecutor: upgradeExecutorAddress,
      args: [randomAccount.address],
    });

    expect(
      actionsWithDefaultVersion.arbOwnerReadContract({
        // @ts-expect-error Not available for version 20
        functionName: 'onlyOnArbOS10',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
});

// Those tests won't fail if the return type is wrong
// But they will display an error in the IDE
describe('Type return values for function in multiple versions', () => {
  it('Client with actions (Version 10)', () => {
    expectTypeOf(
      client10.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<`0x${string}`>();
  });
  it('Client with actions (Version 11)', () => {
    expectTypeOf(
      client11.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<bigint>();
  });
  it('Client with actions (Version 20)', () => {
    expectTypeOf(
      client20.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<readonly `0x${string}`[]>();
  });
  it('Client with actions (default version)', () => {
    expectTypeOf(
      clientWithoutParam.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<readonly `0x${string}`[]>();
  });
  it('Standalone actions (version 11)', () => {
    expectTypeOf(
      actionsWithVersion.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<bigint>();
  });
  it('Standalone actions (default version)', () => {
    expectTypeOf(
      actionsWithDefaultVersion.arbOwnerReadContract({
        functionName: 'getAllChainOwners',
      }),
    ).resolves.toEqualTypeOf<readonly `0x${string}`[]>();
  });
});
