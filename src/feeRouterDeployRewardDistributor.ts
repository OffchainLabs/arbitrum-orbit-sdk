import { Address, WalletClient } from 'viem';

import { rewardDistributor } from './contracts';

/**
 * This type is for the recipients of the rewards
 */
export type RewardDistributorRecipient = {
  account: Address;
  weight: bigint;
};

/**
 * This type is for the params of the feeRouterDeployRewardDistributor function
 */
export type FeeRouterDeployRewardDistributorParams = {
  orbitChainWalletClient: WalletClient;
  recipients: RewardDistributorRecipient[];
};

/**
 * Deploys the RewardDistributor smart contract and initializes it with the provided configuration.
 * 
 * References:
 * - ChildToParentRouter contract: https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/RewardDistributor.sol
 * 
 * Example: [Setup fee routing for the AEP](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/setup-aep-fee-router/index.ts)
 * 
 * @param {FeeRouterDeployRewardDistributorParams} feeRouterDeployRewardDistributorParams {@link FeeRouterDeployRewardDistributorParams}
 * @param {WalletClient} feeRouterDeployRewardDistributorParams.orbitChainWalletClient - The orbit chain Viem wallet client (this account will deploy the contract)
 * @param {RewardDistributorRecipient[]} feeRouterDeployRewardDistributorParams.recipients - The recipients of the rewards (array objects with properties "account" and "weight") {@link RewardDistributorRecipient}
 * @param {Address} feeRouterDeployRewardDistributorParams.recipients.account - Recipient of rewards
 * @param {Address} feeRouterDeployRewardDistributorParams.recipients.weight - Percentage of the reward obtained multiplied by 100 (e.g., for obtaining 25%, the weight would be 2500)
 *
 * @returns Promise<0x${string}> - The hash of the deployment transaction
 * 
 * @example
 * const recipients = [
 *   {
 *     account: randomAccount.address,
 *     weight: 9000n,
 *   },
 *   {
 *     account: randomAccount2.address,
 *     weight: 1000n,
 *   },
 * ];
 * const rewardDistributorDeploymentTransactionHash = await feeRouterDeployRewardDistributor({
 *   orbitChainWalletClient,
 *   recipients,
 * });
 * const rewardDistributorDeploymentTransactionReceipt =
 *   await nitroTestnodeL2Client.waitForTransactionReceipt({
 *     hash: rewardDistributorDeploymentTransactionHash,
 *   });
 * const rewardDistributorAddress = getAddress(
 *   rewardDistributorDeploymentTransactionReceipt.contractAddress as `0x${string}`,
 * );
 */
export async function feeRouterDeployRewardDistributor({
  orbitChainWalletClient,
  recipients,
}: FeeRouterDeployRewardDistributorParams) {
  const transactionHash = await orbitChainWalletClient.deployContract({
    abi: rewardDistributor.abi,
    account: orbitChainWalletClient.account!,
    chain: orbitChainWalletClient.chain,
    args: [
      recipients.map((recipient) => recipient.account),
      recipients.map((recipient) => recipient.weight),
    ],
    bytecode: rewardDistributor.bytecode,
  });

  return transactionHash;
}
