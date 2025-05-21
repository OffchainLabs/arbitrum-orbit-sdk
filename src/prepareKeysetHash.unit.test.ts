import { expect, it } from 'vitest';

import { prepareKeysetHash } from './prepareKeysetHash';
import { logs } from './prepareKeysetHash.unit.testInputs';

logs.forEach((log, index) => {
  it(`successfully calculates keyset hash (example #${index + 1})`, () => {
    const { keysetBytes, keysetHash } = log.args;
    expect(prepareKeysetHash(keysetBytes)).toEqual(keysetHash);
  });
});
