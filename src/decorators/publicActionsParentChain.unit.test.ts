import { it, expect, describe } from 'vitest';

import { createPublicClient, http, padHex, zeroAddress } from 'viem';
import { sepolia } from '../chains';
import { publicActionsParentChain } from './publicActionsParentChain';
import { arbitrum } from 'viem/chains';

const arbSepoliaSequencerInbox = '0x6c97864CE4bEf387dE0b3310A44230f7E3F1be0D';
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
}).extend(publicActionsParentChain({ sequencerInbox: arbSepoliaSequencerInbox }));
const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
}).extend(
  publicActionsParentChain({ sequencerInbox: '0x995a9d3ca121D48d21087eDE20bc8acb2398c8B1' }),
);

describe('Getters', () => {
  it('[maxTimeVariation] Should return max time variation', async () => {
    const maxTimeVariation = await sepoliaClient.getMaxTimeVariation();
    expect(maxTimeVariation).toEqual({
      delayBlocks: 5760n,
      futureBlocks: 64n,
      delaySeconds: 86400n,
      futureSeconds: 768n,
    });
  });

  it('[isBatchPoster] Should return if an address is a batch poster', async () => {
    const isZeroAddressBatchPoster = await arbitrumClient.isBatchPoster({
      batchPoster: zeroAddress,
    });
    expect(isZeroAddressBatchPoster).toBeFalsy();

    const isBatchPosterOnXai = await arbitrumClient.isBatchPoster({
      batchPoster: '0x7F68dba68E72a250004812fe04F1123Fca89aBa9',
    });
    expect(isBatchPosterOnXai).toBeTruthy();
  });

  it('[isValidKeysetHash] Should return if a keysetHash is a valid one', async () => {
    const isEmptyHashValidKeysetHash = await arbitrumClient.isValidKeysetHash({
      keysetHash: padHex('0x'),
    });
    expect(isEmptyHashValidKeysetHash).toBeFalsy();

    // Test on ProofOfPlay
    const isAValidKeysetHashOnPoP = await arbitrumClient.isValidKeysetHash({
      keysetHash: '0xc2c008db9d0d25ca30d60080f5ebd3d114dbccd95f2bd2df05446eae6b1acadf',
      sequencerInbox: '0xa58F38102579dAE7C584850780dDA55744f67DF1',
    });
    expect(isAValidKeysetHashOnPoP).toBeTruthy();
  });
});
