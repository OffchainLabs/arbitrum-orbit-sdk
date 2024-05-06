import { describe, it, expect, expectTypeOf } from 'vitest';

import {
  AbiEncodingLengthMismatchError,
  AbiFunctionNotFoundError,
  InvalidAddressError,
  createPublicClient,
  http,
} from 'viem';
import { nitroTestnodeL2 } from '../chains';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions);
const randomAccount = privateKeyToAccount(generatePrivateKey());

describe('readContract', () => {
  it('Infer parameters based on function name', async () => {
    expect(
      client.arbOwnerReadContract({
        functionName: 'isChainOwner',
        // @ts-expect-error Args are missing
        args: [],
      }),
    ).rejects.toThrow(AbiEncodingLengthMismatchError);

    expect(
      client.arbOwnerReadContract({
        functionName: 'isChainOwner',
        // @ts-expect-error Args is of the wrong type
        args: [10n],
      }),
    ).rejects.toThrow(InvalidAddressError);

    expect(
      // @ts-expect-error Args are required for `isChainOwner`
      client.arbOwnerReadContract({
        functionName: 'isChainOwner',
      }),
    ).rejects.toThrow(AbiEncodingLengthMismatchError);

    expectTypeOf<typeof client.arbOwnerReadContract<'isChainOwner'>>().toBeCallableWith({
      functionName: 'isChainOwner',
      args: [randomAccount.address],
    });

    // Function doesn't exist
    expect(
      client.arbOwnerReadContract({
        // @ts-expect-error Function not available
        functionName: 'notExisting',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
});

describe('prepareTransactionRequest', () => {
  it('Infer parameters based on function name', async () => {
    expect(
      client.arbOwnerPrepareTransactionRequest({
        functionName: 'addChainOwner',
        // @ts-expect-error Args are missing
        args: [],
        upgradeExecutor: false,
        account: randomAccount.address,
      }),
    ).rejects.toThrow(AbiEncodingLengthMismatchError);

    expect(
      client.arbOwnerPrepareTransactionRequest({
        functionName: 'addChainOwner',
        // @ts-expect-error Args are of the wrong type
        args: [10n],
        upgradeExecutor: false,
        account: randomAccount.address,
      }),
    ).rejects.toThrow(InvalidAddressError);

    expect(
      client
        // @ts-expect-error Args are required for `addChainOwner`
        .arbOwnerPrepareTransactionRequest({
          functionName: 'addChainOwner',
          upgradeExecutor: false,
          account: randomAccount.address,
        }),
    ).rejects.toThrow(AbiEncodingLengthMismatchError);

    expectTypeOf<
      typeof client.arbOwnerPrepareTransactionRequest<'addChainOwner'>
    >().toBeCallableWith({
      functionName: 'addChainOwner',
      args: [randomAccount.address],
      upgradeExecutor: false,
      account: randomAccount.address,
    });

    // Function doesn't exist
    expect(
      client.arbOwnerReadContract({
        // @ts-expect-error Function not available
        functionName: 'notExisting',
      }),
    ).rejects.toThrowError(AbiFunctionNotFoundError);
  });
});
