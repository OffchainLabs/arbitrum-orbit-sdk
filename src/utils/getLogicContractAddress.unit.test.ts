import { it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { getLogicContractAddress } from './getLogicContractAddress';

const arbitrumSepoliaPublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

it('fetches no logic contract for RollupCreator v1.1.0 on Arbitrum Sepolia', async () => {
  const logicContractAdress = await getLogicContractAddress({
    client: arbitrumSepoliaPublicClient,
    address: '0x06E341073b2749e0Bb9912461351f716DeCDa9b0',
  });
  expect(logicContractAdress).toEqual(zeroAddress);
});

it('fetches logic contract for TokenBridgeCreator v1.2.0 on Arbitrum Sepolia', async () => {
  const logicContractAdress = await getLogicContractAddress({
    client: arbitrumSepoliaPublicClient,
    address: '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E',
  });
  expect(logicContractAdress).toEqual('0x4d80b4fd42abd6934df7d9ba536e5cfe2fb7e730');
});
