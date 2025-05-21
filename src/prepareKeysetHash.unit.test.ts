import { expect, it } from 'vitest';

import { prepareKeysetHash } from './prepareKeysetHash';

import { logs as logs_arbitrumNova } from './prepareKeysetHash.unit.testInputs-arbitrumNova';
import { logs as logs_xai } from './prepareKeysetHash.unit.testInputs-xai';

logs_arbitrumNova.forEach((log, index) => {
  it(`successfully calculates keyset hash (arbitrum nova example #${index + 1})`, () => {
    const { keysetBytes, keysetHash } = log.args;
    expect(prepareKeysetHash(keysetBytes)).toEqual(keysetHash);
  });
});

logs_xai.forEach((log, index) => {
  it(`successfully calculates keyset hash (xai example #${index + 1})`, () => {
    const { keysetBytes, keysetHash } = log.args;
    expect(prepareKeysetHash(keysetBytes)).toEqual(keysetHash);
  });
});
