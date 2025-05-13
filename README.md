# Arbitrum Orbit SDK

TypeScript SDK for building [Arbitrum Orbit](https://arbitrum.io/orbit) chains.

## Installation

Make sure you are using Node.js v18 or greater.

```bash
yarn add @arbitrum/orbit-sdk viem@^1.20.0
```

## Environment Setup

Copy the example environment file to a new `.env` file:

```bash
cp .env.example .env
```

## Run integration tests

Clone the `release` branch of [nitro-testnode](https://github.com/OffchainLabs/nitro-testnode), and run the testnode using the following arguments:

```bash
./test-node.bash --init --tokenbridge --l3node --l3-fee-token --l3-token-bridge
```

Then, run the integration tests:

```bash
yarn test:integration
```

## Examples

See [examples](./examples).
