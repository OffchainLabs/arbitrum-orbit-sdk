export const bridgeCreatorABI = [
  {
    inputs: [],
    name: 'erc20BasedTemplates',
    outputs: [
      { internalType: 'contract IBridge', name: 'bridge', type: 'address' },
      { internalType: 'contract ISequencerInbox', name: 'sequencerInbox', type: 'address' },
      { internalType: 'contract IInboxBase', name: 'inbox', type: 'address' },
      { internalType: 'contract IRollupEventInbox', name: 'rollupEventInbox', type: 'address' },
      { internalType: 'contract IOutbox', name: 'outbox', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethBasedTemplates',
    outputs: [
      { internalType: 'contract IBridge', name: 'bridge', type: 'address' },
      { internalType: 'contract ISequencerInbox', name: 'sequencerInbox', type: 'address' },
      { internalType: 'contract IInboxBase', name: 'inbox', type: 'address' },
      { internalType: 'contract IRollupEventInbox', name: 'rollupEventInbox', type: 'address' },
      { internalType: 'contract IOutbox', name: 'outbox', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
