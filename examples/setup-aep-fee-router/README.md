# Arbitrum Orbit SDK

## Setup fee routing for L2 Orbit chains

This example script shows how to setup the appropriate fee routing to comply with the [Arbitrum Expansion Program](https://forum.arbitrum.foundation/t/the-arbitrum-expansion-program-and-developer-guild/20722) requirement of sharing 10% of the revenue back to the Arbitrum ecosystem.

The script performs the following operations:

1. Obtain all chain contracts (needed to execute the next steps)
2. Obtain the current fee collector for the active batch poster of the chain
3. Deploy the ChildToParentRouter contract, configured to send the amounts received to the Arbitrum Foundation L1 multisig address
4. Deploy the RewardDistributor contract, configured to distribute 90% of the amounts received to the current fee collector, and 10% to the ChildToParentRouter contract
5. Set the fee collector of the active batch poster to the RewardDistributor contract

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

- [Arbitrum Expansion Program governance forum post](https://forum.arbitrum.foundation/t/the-arbitrum-expansion-program-and-developer-guild/20722)
- [ChildToParentRouter contract](https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/FeeRouter/ChildToParentRewardRouter.sol)
- [RewardDistributor contract](https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/RewardDistributor.sol)
