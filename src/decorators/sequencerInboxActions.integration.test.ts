import { describe, it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL1 } from '../chains';
import { getNitroTestnodePrivateKeyAccounts, getInformationFromTestnode } from '../testHelpers';
import { sequencerInboxActions } from './sequencerInboxActions';

// l1 owner private key
const owner = getNitroTestnodePrivateKeyAccounts().deployer;
const randomAccount = privateKeyToAccount(generatePrivateKey());

const { bridge, rollup, sequencerInbox, batchPoster } = getInformationFromTestnode();

const client = createPublicClient({
  chain: nitroTestnodeL1,
  transport: http(),
}).extend(sequencerInboxActions(sequencerInbox));

describe('sequencerInboxReadContract', () => {
  it('successfully fetches batchCount', async () => {
    const batchCount = await client.sequencerInboxReadContract({
      functionName: 'batchCount',
      sequencerInbox,
    });

    expect(Number(batchCount)).greaterThan(0);
  });

  //   it('successfully fetches batchPosterManager', async () => {
  //     const batchPosterManager = await client.sequencerInboxReadContract({
  //       functionName: 'batchPosterManager',
  //       sequencerInbox,
  //     });

  //     expect(batchPosterManager).toEqual('0x1248628e221ec541128d006a1517710d130');
  //   });

  it('successfully fetches bridge', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'bridge',
      sequencerInbox,
    });

    expect(result.toLowerCase()).toEqual(bridge);
  });

  it('successfully fetches dasKeySetInfo', async () => {
    const [isValidKeyset, creationBlock] = await client.sequencerInboxReadContract({
      functionName: 'dasKeySetInfo',
      sequencerInbox,
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
      sequencerInbox,
      args: [0n],
    });

    expect(result).toEqual('0x1248628e221ec541128d006a1517710d130c98f16beee10d6fac7381c1760f18');
  });

  it('successfully call isBatchPoster', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox,
      args: [randomAccount.address],
    });
    const resultWithBatchPoster = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox,
      args: [batchPoster],
    });

    expect(result).toEqual(false);
    expect(resultWithBatchPoster).toEqual(true);
  });

  it('successfully call isSequencer', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox,
      args: [randomAccount.address],
    });

    expect(result).toEqual(false);
  });

  // it('successfully call isUsingFeeToken', async () => {
  //   const result = await client.sequencerInboxReadContract({
  //     functionName: 'isUsingFeeToken',
  //   sequencerInbox,
  //   });

  //   expect(result).toEqual(false);
  // });

  it('successfully call isValidKeysetHash', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isValidKeysetHash',
      sequencerInbox,
      args: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
    });

    expect(result).toEqual(false);
  });

  it('successfully call maxDataSize', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'maxDataSize',
      sequencerInbox,
    });

    expect(result).toEqual(117964n);
  });

  it('successfully call maxTimeVariation', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox,
    });

    expect(result).toEqual([5760n, 12n, 86400n, 3600n]);
  });

  //   it('successfully call reader4844', async () => {
  //     const result = await client.sequencerInboxReadContract({
  //       functionName: 'reader4844',
  //       sequencerInbox,
  //     });

  //     expect(result).toEqual('0x');
  //   });

  it('successfully call rollup', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'rollup',
      sequencerInbox,
    });

    expect(result.toLowerCase()).toEqual(rollup);
  });

  it('successfully call totalDelayedMessagesRead', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'totalDelayedMessagesRead',
      sequencerInbox,
    });

    expect(Number(result)).greaterThan(0);
  });
});

describe('sequencerInboxPrepareTransactionRequest', () => {
  it('successfully call postUpgradeInit', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsSequencer',
      sequencerInbox,
      account: owner.address,
    });
    expect(
      async () =>
        await client.sendRawTransaction({
          serializedTransaction: await owner.signTransaction(transactionRequest),
        }),
    ).not.toThrow();
  });

  it('successfully call removeDelayAfterFork', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'removeDelayAfterFork',
      sequencerInbox,
      account: owner.address,
    });
    expect(async () =>
      client.sendRawTransaction({
        serializedTransaction: await owner.signTransaction(transactionRequest),
      }),
    ).not.toThrow();
  });

  it('successfully call setBatchPosterManager', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setBatchPosterManager',
      sequencerInbox,
      args: [randomAccount.address],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'batchPosterManager',
      sequencerInbox,
    });
    expect(result).toEqual(randomAccount.address);
  });

  it('successfully call setIsBatchPoster', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsBatchPoster',
      sequencerInbox,
      args: [randomAccount.address, true],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox,
      args: [randomAccount.address],
    });
    expect(result).toEqual(true);

    // Revert the change and assert
    const revertTransactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsBatchPoster',
      sequencerInbox,
      args: [randomAccount.address, false],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(revertTransactionRequest),
    });

    const resultAfterReverting = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultAfterReverting).toEqual(false);
  });

  it('successfully call setIsSequencer', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsSequencer',
      sequencerInbox,
      args: [randomAccount.address, true],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox,
      args: [randomAccount.address],
    });
    expect(result).toEqual(true);

    // Revert change and assert
    const revertTransactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsSequencer',
      sequencerInbox,
      args: [randomAccount.address, false],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(revertTransactionRequest),
    });

    const resultAfterReverting = await client.sequencerInboxReadContract({
      functionName: 'isSequencer',
      sequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultAfterReverting).toEqual(false);
  });

  it('successfully call setMaxTimeVariation', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setMaxTimeVariation',
      sequencerInbox,
      args: [
        {
          delayBlocks: 2_880n,
          futureBlocks: 6n,
          delaySeconds: 43_200n,
          futureSeconds: 1_800n,
        },
      ],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox,
    });
    expect(result).toEqual([2_880n, 6n, 43_200n, 1_800n]);
  });

  it('successfully call setValidKeyset', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setValidKeyset',
      sequencerInbox,
      args: ['0x1111111111111111111111111111111111111111111111111111111111111111'],
      account: owner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await owner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'isValidKeysetHash',
      sequencerInbox,
      args: ['0x1111111111111111111111111111111111111111111111111111111111111111'],
    });
    expect(result).toEqual(true);
  });

  it('successfully call updateRollupAddress', async () => {
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'updateRollupAddress',
      sequencerInbox,
      account: owner.address,
    });
    expect(
      async () =>
        await client.sendRawTransaction({
          serializedTransaction: await owner.signTransaction(transactionRequest),
        }),
    ).not.toThrow();
  });
});
