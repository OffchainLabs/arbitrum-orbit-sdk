import { Address, generatePrivateKey } from 'viem/accounts';

import { sanitizePrivateKey } from './sanitizePrivateKey';

export function withFallbackPrivateKey(privateKey: string | undefined): Address {
  if (typeof privateKey === 'undefined' || privateKey === '') {
    return generatePrivateKey();
  }

  return sanitizePrivateKey(privateKey);
}
