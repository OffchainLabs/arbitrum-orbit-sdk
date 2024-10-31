import { describe, expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';

import { prepareRegisterNewNetworkParams } from './registerNewNetwork';
import { arbitrum } from 'viem/chains';

const client = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

describe('prepareRegisterNewNetworkParams', () => {
  it(`should create orbit chain network object for custom gas token chain (Xai)`, async () => {
    const network = await prepareRegisterNewNetworkParams(client, {
      rollup: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336',
    });
    expect(network).toMatchSnapshot();
  });

  it(`should create orbit chain network object for ETH gas token chain (Rari)`, async () => {
    const network = await prepareRegisterNewNetworkParams(client, {
      rollup: '0x2e988Ea0873C9d712628F0bf38DAFdE754927C89',
    });
    expect(network).toMatchSnapshot();
  });
});
