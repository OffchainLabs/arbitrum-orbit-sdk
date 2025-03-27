import { createPublicClient, http } from 'viem';
import { AbiEvent } from 'abitype';
import { arbitrum } from 'viem/chains';
import { it, expect, vi, describe } from 'vitest';
import { getLogsWithBatching } from './getLogsWithBatching';

const rollupAddress = '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336'; // Xai
const RollupInitializedEventAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: 'bytes32',
      name: 'machineHash',
      type: 'bytes32',
    },
    {
      indexed: false,
      internalType: 'uint256',
      name: 'chainId',
      type: 'uint256',
    },
  ],
  name: 'RollupInitialized',
  type: 'event',
} as const satisfies AbiEvent;
const expectedEvent = {
  address: '0xc47dacfbaa80bd9d8112f4e8069482c2a3221336',
  args: {
    chainId: 660279n,
    machineHash: '0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a',
  },
  blockHash: '0xaa2b783c295f7b19ad8ee620ea6c450fb4b4ded61d94cb8354bac9291a2eda0f',
  blockNumber: 166757506n,
  data: '0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a00000000000000000000000000000000000000000000000000000000000a1337',
  eventName: 'RollupInitialized',
  logIndex: 43,
  removed: false,
  topics: ['0xfc1b83c11d99d08a938e0b82a0bd45f822f71ff5abf23f999c93c4533d752464'],
  transactionHash: '0xcefe7ebaac7f573d70560f840c228fd589c04b9f6fbcfc85a9bf28b8d96d89e5',
  transactionIndex: 5,
} as const;

it(`getLogsWithBatching doesn't default to batching if first call is successful`, async () => {
  const client = createPublicClient({
    transport: http(),
    chain: arbitrum,
  });

  const getLogsSpy = vi.spyOn(client, 'getLogs');
  const rollupInitializedEvents = await getLogsWithBatching(client, {
    address: rollupAddress,
    event: RollupInitializedEventAbi,
    fromBlock: expectedEvent.blockNumber,
    toBlock: 262_377_453n,
  });
  expect(getLogsSpy).toBeCalledTimes(1);
  expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
    fromBlock: expectedEvent.blockNumber,
    toBlock: 262_377_453n,
  });
  expect(getLogsSpy.mock.settledResults[0]).toEqual({ type: 'fulfilled', value: [expectedEvent] });
  expect(rollupInitializedEvents).toEqual([expectedEvent]);
});

it(`getLogsWithBatching default to batching if first call is failing`, async () => {
  const client = createPublicClient({
    transport: http('https://arbitrum.llamarpc.com'),
    chain: arbitrum,
  });

  const getLogsSpy = vi.spyOn(client, 'getLogs');
  const rollupInitializedEvents = await getLogsWithBatching(client, {
    address: rollupAddress,
    event: RollupInitializedEventAbi,
    fromBlock: expectedEvent.blockNumber,
    toBlock: expectedEvent.blockNumber + 3n * 9_999n,
  });

  // First call with the entire range plus 4 calls
  expect(getLogsSpy).toBeCalledTimes(5);

  expect(getLogsSpy.mock.settledResults[0].type).toEqual('rejected');
  expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
    fromBlock: expectedEvent.blockNumber,
    toBlock: expectedEvent.blockNumber + 3n * 9_999n,
  });

  for (let i = 1; i <= 3; i++) {
    expect(getLogsSpy.mock.settledResults[i]).toEqual({ type: 'fulfilled', value: [] });
    expect(getLogsSpy.mock.calls[i][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber + (3n - BigInt(i)) * 9_999n + 1n,
      toBlock: expectedEvent.blockNumber + (4n - BigInt(i)) * 9_999n,
    });
  }

  expect(getLogsSpy.mock.settledResults[4]).toEqual({ type: 'fulfilled', value: [expectedEvent] });
  expect(getLogsSpy.mock.calls[4][0]).toMatchObject({
    fromBlock: expectedEvent.blockNumber,
    toBlock: expectedEvent.blockNumber,
  });

  expect(rollupInitializedEvents).toEqual([expectedEvent]);
});

