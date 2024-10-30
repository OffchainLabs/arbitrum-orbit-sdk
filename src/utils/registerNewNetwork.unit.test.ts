import { describe, expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';

import {
  prepareRegisterNewNetworkParams,
  registerNewNetworkFromParentPublicClient,
} from './registerNewNetwork';
import { arbitrum } from 'viem/chains';
import { getArbitrumNetwork } from '@arbitrum/sdk';

const xaiRollupAddress = '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336';
const client = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

describe('prepareRegisterNewNetworkParams', () => {
  it(`should create orbit chain network object (Xai)`, async () => {
    const network = await prepareRegisterNewNetworkParams({
      parentChainPublicClient: client,
      rollupAddress: xaiRollupAddress,
    });

    expect(network).toMatchSnapshot();
  });
});

describe('registerNewNetworkFromParentPublicClient', () => {
  it('should create and register orbit chain network object (Xai)', async () => {
    const xaiChainId = 660279;
    const preparedNetwork = await prepareRegisterNewNetworkParams({
      parentChainPublicClient: client,
      rollupAddress: xaiRollupAddress,
    });

    // Network is not registered yet
    expect(() => getArbitrumNetwork(xaiChainId)).toThrowError();

    const network = await registerNewNetworkFromParentPublicClient({
      parentChainPublicClient: client,
      rollupAddress: xaiRollupAddress,
    });

    expect(network).toEqual(preparedNetwork);
    // Network is now registered
    const xaiNetwork = getArbitrumNetwork(xaiChainId);
    expect(xaiNetwork).toEqual(network);
  });
});
