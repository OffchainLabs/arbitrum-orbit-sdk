import { it, expect, expectTypeOf } from 'vitest';

import { AbiFunctionNotFoundError, createPublicClient, http } from 'viem';
import { nitroTestnodeL2 } from '../chains';
import { arbOwnerPublicActions } from './arbOwnerPublicActions';

const client10 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOSVersion: 10 }));
const client11 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOSVersion: 11 }));
const client20 = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(arbOwnerPublicActions({ arbOSVersion: 20 }));

it('Accept function name based on arbOSVersion', async () => {
  // Version 10
  client10.arbOwnerReadContract({
    functionName: 'onlyOnArbOS10',
  });

  expect(
    client10.arbOwnerReadContract({
      functionName: 'onlyOnArbOS20',
    }),
  ).rejects.toThrowError(AbiFunctionNotFoundError);

  // Version 11
  client11.arbOwnerReadContract({
    functionName: 'onlyOnArbOS11',
  });

  expect(
    client11.arbOwnerReadContract({
      functionName: 'onlyOnArbOS20',
    }),
  ).rejects.toThrowError(AbiFunctionNotFoundError);

  // Version 20
  client20.arbOwnerReadContract({
    functionName: 'getInfraFeeAccount',
  });

  expect(
    client20.arbOwnerReadContract({
      functionName: 'onlyOnArbOS10',
    }),
  ).rejects.toThrowError(AbiFunctionNotFoundError);
});

// Those tests won't fail if the return type is wrong
// But they will display an error in the IDE
it('Type return values for function in multiple versions', () => {
  // Version 10
  expectTypeOf(
    client10.arbOwnerReadContract({
      functionName: 'getAllChainOwners',
    }),
  ).resolves.toEqualTypeOf<`0x${string}`>();

  // Version 11
  expectTypeOf(
    client11.arbOwnerReadContract({
      functionName: 'getAllChainOwners',
    }),
  ).resolves.toEqualTypeOf<bigint>();

  // Version 20
  expectTypeOf(
    client20.arbOwnerReadContract({
      functionName: 'getAllChainOwners',
    }),
  ).resolves.toEqualTypeOf<readonly `0x${string}`[]>();
});
