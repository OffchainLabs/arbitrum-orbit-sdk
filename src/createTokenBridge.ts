import { Address, PublicClient, encodeFunctionData, parseEther, zeroAddress } from 'viem';
import { readContract } from 'viem/actions';
import { ethers, BigNumber, ContractFactory } from 'ethers';
import { L1ToL2MessageGasEstimator } from '@arbitrum/sdk';
import L2AtomicTokenBridgeFactory from '@arbitrum/token-bridge-contracts/build/contracts/contracts/tokenbridge/arbitrum/L2AtomicTokenBridgeFactory.sol/L2AtomicTokenBridgeFactory.json';

import { tokenBridgeCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { publicClientToProvider } from './compat/publicClientToProvider';
import { deployFactoryEstimateGas } from './createTokenBridgeEstimateGas';

import { createTokenBridgeGetInputs } from './createTokenBridge-ethers';

function convertInputs(inputs: {
  inbox: string;
  gasPrice: BigNumber;
  maxGasForContracts: BigNumber;
  retryableFee: BigNumber;
}) {
  return {
    inbox: inputs.inbox as Address,
    maxGasForContracts: inputs.maxGasForContracts.toBigInt(),
    gasPrice: inputs.gasPrice.toBigInt(),
    retryableFee: inputs.retryableFee.toBigInt(),
  };
}

export async function createTokenBridgePrepareTransactionRequest({
  parentPublicClient,
  orbitPublicClient,
  params,
  account,
}: {
  parentPublicClient: PublicClient;
  orbitPublicClient: PublicClient;
  params: { rollup: Address; rollupOwner: Address };
  account: Address;
}) {
  const chainId = parentPublicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const l1DeployerAddress = account;
  const l1Provider = new ethers.providers.StaticJsonRpcProvider('http://127.0.0.1:8545');
  const l2Provider = new ethers.providers.StaticJsonRpcProvider('http://127.0.0.1:8547');

  const l1TokenBridgeCreatorAddress = tokenBridgeCreator.address[chainId];

  const { inbox, maxGasForContracts, gasPrice, retryableFee } = convertInputs(
    await createTokenBridgeGetInputs(
      l1DeployerAddress,
      l1Provider,
      l2Provider,
      l1TokenBridgeCreatorAddress,
      params.rollup,
    ),
  );

  return parentPublicClient.prepareTransactionRequest({
    chain: parentPublicClient.chain,
    to: tokenBridgeCreator.address[chainId],
    data: encodeFunctionData({
      abi: tokenBridgeCreator.abi,
      functionName: 'createTokenBridge',
      args: [inbox, params.rollupOwner, maxGasForContracts, gasPrice],
    }),
    value: retryableFee,
    account: account,
  });
}
