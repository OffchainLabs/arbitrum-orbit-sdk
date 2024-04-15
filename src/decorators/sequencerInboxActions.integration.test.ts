import { describe, it, expect } from 'vitest';
import { createPublicClient, http, zeroAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from '../chains';
import { getNitroTestnodePrivateKeyAccounts, getInformationFromTestnode } from '../testHelpers';
import { sequencerInboxActions } from './sequencerInboxActions';

// l1 owner private key
const { deployer: owner, sequencer } = getNitroTestnodePrivateKeyAccounts();
const randomAccount = privateKeyToAccount(generatePrivateKey());

const { l3SequencerInbox, l3Bridge, l3Rollup, l3BatchPoster } = getInformationFromTestnode();

const client = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
}).extend(sequencerInboxActions(l3SequencerInbox));

describe('sequencerInboxReadContract', () => {
  it('successfully fetches batchCount', async () => {
    const batchCount = await client.sequencerInboxReadContract({
      functionName: 'batchCount',
      sequencerInbox: l3SequencerInbox,
    });

    expect(Number(batchCount)).greaterThan(0);
  });

  //   it('successfully fetches batchPosterManager', async () => {
  //     const batchPosterManager = await client.sequencerInboxReadContract({
  //       functionName: 'batchPosterManager',
  //       sequencerInbox: sequencerInbox,
  //     });
  //     console.log(batchPosterManager);

  //     expect(batchPosterManager).toEqual('0x1248628e221ec541128d006a1517710d130');
  //   });

  it('successfully fetches bridge', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'bridge',
      sequencerInbox: l3SequencerInbox,
    });

    expect(result.toLowerCase()).toEqual(l3Bridge);
  });

  it('successfully fetches dasKeySetInfo', async () => {
    const [isValidKeyset, creationBlock] = await client.sequencerInboxReadContract({
      functionName: 'dasKeySetInfo',
      sequencerInbox: l3SequencerInbox,
      args: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
    });

    expect(isValidKeyset).toEqual(false);
    expect(creationBlock).toEqual(0n);
  });

  // it('successfully call getKeysetCreationBlock', async () => {
  //   const result = await client.sequencerInboxReadContract({
  //     functionName: 'getKeysetCreationBlock',
  //   sequencerInbox,
  //     args: [],
  //   });

  //   expect(result).toEqual('');
  // });

  it('successfully call inboxAccs', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'inboxAccs',
      sequencerInbox: l3SequencerInbox,
      args: [0n],
    });

    expect(result).not.toEqual(zeroAddress);
  });

  it('successfully call isBatchPoster', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    const resultWithBatchPoster = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [l3BatchPoster],
    });

    expect(result).toEqual(false);
    expect(resultWithBatchPoster).toEqual(true);
  });

  it('successfully call isSequencer', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });

    expect(result).toEqual(false);
  });

  // it('successfully call isUsingFeeToken', async () => {
  //   const result = await client.sequencerInboxReadContract({
  //     functionName: 'isUsingFeeToken',
  //     sequencerInbox: l3SequencerInbox,
  //   });

  //   expect(result).toEqual(false);
  // });

  it('successfully call isValidKeysetHash', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isValidKeysetHash',
      sequencerInbox: l3SequencerInbox,
      args: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
    });

    expect(result).toEqual(false);
  });

  it('successfully call maxDataSize', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'maxDataSize',
      sequencerInbox: l3SequencerInbox,
    });

    expect(Number(result)).greaterThan(0);
  });

  it('successfully call maxTimeVariation', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox: l3SequencerInbox,
    });

    expect(result).toEqual([5760n, 12n, 86400n, 3600n]);
  });

  //   it('successfully call reader4844', async () => {
  //     const result = await client.sequencerInboxReadContract({
  //       functionName: 'reader4844',
  //       sequencerInbox: l3SequencerInbox,
  //     });

  //     expect(result).toEqual('0x');
  //   });

  it('successfully call rollup', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'rollup',
      sequencerInbox: l3SequencerInbox,
    });

    expect(result.toLowerCase()).toEqual(l3Rollup);
  });

  it('successfully call totalDelayedMessagesRead', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'totalDelayedMessagesRead',
      sequencerInbox: l3SequencerInbox,
    });

    expect(Number(result)).greaterThan(0);
  });
});

describe('sequencerInboxPrepareTransactionRequest', async () => {
  it('successfully call postUpgradeInit', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'postUpgradeInit',
      sequencerInbox: l3SequencerInbox,
      account: sequencer.address,
    });

    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });
  });

  it('successfully call removeDelayAfterFork', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'removeDelayAfterFork',
      sequencerInbox: l3SequencerInbox,
      account: sequencer.address,
    });

    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });
  });

  it('successfully call setBatchPosterManager', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setBatchPosterManager',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'batchPosterManager',
      sequencerInbox: l3SequencerInbox,
    });
    expect(result).toEqual(randomAccount.address);
  });

  it('successfully call setIsBatchPoster', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address, true],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(result).toEqual(true);

    // Revert the change and assert
    const revertTransactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address, false],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(revertTransactionRequest),
    });

    const resultAfterReverting = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultAfterReverting).toEqual(false);
  });

  it('successfully call setIsSequencer', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsSequencer',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address, true],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(result).toEqual(true);

    // Revert change and assert
    const revertTransactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsSequencer',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address, false],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(revertTransactionRequest),
    });

    const resultAfterReverting = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultAfterReverting).toEqual(false);
  });

  it('successfully call setMaxTimeVariation', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setMaxTimeVariation',
      sequencerInbox: l3SequencerInbox,
      args: [
        {
          delayBlocks: 2_880n,
          futureBlocks: 6n,
          delaySeconds: 43_200n,
          futureSeconds: 1_800n,
        },
      ],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox: l3SequencerInbox,
    });
    expect(result).toEqual([2_880n, 6n, 43_200n, 1_800n]);
  });

  it('successfully call setValidKeyset', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setValidKeyset',
      sequencerInbox: l3SequencerInbox,
      args: ['0x1111111111111111111111111111111111111111111111111111111111111111'],
      account: sequencer.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isValidKeysetHash',
      sequencerInbox: l3SequencerInbox,
      args: ['0x1111111111111111111111111111111111111111111111111111111111111111'],
    });
    expect(result).toEqual(true);
  });

  it('successfully call updateRollupAddress', async () => {
    const rollupBefore = await client.sequencerInboxReadContract({
      functionName: 'rollup',
      sequencerInbox: l3SequencerInbox,
    });

    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'updateRollupAddress',
      sequencerInbox: l3SequencerInbox,
      account: sequencer.address,
    });

    await client.sendRawTransaction({
      serializedTransaction: await sequencer.signTransaction(transactionRequest),
    });

    const rollupAfter = await client.sequencerInboxReadContract({
      functionName: 'rollup',
      sequencerInbox: l3SequencerInbox,
    });

    console.log(rollupBefore, rollupAfter);
  });
});
