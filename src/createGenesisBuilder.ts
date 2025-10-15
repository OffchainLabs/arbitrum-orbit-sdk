import { Address } from 'viem';
import { Genesis, GenesisAlloc, PredeployInput } from './createGenesisBuilderTypes';

export class GenesisBuilder {
  private readonly predeploys: Map<Address, PredeployInput>;

  constructor() {
    this.predeploys = new Map();
  }

  /**
   * Add a single predeploy contract
   * @param predeploy - The predeploy configuration
   * @returns This builder instance for chaining
   */
  addPredeploy(predeploy: PredeployInput): this {
    const normalizedPredeploy: PredeployInput = {
      address: predeploy.address,
      code: predeploy.code,
    };

    if (typeof predeploy.balance !== 'undefined') {
      normalizedPredeploy.balance = predeploy.balance;
    }

    if (typeof predeploy.nonce !== 'undefined') {
      normalizedPredeploy.nonce = predeploy.nonce;
    }

    if (typeof predeploy.storage !== 'undefined') {
      normalizedPredeploy.storage = predeploy.storage;
    }

    this.predeploys.set(predeploy.address, normalizedPredeploy);
    return this;
  }

  /**
   * Add multiple predeploy contracts
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
   * Build and return the final genesis specification
   * @returns The complete genesis.json object
   */
  build(): Genesis {
    const alloc: GenesisAlloc = {};

    for (const [address, predeploy] of this.predeploys) {
      const account: Record<string, unknown> = {
        code: predeploy.code,
      };

      if (typeof predeploy.balance !== 'undefined') {
        account.balance = predeploy.balance.toString();
      }

      if (typeof predeploy.nonce !== 'undefined') {
        account.nonce = predeploy.nonce.toString();
      }

      if (typeof predeploy.storage !== 'undefined') {
        account.storage = predeploy.storage;
      }

      alloc[address] = account;
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
