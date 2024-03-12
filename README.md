# Arbitrum Orbit SDK

> [!WARNING]
> Disclaimer: This project is an Alpha release and should not be used in a production environment. We are working on preparing it for mainnet deployments; meanwhile, please use it at your discretion.

TypeScript SDK for building [Arbitrum Orbit](https://arbitrum.io/orbit) chains.

## Installation

Make sure you are using Node v18 or greater.

Run the following in the repo where your orbit code lives:

```bash
yarn install
```

### Examples

See [examples](./examples).

## Development

```bash
yarn add @arbitrum/orbit-sdk viem@^1.20.0 -W
```

### Run integration tests

Clone the branch `main` of [nitro-testnode](https://github.com/OffchainLabs/nitro-testnode), and run the testnode using the following arguments:

```bash
./test-node.bash --init --tokenbridge --l3node --l3-fee-token --l3-token-bridge
```

Then, run the integration tests:

```bash
yarn test:integration
```
