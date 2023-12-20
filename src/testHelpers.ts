import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { config } from 'dotenv';

config();

export function getTestPrivateKeyAccount(): PrivateKeyAccount {
  const privateKey = process.env.PRIVATE_KEY;

  if (typeof privateKey === 'undefined') {
    throw Error(`missing PRIVATE_KEY env variable`);
  }

  return privateKeyToAccount(sanitizePrivateKey(privateKey));
}

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}
