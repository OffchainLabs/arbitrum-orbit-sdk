/**
 * SanitizePrivateKey sanitizes a private key by ensuring it starts with '0x'.
 * It returns a {@link string} with the prefix '0x' if not already present.
 */
export function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}
