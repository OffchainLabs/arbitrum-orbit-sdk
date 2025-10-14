import { Address, Hex } from 'viem';

/**
 * Represents a complete genesis.json specification for go-ethereum
 */
export type Genesis = {
  alloc: GenesisAlloc;
};

/**
 * Genesis allocation mapping addresses to account states
 */
export type GenesisAlloc = Record<Address, GenesisAccount>;

/**
 * Account state in genesis allocation
 */
export type GenesisAccount = {
  balance?: string;
  code?: Hex;
  storage?: Record<Hex, Hex>;
  nonce?: string;
};

/**
 * Input type for adding a predeploy
 */
export type PredeployInput = {
  address: Address;
  balance?: bigint;
  code: Hex;
  storage?: Record<Hex, Hex>;
};
