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
 *
 * @param {FeeRouterDeployRewardDistributorParams} feeRouterDeployRewardDistributorParams {@link FeeRouterDeployRewardDistributorParams}
 * @param {WalletClient} feeRouterDeployRewardDistributorParams.orbitChainWalletClient - The orbit chain Viem wallet client (this account will deploy the contract)
 * @param {RewardDistributorRecipient[]} feeRouterDeployRewardDistributorParams.recipients - The recipients of the rewards (array objects with properties "account" and "weight") {@link RewardDistributorRecipient}
 * @param {Address} feeRouterDeployRewardDistributorParams.recipients.account - Recipient of rewards
 * @param {Address} feeRouterDeployRewardDistributorParams.recipients.weight - Percentage of the reward obtained multiplied by 100 (e.g., for obtaining 25%, the weight would be 2500)
 *
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
