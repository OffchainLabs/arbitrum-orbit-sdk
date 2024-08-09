const map = {
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v1-rc1
  'consensus-v1-rc1': '0xbb9d58e9527566138b682f3a207c0976d5359837f6e330f4017434cca983ff41',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v1.1
  'consensus-v1.1': '0x60516d8bf441f449f301d7bc8901d50acf0baa8b453e8e406f6c9475feac8c8c',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v2
  'consensus-v2': '0xee16b2358c81be2b9feb8486f052e74f18b8a790e4e77b4dc9e4f34d71d3b4c0',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v2.1
  'consensus-v2.1': '0x9d68e40c47e3b87a8a7e6368cc52915720a6484bb2f47ceabad7e573e3a11232',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v3
  'consensus-v3': '0x53c288a0ca7100c0f2db8ab19508763a51c7fd1be125d376d940a65378acaee7',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v3.1
  'consensus-v3.1': '0x588762be2f364be15d323df2aa60ffff60f2b14103b34823b6f7319acd1ae7a3',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v3.2
  'consensus-v3.2': '0xcfba6a883c50a1b4475ab909600fa88fc9cceed9e3ff6f43dccd2d27f6bd57cf',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v4
  'consensus-v4': '0xa24ccdb052d92c5847e8ea3ce722442358db4b00985a9ee737c4e601b6ed9876',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v5
  'consensus-v5': '0x1e09e6d9e35b93f33ed22b2bc8dc10bbcf63fdde5e8a1fb8cc1bcd1a52f14bd0',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v6
  'consensus-v6': '0x3848eff5e0356faf1fc9cafecb789584c5e7f4f8f817694d842ada96613d8bab',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v7
  'consensus-v7': '0x53dd4b9a3d807a8cbb4d58fbfc6a0857c3846d46956848cae0a1cc7eca2bb5a8',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v7.1
  'consensus-v7.1': '0x2b20e1490d1b06299b222f3239b0ae07e750d8f3b4dedd19f500a815c1548bbc',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10
  'consensus-v10': '0x6b94a7fc388fd8ef3def759297828dc311761e88d8179c7ee8d3887dc554f3c3',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.1
  'consensus-v10.1': '0xda4e3ad5e7feacb817c21c8d0220da7650fe9051ece68a3f0b1c5d38bbb27b21',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.2
  'consensus-v10.2': '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.3
  'consensus-v10.3': '0xf559b6d4fa869472dabce70fe1c15221bdda837533dfd891916836975b434dec',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v11
  'consensus-v11': '0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v11.1
  'consensus-v11.1': '0x68e4fe5023f792d4ef584796c84d710303a5e12ea02d6e37e2b5e9c4332507c4',
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
  'consensus-v20': '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4',
} as const;

type WasmModuleRootMap = typeof map;

export type ConsensusVersion = keyof WasmModuleRootMap;
export type WasmModuleRoot = WasmModuleRootMap[ConsensusVersion];

export type GetWasmModuleRoot<TConsensusVersion extends ConsensusVersion> =
  WasmModuleRootMap[TConsensusVersion];

export function getWasmModuleRoot<TConsensusVersion extends ConsensusVersion>(
  consensusVersion: TConsensusVersion,
): GetWasmModuleRoot<TConsensusVersion> {
  return map[consensusVersion];
}
