import { Address, PublicClient, WalletClient, getAddress, pad, parseAbi } from 'viem';

import { createTokenBridgeFetchTokenBridgeContracts } from './createTokenBridgeFetchTokenBridgeContracts';
import { Prettify } from './types/utils';
import { validateParentChain } from './types/ParentChain';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { childToParentRouter } from './contracts';

/**
 * This type is for the params of the feeRouterDeployChildToParentRouter function
 */
export type FeeRouterDeployChildToParentRouterParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    parentChainPublicClient: PublicClient;
    orbitChainWalletClient: WalletClient;
    parentChainTargetAddress: Address;
    minDistributionInvervalSeconds?: bigint;
    rollup?: Address;
    parentChainTokenAddress?: Address;
  }>
>;

// Default minimum distribution interval seconds
const DEFAULT_MIN_DISTRIBUTION_INVERVAL_SECONDS = BigInt(60 * 60 * 24); // 1 day

// Default address 1
const oneAddress = getAddress(
  pad('0x1', {
    size: 20,
  }),
);

/**
 * Deploys the ChildToParentRouter smart contract and initializes it with the provided configuration.
 *
 * If the router is intended to route the native asset, there's no need to include the rollup and parentChainTokenAddress parameters.
 *
 * References:
 * - ChildToParentRouter contract: https://github.com/OffchainLabs/fund-distribution-contracts/blob/main/src/FeeRouter/ChildToParentRewardRouter.sol
 *
 * Example: [Setup fee routing for the AEP](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/main/examples/setup-aep-fee-router/index.ts)
 *
 * @param {FeeRouterDeployChildToParentRouterParams} feeRouterDeployChildToParentRouterParams {@link FeeRouterDeployChildToParentRouterParams}
 * @param {PublicClient} feeRouterDeployChildToParentRouterParams.parentChainPublicClient - The parent chain Viem public client
 * @param {WalletClient} feeRouterDeployChildToParentRouterParams.orbitChainWalletClient - The orbit chain Viem wallet client (this account will deploy the contract)
 * @param {Address} feeRouterDeployChildToParentRouterParams.parentChainTargetAddress - The address where funds will be sent in the parent chain
 * @param {bigint} feeRouterDeployChildToParentRouterParams.minDistributionInvervalSeconds - [Optional] The number of seconds that needs to pass before funds can be sent again (to prevent griefing)
 * @param {Address} feeRouterDeployChildToParentRouterParams.rollup - [Optional] If sending a token different than the native token of the Orbit chain, the Rollup contract address of the chain
 * @param {Address} feeRouterDeployChildToParentRouterParams.parentChainTokenAddress - [Optional] If sending a token different than the native token of the Orbit chain, address of the token in the parent chain
 *
 * @returns Promise<0x${string}> - The hash of the deployment transaction
 *
 * @example
 * const childToParentRouterDeploymentTransactionHash = await feeRouterDeployChildToParentRouter({
 *   parentChainPublicClient,
 *   orbitChainWalletClient,
 *   parentChainTargetAddress,
 * });
 * const childToParentRouterDeploymentTransactionReceipt =
 *   await nitroTestnodeL2Client.waitForTransactionReceipt({
 *     hash: childToParentRouterDeploymentTransactionHash,
 *   });
 * const childToParentRouterAddress = getAddress(
 *   childToParentRouterDeploymentTransactionReceipt.contractAddress as `0x${string}`,
 * );
 */
export async function feeRouterDeployChildToParentRouter({
  parentChainPublicClient,
  orbitChainWalletClient,
  parentChainTargetAddress,
  minDistributionInvervalSeconds,
  rollup,
  parentChainTokenAddress,
  tokenBridgeCreatorAddressOverride,
}: FeeRouterDeployChildToParentRouterParams) {
  validateParentChain(parentChainPublicClient);

  const constructorArguments = {
    parentChainTargetAddress,
    minDistributionInvervalSeconds:
      minDistributionInvervalSeconds ?? DEFAULT_MIN_DISTRIBUTION_INVERVAL_SECONDS,

    // setting the default values here
    // (when routing the native token, these three arguments need to be set to the oneAddress)
    parentChainTokenAddress: oneAddress,
    orbitChainTokenAddress: oneAddress,
    orbitChainGatewayRouter: oneAddress,
  };

  if (parentChainTokenAddress) {
    // routing a token different than the native token of the Orbit chain

    if (!rollup) {
      throw new Error(
        'Rollup address is needed when routing a token different than the native token',
      );
    }

    // obtain the GatewayRouter of the Orbit chain
    const inbox = await parentChainPublicClient.readContract({
      address: rollup,
      abi: parseAbi(['function inbox() view returns (address)']),
      functionName: 'inbox',
    });
    const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
      inbox,
      parentChainPublicClient,
      tokenBridgeCreatorAddressOverride,
    });
    const orbitChainGatewayRouter = tokenBridgeContracts.orbitChainContracts.router;

    // obtain the token address in the Orbit chain
    // (we can use either gateway router to obtain the "L2 token address")
    const orbitChainTokenAddress = await parentChainPublicClient.readContract({
      address: orbitChainGatewayRouter,
      abi: parseAbi(['function calculateL2TokenAddress(address) view returns (address)']),
      functionName: 'calculateL2TokenAddress',
      args: [parentChainTokenAddress],
    });

    // replacing the values in the arguments object
    constructorArguments.parentChainTokenAddress = parentChainTokenAddress;
    constructorArguments.orbitChainTokenAddress = orbitChainTokenAddress;
    constructorArguments.orbitChainGatewayRouter = orbitChainGatewayRouter;
  }

  const transactionHash = await orbitChainWalletClient.deployContract({
    abi: childToParentRouter.abi,
    account: orbitChainWalletClient.account!,
    chain: orbitChainWalletClient.chain,
    args: [
      constructorArguments.parentChainTargetAddress,
      constructorArguments.minDistributionInvervalSeconds,
      constructorArguments.parentChainTokenAddress,
      constructorArguments.orbitChainTokenAddress,
      constructorArguments.orbitChainGatewayRouter,
    ],
    bytecode: childToParentRouter.bytecode,
  });

  return transactionHash;
}
