import { Hex } from 'viem';

export type ConsensusRelease = {
  version: number;
  wasmModuleRoot: Hex;
};

const consensusReleases = [
  {
    version: 10,
    wasmModuleRoot: '0x6b94a7fc388fd8ef3def759297828dc311761e88d8179c7ee8d3887dc554f3c3',
  },
  {
    version: 10.1,
    wasmModuleRoot: '0xda4e3ad5e7feacb817c21c8d0220da7650fe9051ece68a3f0b1c5d38bbb27b21',
  },
  {
    version: 10.2,
    wasmModuleRoot: '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17',
  },
  {
    version: 10.2,
    wasmModuleRoot: '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17',
  },
  {
    version: 10.3,
    wasmModuleRoot: '0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17',
  },
  {
    version: 11,
    wasmModuleRoot: '0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a',
  },
  {
    version: 11.1,
    wasmModuleRoot: '0x68e4fe5023f792d4ef584796c84d710303a5e12ea02d6e37e2b5e9c4332507c4',
  },
  {
    version: 20,
    wasmModuleRoot: '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4',
  },
  {
    version: 30,
    wasmModuleRoot: '0xb0de9cb89e4d944ae6023a3b62276e54804c242fd8c4c2d8e6cc4450f5fa8b1b',
  },
  {
    version: 31,
    wasmModuleRoot: '0x260f5fa5c3176a856893642e149cf128b5a8de9f828afec8d11184415dd8dc69',
  },
] as const satisfies ConsensusRelease[];

type ConsensusReleases = typeof consensusReleases;

export type ConsensusVersion = ConsensusReleases[number]['version'];
export type WasmModuleRoot = ConsensusReleases[number]['wasmModuleRoot'];

export type GetWasmModuleRoot<TConsensusVersion extends ConsensusVersion> = Extract<
  ConsensusReleases[number],
  { version: TConsensusVersion }
>['wasmModuleRoot'];

export function getWasmModuleRoot<TConsensusVersion extends ConsensusVersion>(
  consensusVersion: TConsensusVersion,
): GetWasmModuleRoot<TConsensusVersion> {
  const wasmModuleRoot = consensusReleases.find(
    (release) => release.version === consensusVersion,
  )!.wasmModuleRoot;

  return wasmModuleRoot;
}
