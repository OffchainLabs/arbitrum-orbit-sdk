import { describe, it, expect } from 'vitest';

import { isKnownWasmModuleRoot } from './wasmModuleRoot';

describe('isKnownWasmModuleRoot', () => {
  it('returns true for a known wasm module root', () => {
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v10.1
    expect(
      isKnownWasmModuleRoot('0xda4e3ad5e7feacb817c21c8d0220da7650fe9051ece68a3f0b1c5d38bbb27b21'),
    ).toEqual(true);
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v11
    expect(
      isKnownWasmModuleRoot('0xf4389b835497a910d7ba3ebfb77aa93da985634f3c052de1290360635be40c4a'),
    ).toEqual(true);
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
    expect(
      isKnownWasmModuleRoot('0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4'),
    ).toEqual(true);
    // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v31
    expect(
      isKnownWasmModuleRoot('0x260f5fa5c3176a856893642e149cf128b5a8de9f828afec8d11184415dd8dc69'),
    ).toEqual(true);
  });

  it('returns false for an unknown wasm module root', () => {
    expect(
      isKnownWasmModuleRoot('0x58e4fe5023f792d4ef584796c84d710303a5e12ea02d6e37e2b5e9c4332507c2'),
    ).toEqual(false);
  });
});
