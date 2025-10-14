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
      balance: predeploy.balance ?? 0n,
      storage: predeploy.storage,
    };

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

    // Add predeploys to alloc
    for (const [address, predeploy] of this.predeploys) {
      alloc[address] = {
        balance: predeploy.balance?.toString() || '0',
        code: predeploy.code,
        storage: predeploy.storage,
      };
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
