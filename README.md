![Arbitrum Orbit](arbitrum-chain-primary.png)

# Arbitrum Orbit SDK

The Arbitrum (Orbit) chain SDK is software written in TypeScript for building [Arbitrum (Orbit) chains](https://arbitrum.io/orbit). These chains can settle directly to Ethereum or other Ethereum L2 chains. Key features include the ability to configure various components such as throughput, privacy, and governance, giving users control over their chains.

Arbitrum chains address challenges like Ethereum's high demand for block space by offloading workloads to decentralized networks, with options for Rollup or AnyTrust chains:
- Arbitrum One uses the Rollup protocol, storing data on Ethereum
- Arbitrum Nova adopts the AnyTrust protocol, enhancing performance through a data availability committee.

Benefits of Arbitrum chains for decentralized app development include dedicated throughput, low costs, fast finality, EVM+ compatibility for deploying smart contracts in various programming languages, and the ability to create independent roadmaps for app development, allowing for innovation ahead of Ethereum's public roadmap. Overall, Arbitrum chains provide tailored solutions that significantly scale Ethereum while offering greater control and flexibility for developers.

## Installation

Make sure you are using Node.js v18 or greater.

```bash
yarn add @arbitrum/orbit-sdk viem@^1.20.0
```

## Run integration tests

Clone the branch `main` of [nitro-testnode](https://github.com/OffchainLabs/nitro-testnode), and run the testnode using the following arguments:

```bash
./test-node.bash --init --tokenbridge --l3node --l3-fee-token --l3-token-bridge
```

Then, run the integration tests:

```bash
yarn test:integration
```

## Examples

See [examples](./examples).

## Documentation

See [documentation](https://docs.arbitrum.io/launch-arbitrum-chain/a-gentle-introduction).
