# Arbitrum Orbit SDK

## Setup fee routing for Orbit chains settling to non-Arbitrum chains (including Ethereum)

This example script shows how to setup the appropriate fee routing to comply with the [Arbitrum Expansion Program](https://forum.arbitrum.foundation/t/the-arbitrum-expansion-program-and-developer-guild/20722) requirement of sharing 10% of the revenue back to the Arbitrum ecosystem.

The script performs the following operations:

1. Obtain all chain contracts (needed to execute the next steps)
2. Obtain the current fee collectors of the chain: Orbit base fee collector, Orbit surplus fee collector, Parent chain surplus fee collector
3. Deploy the ChildToParentRouter contract, configured to send the amounts received to the appropriate Arbitrum Foundation or Arbitrum DAO controlled address on the parent chain
4. Deploy a RewardDistributor contract for each different fee collector account, configured to distribute 90% of the amounts received to the current fee collector, and 10% to the ChildToParentRouter contract
5. Set each of the fee collectors to the RewardDistributor contracts

Note that if all three fee types are collected by the same address, only one RewardDistributor contract will be deployed that will collect all those fees.

## Variables needed

- ROLLUP_ADDRESS: address of the Rollup contract
- CHAIN_OWNER_PRIVATE_KEY: private key of the account with executor privileges in the UpgradeExecutor admin contract for the chain
- ORBIT_CHAIN_ID: chainId of the Orbit chain
- ORBIT_CHAIN_RPC: RPC of the Orbit chain
- PARENT_CHAIN_ID: chainId of the parent chain (should be a non-Arbitrum chain, including Ethereum)
- PARENT_CHAIN_TARGET_ADDRESS: address on the parent chain where 10% of the revenue will be sent to (more information below)

### What PARENT_CHAIN_TARGET_ADDRESS to use

When executing this script, the RewardDistributor contract will be configured to send 10% of the funds received (10% of the revenue of the chain) to the address specified in PARENT_CHAIN_TARGET_ADDRESS, in the parent chain.

The PARENT_CHAIN_TARGET_ADDRESS should be an address controlled by the Arbitrum Foundation or the Arbitrum DAO. For L2 Orbit chains settling to Ethereum that use ETH as the native gas token, this variable should be `0x40Cd7D713D7ae463f95cE5d342Ea6E7F5cF7C999`, which is a ParentToChildRewardRouter contract that sends its balance in ETH to the Arbitrum Foundation Treasury Timelock contract on Arbitrum One.

If your chain is an L2 Orbit chain that uses a different native gas token, or if it is an L3 Orbit chain that settles to a non-Arbitrum chain, you should set PARENT_CHAIN_TARGET_ADDRESS to a different address. Please reach out to the Arbitrum Foundation to get the appropriate address. 

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
