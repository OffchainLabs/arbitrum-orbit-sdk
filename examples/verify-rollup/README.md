# Verifying script for Orbit chains

:warning: This script is a WIP. It fetches information from an orbit chain and its parent chain to verify that certain parameters are configured correctly, and display warnings if it finds something that should be notified. However, it is not thorough and it can present some false positives.

## Setup

1. Install dependencies

```shell
yarn install
```

2. Create .env file

```shell
cp .env.example .env
```

3. Set env variables:
   - Note that if ORBIT_CHAIN_RPC is empty the script won't fetch information from the Orbit chain and will not perform those verifications
   - Note that PARENT_CHAIN_TOKEN_BRIDGE_CREATOR is only needed for running the Token Bridge verification script
   - The rest of the variables must be present

## Rollup verification

Fetches information from the Rollup contracts in the parent chain, and the precompiles and L2 factories in the Orbit chain.

```shell
yarn verifyRollup
```

## Token Bridge verification

To verify the token bridge, please follow [these instructions](https://github.com/OffchainLabs/token-bridge-contracts/blob/main/docs/deployment.md#verify-token-bridge-deployment) from the token-bridge-contracts repository.
