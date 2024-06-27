import { it, expect, describe } from 'vitest';

import { createPublicClient, http, padHex, zeroAddress } from 'viem';
import { mainnet } from '../chains';
import { publicActionsParentChain } from './publicActionsParentChain';

const arbOneSequencerInbox = '0x1c479675ad559DC151F6Ec7ed3FbF8ceE79582B6';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicActionsParentChain({ sequencerInbox: arbOneSequencerInbox }));

describe('Getters', () => {
  it('[maxTimeVariation] Should return max time variation', async () => {
    const maxTimeVariation = await client.getMaxTimeVariation();
    expect(maxTimeVariation).toEqual({
      delayBlocks: 5760n,
      futureBlocks: 64n,
      delaySeconds: 86400n,
      futureSeconds: 768n,
    });
  });

  it('[isBatchPoster] Should return if an address is a batch poster', async () => {
    const isZeroAddressBatchPoster = await client.isBatchPoster({
      batchPoster: zeroAddress,
    });
    expect(isZeroAddressBatchPoster).toBeFalsy();
  });

  it('[isValidKeysetHash] Should return if a keysetHash is a valid one', async () => {
    const isEmptyHashValidKeysetHash = await client.isValidKeysetHash({
      keysetHash: padHex('0x'),
    });
    expect(isEmptyHashValidKeysetHash).toBeFalsy();

    // Test on Nova
    const isAValidKeysetHashOnNova = await client.isValidKeysetHash({
      keysetHash: '0x01191accc7ad5a8020e6c6d122984540e9fc48d0457bda63e0a32c8c31994f4a',
      sequencerInbox: '0x211e1c4c7f1bf5351ac850ed10fd68cffcf6c21b',
    });
    expect(isAValidKeysetHashOnNova).toBeTruthy();
  });
});
