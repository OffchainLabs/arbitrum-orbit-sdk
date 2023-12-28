import { parseAbi } from 'viem';

const rollupABI = parseAbi([
  'function inbox() view returns (address)',
  'function outbox() view returns (address)',
  'function bridge() view returns (address)',
  'function sequencerInbox() view returns (address)',
  'function confirmPeriodBlocks() view returns (uint64)',
]);

export const rollup = {
  abi: rollupABI,
} as const;
