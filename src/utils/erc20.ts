import { Address, PublicClient, WalletClient, encodeFunctionData } from 'viem';

import { erc20 } from '../contracts';

/**
 * Encodes the function data for approving a spender to use a specified amount of tokens.
 *
 * @param {Object} params - The parameters for encoding the function data.
 * @param {Address} params.spender - The address of the spender.
 * @param {bigint} params.amount - The amount of tokens to approve.
 * @returns {string} The encoded function data.
 */
function approveEncodeFunctionData({ spender, amount }: { spender: Address; amount: bigint }) {
  return encodeFunctionData({
    abi: erc20.abi,
    functionName: 'approve',
    args: [spender, amount],
  });
}

export type ApprovePrepareTransactionRequestProps = {
  address: Address;
  owner: Address;
  spender: Address;
  amount: bigint;
  publicClient: PublicClient;
};

/**
 * Prepares a transaction request to approve a specific amount of tokens for a spender.
 *
 * @param {ApprovePrepareTransactionRequestProps} props - The properties for preparing the transaction request.
 * @param {Address} props.address - The address of the token contract.
 * @param {Address} props.owner - The address of the token owner.
 * @param {Address} props.spender - The address of the spender.
 * @param {bigint} props.amount - The amount of tokens to approve.
 * @param {PublicClient} props.publicClient - The public client to interact with the blockchain.
 * @returns {Promise<Object>} The prepared transaction request.
 */
export async function approvePrepareTransactionRequest({
  address,
  owner,
  spender,
  amount,
  publicClient,
}: ApprovePrepareTransactionRequestProps) {
  return await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: address,
    data: approveEncodeFunctionData({ spender, amount }),
    value: BigInt(0),
    account: owner,
  });
}

export type ApproveProps = {
  address: Address;
  spender: Address;
  amount: bigint;
  publicClient: PublicClient;
  walletClient: WalletClient;
};

/**
 * Approves the spending of a specified amount of tokens by a designated address.
 *
 * @param {ApproveProps} props - The properties for the approve function.
 * @param {Address} props.address - The address of the token contract.
 * @param {Address} props.spender - The address of the spender.
 * @param {bigint} props.amount - The amount of tokens to approve.
 * @param {PublicClient} props.publicClient - The public client to interact with the blockchain.
 * @param {WalletClient} props.walletClient - The wallet client to sign and send the transaction.
 * @returns {Promise<Object>} The transaction receipt.
 */
export async function approve({
  address,
  spender,
  amount,
  publicClient,
  walletClient,
}: ApproveProps) {
  const account = walletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('[utils/erc20::approve] account is undefined');
  }

  const { request } = await publicClient.simulateContract({
    address: address,
    abi: erc20.abi,
    functionName: 'approve',
    args: [spender, amount],
    account,
  });

  const hash = await walletClient.writeContract(request);
  return await publicClient.waitForTransactionReceipt({ hash: hash });
}

export type FetchAllowanceProps = {
  address: Address;
  owner: Address;
  spender: Address;
  publicClient: PublicClient;
};

/**
 * Retrieves the allowance of tokens that the owner has approved to be spent by a specific spender.
 *
 * @param {FetchAllowanceProps} props - The properties for fetching the allowance.
 * @param {Address} props.address - The address of the token contract.
 * @param {Address} props.owner - The address of the token owner.
 * @param {Address} props.spender - The address of the spender.
 * @param {PublicClient} props.publicClient - The public client to interact with the blockchain.
 * @returns {Promise<bigint>} The allowance amount.
 */
export async function fetchAllowance({
  address,
  owner,
  spender,
  publicClient,
}: FetchAllowanceProps) {
  return publicClient.readContract({
    address,
    abi: erc20.abi,
    functionName: 'allowance',
    args: [owner, spender],
  });
}

/**
 * Retrieves the number of decimals for a specified ERC20 token at the given address.
 *
 * @param {Object} params - The parameters for fetching the decimals.
 * @param {Address} params.address - The address of the token contract.
 * @param {PublicClient} params.publicClient - The public client to interact with the blockchain.
 * @returns {Promise<number>} The number of decimals.
 */
export function fetchDecimals({
  address,
  publicClient,
}: {
  address: Address;
  publicClient: PublicClient;
}) {
  return publicClient.readContract({
    address,
    abi: erc20.abi,
    functionName: 'decimals',
  });
}

