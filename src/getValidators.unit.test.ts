import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';
import { it, expect } from 'vitest';
import { getValidators } from './getValidators';

// Xai
const rollupAdminLogicAddress = '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336';

const client = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

it('getValidators return all validators', async () => {
  const validators = await getValidators(client, {
    rollupAddress: rollupAdminLogicAddress,
  });
  expect(validators).toEqual(['0x25EA41f0bDa921a0eBf48291961B1F10b59BC6b8']);
});
