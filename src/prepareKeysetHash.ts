import { concatHex, Hex, hexToBigInt, keccak256, toHex } from 'viem';

export function prepareKeysetHash(keyset: Hex): Hex {
  // https://github.com/OffchainLabs/nitro-contracts/blob/v3.1.0/src/bridge/SequencerInbox.sol#L827-L828
  const keysetWord = hexToBigInt(keccak256(concatHex(['0xfe', keccak256(keyset)])));
  const keysetHash = toHex(keysetWord ^ (1n << 255n), { size: 32 });

  return keysetHash;
}
