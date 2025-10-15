import { Address } from 'viem';
import { Genesis, GenesisAlloc, PredeployInput, AccountInput } from './createGenesisBuilderTypes';

export class GenesisBuilder {
  private readonly accounts: Map<Address, AccountInput>;

  constructor() {
    this.accounts = new Map();
  }

  /**
   * Add a single predeploy contract (code required)
   * @param predeploy - The predeploy configuration
   * @returns This builder instance for chaining
   */
  addPredeploy(predeploy: PredeployInput): this {
    const normalizedAccount: AccountInput = {
      address: predeploy.address,
      code: predeploy.code,
    };

    if (typeof predeploy.balance !== 'undefined') {
      normalizedAccount.balance = predeploy.balance;
    }

    if (typeof predeploy.nonce !== 'undefined') {
      normalizedAccount.nonce = predeploy.nonce;
    }

    if (typeof predeploy.storage !== 'undefined') {
      normalizedAccount.storage = predeploy.storage;
    }

    this.accounts.set(predeploy.address, normalizedAccount);
    return this;
  }

  /**
   * Add multiple predeploy contracts (code required)
   * @param predeploys - Array of predeploy configurations
   * @returns This builder instance for chaining
   */
  addPredeploys(predeploys: PredeployInput[]): this {
    for (const predeploy of predeploys) {
      this.addPredeploy(predeploy);
    }
    return this;
  }

  /**
   * Add a single account allocation (code optional)
   * @param account - The account configuration
   * @returns This builder instance for chaining
   */
  addAccount(account: AccountInput): this {
    const normalizedAccount: AccountInput = {
      address: account.address,
    };

    if (typeof account.code !== 'undefined') {
      normalizedAccount.code = account.code;
    }

    if (typeof account.balance !== 'undefined') {
      normalizedAccount.balance = account.balance;
    }

    if (typeof account.nonce !== 'undefined') {
      normalizedAccount.nonce = account.nonce;
    }

    if (typeof account.storage !== 'undefined') {
      normalizedAccount.storage = account.storage;
    }

    this.accounts.set(account.address, normalizedAccount);
    return this;
  }

  /**
   * Add multiple account allocations (code optional)
   * @param accounts - Array of account configurations
   * @returns This builder instance for chaining
   */
  addAccounts(accounts: AccountInput[]): this {
    for (const account of accounts) {
      this.addAccount(account);
    }
    return this;
  }

  /**
   * Build and return the final genesis specification
   * @returns The complete genesis.json object
   */
  build(): Genesis {
    const alloc: GenesisAlloc = {};

    for (const [address, account] of this.accounts) {
      const genesisAccount: Record<string, unknown> = {};

      if (typeof account.code !== 'undefined') {
        genesisAccount.code = account.code;
      }

      if (typeof account.balance !== 'undefined') {
        genesisAccount.balance = account.balance.toString();
      }

      if (typeof account.nonce !== 'undefined') {
        genesisAccount.nonce = account.nonce.toString();
      }

      if (typeof account.storage !== 'undefined') {
        genesisAccount.storage = account.storage;
      }

      alloc[address] = genesisAccount;
    }

    return { alloc };
  }
}

/**
 * Creates a new genesis builder
 * @returns A new genesis builder instance
 */
export function createGenesisBuilder(): GenesisBuilder {
  return new GenesisBuilder();
}
