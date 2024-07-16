import { expect, it } from 'vitest';
import { isAnyTrust } from './isAnyTrust';
import { createPublicClient, http } from 'viem';
import { arbitrumNova, arbitrumSepolia, sepolia } from 'viem/chains';

it('should return true for AnyTrust chain', async () => {
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

it('should return false for non AnyTrust chain', async () => {
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
