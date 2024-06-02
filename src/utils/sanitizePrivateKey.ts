/**
 * Sanitizes a private key string by ensuring it starts with '0x'.
 *
 * @param {string} privateKey - The private key string to be sanitized.
 * @returns {`0x${string}`} - The sanitized private key string.
 *
 * @example
 * const sanitizedKey = sanitizePrivateKey('abcdef');
 * console.log(sanitizedKey); // Output: '0xabcdef'
 */
export function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}
