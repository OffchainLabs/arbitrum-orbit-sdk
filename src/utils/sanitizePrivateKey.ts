/**
 * Sanitizes a private key by ensuring it starts with '0x'.
 *
 * @param {string} privateKey - The private key to sanitize.
 * @returns {`0x${string}`} - The sanitized private key with '0x' prefix.
 */
export function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}
