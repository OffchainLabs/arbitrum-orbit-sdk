import { Hex } from 'viem';

type ConsensusRelease = {
  version: number;
  wasmModuleRoot: Hex;
};

const consensusReleases = [
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10
    version: 10,
    wasmModuleRoot: '0x6b94a7fc388fd8ef3def759297828dc311761e88d8179c7ee8d3887dc554f3c3',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.1
    version: 10.1,
    wasmModuleRoot: '0xda4e3ad5e7feacb817c21c8d0220da7650fe9051ece68a3f0b1c5d38bbb27b21',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.2
    version: 10.2,
    wasmModuleRoot: '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.3
    version: 10.3,
    wasmModuleRoot: '0xf559b6d4fa869472dabce70fe1c15221bdda837533dfd891916836975b434dec',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v11
    version: 11,
    wasmModuleRoot: '0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v11.1
    version: 11.1,
    wasmModuleRoot: '0x68e4fe5023f792d4ef584796c84d710303a5e12ea02d6e37e2b5e9c4332507c4',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
    version: 20,
    wasmModuleRoot: '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v30
    version: 30,
    wasmModuleRoot: '0xb0de9cb89e4d944ae6023a3b62276e54804c242fd8c4c2d8e6cc4450f5fa8b1b',
  },
  {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v31
    version: 31,
    wasmModuleRoot: '0x260f5fa5c3176a856893642e149cf128b5a8de9f828afec8d11184415dd8dc69',
  },
] as const satisfies readonly ConsensusRelease[];

type ConsensusReleases = typeof consensusReleases;

export type ConsensusVersion = ConsensusReleases[number]['version'];
export type WasmModuleRoot = ConsensusReleases[number]['wasmModuleRoot'];

export type GetConsensusReleaseByVersion<TConsensusVersion extends ConsensusVersion> = Extract<
  ConsensusReleases[number],
  { version: TConsensusVersion }
>;

export function getConsensusReleaseByVersion<TConsensusVersion extends ConsensusVersion>(
  consensusVersion: TConsensusVersion,
): GetConsensusReleaseByVersion<TConsensusVersion> {
  const consensusRelease = consensusReleases
    //
    .find((release) => release.version === consensusVersion);

  return consensusRelease as GetConsensusReleaseByVersion<TConsensusVersion>;
}

export type GetConsensusReleaseByWasmModuleRoot<TWasmModuleRoot extends WasmModuleRoot> = Extract<
  ConsensusReleases[number],
  { wasmModuleRoot: TWasmModuleRoot }
>;

export function getConsensusReleaseByWasmModuleRoot<TWasmModuleRoot extends WasmModuleRoot>(
  wasmModuleRoot: TWasmModuleRoot,
): GetConsensusReleaseByWasmModuleRoot<TWasmModuleRoot> {
  const consensusRelease = consensusReleases
    //
    .find((release) => release.wasmModuleRoot === wasmModuleRoot);

  return consensusRelease as GetConsensusReleaseByWasmModuleRoot<TWasmModuleRoot>;
}

export function isKnownWasmModuleRoot(wasmModuleRoot: Hex): wasmModuleRoot is WasmModuleRoot {
  return (
    (consensusReleases.map((release) => release.wasmModuleRoot) as Hex[])
      //
      .includes(wasmModuleRoot)
  );
}
