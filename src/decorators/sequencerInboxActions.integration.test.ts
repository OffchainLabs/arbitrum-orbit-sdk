import { describe, it, expect } from 'vitest';
import {
  Address,
  createPublicClient,
  http,
  zeroAddress,
  keccak256,
  encodePacked,
  stringToHex,
  concatHex,
  hexToBigInt,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { nitroTestnodeL2 } from '../chains';
import {
  getNitroTestnodePrivateKeyAccounts,
  getInformationFromTestnode,
  createRollupHelper,
} from '../testHelpers';
import { sequencerInboxActions } from './sequencerInboxActions';
import { prepareKeyset } from '../prepareKeyset';

const { l3RollupOwner, l3TokenBridgeDeployer, deployer } = getNitroTestnodePrivateKeyAccounts();

const randomAccount = privateKeyToAccount(generatePrivateKey());

const { l3SequencerInbox, l3Bridge, l3Rollup, l3BatchPoster, l3UpgradeExecutor } =
  getInformationFromTestnode();

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

  it('successfully call isValidKeysetHash', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'isValidKeysetHash',
      sequencerInbox: l3SequencerInbox,
      args: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
    });

    expect(result).toEqual(false);
  });

  it('successfully call maxTimeVariation', async () => {
    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox: l3SequencerInbox,
    });

    expect(result).toEqual([5760n, 12n, 86400n, 3600n]);
  });

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
  it('successfully call setIsBatchPoster', async () => {
    const resultBefore = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultBefore).toEqual(false);

    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setIsBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address, true],
      account: l3RollupOwner.address,
      upgradeExecutor: l3UpgradeExecutor,
    });

    await client.sendRawTransaction({
      serializedTransaction: await l3RollupOwner.signTransaction(transactionRequest),
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
      account: l3RollupOwner.address,
      upgradeExecutor: l3UpgradeExecutor,
    });
    await client.sendRawTransaction({
      serializedTransaction: await l3RollupOwner.signTransaction(revertTransactionRequest),
    });

    const resultAfterReverting = await client.sequencerInboxReadContract({
      functionName: 'isBatchPoster',
      sequencerInbox: l3SequencerInbox,
      args: [randomAccount.address],
    });
    expect(resultAfterReverting).toEqual(false);
  });

  it('successfully call setMaxTimeVariation', async () => {
    const resultBefore = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox: l3SequencerInbox,
    });

    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setMaxTimeVariation',
      sequencerInbox: l3SequencerInbox,
      upgradeExecutor: l3UpgradeExecutor,
      args: [
        {
          delayBlocks: 2_880n,
          futureBlocks: 6n,
          delaySeconds: 43_200n,
          futureSeconds: 1_800n,
        },
      ],
      account: l3RollupOwner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await l3RollupOwner.signTransaction(transactionRequest),
    });

    const result = await client.sequencerInboxReadContract({
      functionName: 'maxTimeVariation',
      sequencerInbox: l3SequencerInbox,
    });
    expect(result).toEqual([2_880n, 6n, 43_200n, 1_800n]);

    // Revert the change, so read test still work
    const transactionRequestRevert = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setMaxTimeVariation',
      sequencerInbox: l3SequencerInbox,
      upgradeExecutor: l3UpgradeExecutor,
      args: [
        {
          delayBlocks: resultBefore[0],
          futureBlocks: resultBefore[1],
          delaySeconds: resultBefore[2],
          futureSeconds: resultBefore[3],
        },
      ],
      account: l3RollupOwner.address,
    });
    await client.sendRawTransaction({
      serializedTransaction: await l3RollupOwner.signTransaction(transactionRequestRevert),
    });
  });

  it.only('successfully call setValidKeyset', async () => {
    // Keyset needs to be set on anytrust chain
    const deployerAddress = deployer.address;
    const batchPoster = deployer.address;
    const validators: [Address] = [deployerAddress];

    const { createRollupInformation } = await createRollupHelper({
      l3TokenBridgeDeployer,
      batchPoster,
      validators,
      nativeToken: zeroAddress,
      client,
    });

    const { sequencerInbox, upgradeExecutor } = createRollupInformation.coreContracts;

    const keyset =
      '0x00000000000000010000000000000001012160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const transactionRequest = await client.sequencerInboxPrepareTransactionRequest({
      functionName: 'setValidKeyset',
      sequencerInbox: sequencerInbox,
      args: [keyset],
      account: l3TokenBridgeDeployer.address,
      upgradeExecutor: upgradeExecutor,
    });
    const transactionHash = await client.sendRawTransaction({
      serializedTransaction: await l3TokenBridgeDeployer.signTransaction(transactionRequest),
    });

    await client.waitForTransactionReceipt({ hash: transactionHash });

    // uint256 ksWord = uint256(keccak256(bytes.concat(hex"fe", keccak256(keysetBytes))));
    // bytes32 ksHash = bytes32(ksWord ^ (1 << 255));
    const ksword = keccak256(concatHex(['0xfe', keccak256(keyset)]));
    // const ksHash = ksword ^ (1n << 255n);

    const a = hexToBigInt(ksword);
    const ksHash = a ^ (1n << 255n);

    // const result = await client.sequencerInboxReadContract({
    //   functionName: 'isValidKeysetHash',
    //   sequencerInbox,
    //   args: [ksHash],
    // });

    // expect(result).toEqual(true);
  });
});