describe('when stopWhenFound option is set to true', () => {
  it('getLogsWithBatching should return all events if first call is successful', async () => {
    const client = createPublicClient({
      transport: http(),
      chain: arbitrum,
    });

    const getLogsSpy = vi.spyOn(client, 'getLogs');
    const rollupInitializedEvents = await getLogsWithBatching(
      client,
      {
        address: rollupAddress,
        event: RollupInitializedEventAbi,
        fromBlock: 0n,
        toBlock: expectedEvent.blockNumber + 10_000n,
      },
      {
        stopWhenFound: true,
      },
    );
    expect(getLogsSpy).toBeCalledTimes(1);
    expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
      fromBlock: 0n,
      toBlock: expectedEvent.blockNumber + 10_000n,
    });
    expect(getLogsSpy.mock.settledResults[0]).toEqual({
      type: 'fulfilled',
      value: [expectedEvent],
    });
    expect(rollupInitializedEvents).toEqual([expectedEvent]);
  });

  it('getLogsWithBatching should stop at the most recent even found if first call is failing', async () => {
    const client = createPublicClient({
      transport: http('https://arbitrum.llamarpc.com'),
      chain: arbitrum,
    });

    const getLogsSpy = vi.spyOn(client, 'getLogs');
    const rollupInitializedEvents = await getLogsWithBatching(
      client,
      {
        address: rollupAddress,
        event: RollupInitializedEventAbi,
        fromBlock: 0n,
        toBlock: expectedEvent.blockNumber + 10_000n,
      },
      {
        stopWhenFound: true,
      },
    );
    expect(getLogsSpy).toBeCalledTimes(3);
    expect(getLogsSpy.mock.settledResults[0].type).toEqual('rejected');
    expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
      fromBlock: 0n,
      toBlock: expectedEvent.blockNumber + 10_000n,
    });

    expect(getLogsSpy.mock.settledResults[1]).toEqual({ type: 'fulfilled', value: [] });
    expect(getLogsSpy.mock.calls[1][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber + 2n,
      toBlock: expectedEvent.blockNumber + 10_000n,
    });

    expect(getLogsSpy.mock.settledResults[2]).toEqual({
      type: 'fulfilled',
      value: [expectedEvent],
    });
    expect(getLogsSpy.mock.calls[2][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber - 9_999n + 2n,
      toBlock: expectedEvent.blockNumber + 1n,
    });

    expect(rollupInitializedEvents).toEqual([expectedEvent]);
  });
});

describe('when batch size is set', () => {
  it('getLogsWithBatching should fetch the entire interval if first call is successful', async () => {
    const client = createPublicClient({
      transport: http(),
      chain: arbitrum,
    });

    const getLogsSpy = vi.spyOn(client, 'getLogs');
    const rollupInitializedEvents = await getLogsWithBatching(
      client,
      {
        address: rollupAddress,
        event: RollupInitializedEventAbi,
        fromBlock: 0n,
        toBlock: expectedEvent.blockNumber + 10_000n,
      },
      {
        batchSize: 100n,
      },
    );
    expect(getLogsSpy).toBeCalledTimes(1);
    expect(getLogsSpy.mock.settledResults[0]).toEqual({
      type: 'fulfilled',
      value: [expectedEvent],
    });
    expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
      fromBlock: 0n,
      toBlock: expectedEvent.blockNumber + 10_000n,
    });

    expect(rollupInitializedEvents).toEqual([expectedEvent]);
  });

  it('getLogsWithBatching should fetch the interval by batchSize increment if first call is failing', async () => {
    const client = createPublicClient({
      transport: http('https://arbitrum.llamarpc.com'),
      chain: arbitrum,
    });

    const getLogsSpy = vi.spyOn(client, 'getLogs');
    const rollupInitializedEvents = await getLogsWithBatching(
      client,
      {
        address: rollupAddress,
        event: RollupInitializedEventAbi,
        fromBlock: expectedEvent.blockNumber,
        toBlock: expectedEvent.blockNumber + 14_000n,
      },
      {
        batchSize: 5_000n,
      },
    );

    expect(getLogsSpy.mock.settledResults[0].type).toEqual('rejected');
    expect(getLogsSpy.mock.calls[0][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber,
      toBlock: expectedEvent.blockNumber + 14_000n,
    });

    expect(getLogsSpy.mock.settledResults[1]).toEqual({ type: 'fulfilled', value: [] });
    expect(getLogsSpy.mock.calls[1][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber + 9_000n + 1n,
      toBlock: expectedEvent.blockNumber + 14_000n,
    });

    expect(getLogsSpy.mock.settledResults[2]).toEqual({ type: 'fulfilled', value: [] });
    expect(getLogsSpy.mock.calls[2][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber + 4_000n + 1n,
      toBlock: expectedEvent.blockNumber + 9_000n,
    });

    expect(getLogsSpy.mock.settledResults[3]).toEqual({
      type: 'fulfilled',
      value: [expectedEvent],
    });
    expect(getLogsSpy.mock.calls[3][0]).toMatchObject({
      fromBlock: expectedEvent.blockNumber,
      toBlock: expectedEvent.blockNumber + 4_000n,
    });
    expect(getLogsSpy).toBeCalledTimes(4);
    expect(rollupInitializedEvents).toEqual([expectedEvent]);
  });
});
