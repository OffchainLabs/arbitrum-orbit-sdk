import { it, expect } from 'vitest';

import { getArbOSVersion } from './getArbOSVersion';
import { createPublicClient, http } from 'viem';
import { arbitrum, mainnet } from 'viem/chains';

it('Returns the ArbOS version for arbitrum chain', async () => {
  const arbProvider = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });
  expect(await getArbOSVersion(arbProvider)).toBe(20);
});

it('Throws if the provider is not an Arbitrum provider', async () => {
  const mainnetProvider = createPublicClient({
    chain: mainnet,
    transport: http(),
  });
  await expect(getArbOSVersion(mainnetProvider)).rejects.toThrowError();
});
