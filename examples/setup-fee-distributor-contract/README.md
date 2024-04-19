# Arbitrum Orbit SDK

## Setup fee distributor contract

By default, individual addresses are set to collect each of the fee types of an Orbit chain. However, some chains may require multiple addresses to receive the collected fees of any of the available types. In those cases, there's the possibility of using a distributor contract that can gather all fees of a specific type and distribute those among multiple addresses.

This example shows how to configure a distributor contract to manage the Orbit base fees of a chain. You can also use this same example to configure additional distributor contracts to manage other fee types.

You can find more information about the different fee types, and how to configure other fee types in [How to manage fee collector addresses](https://docs.arbitrum.io/launch-orbit-chain/how-tos/manage-fee-collectors)

## Variables needed

- ROLLUP_ADDRESS: address of the Rollup contract
- CHAIN_OWNER_PRIVATE_KEY: private key of the account with executor privileges in the UpgradeExecutor admin contract for the chain
- ORBIT_CHAIN_ID: chainId of the Orbit chain
- ORBIT_CHAIN_RPC: RPC of the Orbit chain

## Setup

1. Install dependencies

   ```bash
   yarn install
   ```

2. Create .env file and add the env vars

   ```bash
   cp .env.example .env
   ```

3. Run the example
   ```bash
   yarn dev
   ```

## References

- [How to manage fee collector addresses](https://docs.arbitrum.io/launch-orbit-chain/how-tos/manage-fee-collectors)
