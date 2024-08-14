import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { arbitrumNova, arbitrumSepolia } from 'viem/chains';

import { isAnyTrust } from './isAnyTrust';

it('should return true for AnyTrust chain (RollupCreator v1.1)', async () => {
  const client = createPublicClient({
    chain: arbitrumNova,
    transport: http(),
  });
  // https://nova.arbiscan.io/tx/0x37be7a29db10d18501dcf4d0243fa6aefeeba21cbc17832ef16ccf288ce58ef2
  const isPlaynanceAnyTrust = await isAnyTrust({
    publicClient: client,
    rollup: '0x04ea347cC6A258A7F65D67aFb60B1d487062A1d0',
  });
  expect(isPlaynanceAnyTrust).toBeTruthy();
});

it('should return true for AnyTrust chain (RollupCreator v2.1)', async () => {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  // https://sepolia.arbiscan.io/tx/0xc1d9513cee57252ab9a0987e3ac4bf23aca7f5c58478a29439ecb1ef815cd379
  const isAnyTrustChain = await isAnyTrust({
    publicClient: client,
    rollup: '0x66Ef747DFDb01a0c0A3a2CB308216704E64B4A78',
  });
  expect(isAnyTrustChain).toBeTruthy();
});

it('should return false for non AnyTrust chain (RollupCreator v1.1)', async () => {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  // https://sepolia.arbiscan.io/tx/0x0bbb740d8b0286654b3d0f63175ec882dcbb7714cbf5207357a4a72a4d2dc640
  const isAnyTrustChain = await isAnyTrust({
    publicClient: client,
    rollup: '0xd0c7b5c4e8f72e0750ed9dc70a10cf6f5afd4787',
  });
  expect(isAnyTrustChain).toBeFalsy();
});

it('should return false for non AnyTrust chain (RollupCreator v2.1)', async () => {
  const client = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  // https://sepolia.arbiscan.io/tx/0xfd638529dec24963075ee8fcd9df0d319c21190a9e3f3cb5e91d7da353666b06
  const isAnyTrustChain = await isAnyTrust({
    publicClient: client,
    rollup: '0xD0c7B5C4E8f72E0750ed9dc70A10cf6F5Afd4787',
  });
  expect(isAnyTrustChain).toBeFalsy();
});
