import { Address, PublicClient } from 'viem';

import { rollup } from './test2';

type SomethingResult = {
  inbox: Address;
  outbox: Address;
  bridge: Address;
  sequencerInbox: Address;
  confirmPeriodBlocks: bigint;
};

export async function fetchBlaBla(
  client: PublicClient,
  rollupAddress: Address,
): Promise<SomethingResult> {
  const [inbox, outbox, bridge, sequencerInbox] = await Promise.all(
    (['inbox', 'outbox', 'bridge', 'sequencerInbox'] as const).map((functionName) =>
      client.readContract({
        address: rollupAddress,
        abi: rollup.abi,
        functionName,
      }),
    ),
  );

  const confirmPeriodBlocks = await client.readContract({
    address: rollupAddress,
    abi: rollup.abi,
    functionName: 'confirmPeriodBlocks',
  });

  return {
    inbox,
    outbox,
    bridge,
    sequencerInbox,
    confirmPeriodBlocks,
  };
}
