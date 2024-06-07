import { Address, PublicClient, WalletClient, encodeFunctionData } from 'viem';

import { erc20 } from '../contracts';

/**
 * Encodes the function data for the ERC20 approve function.
 *
 * @param {Object} params - The parameters for encoding function data
 * @param {Address} params.spender - The address of the spender
 * @param {bigint} params.amount - The amount of tokens to approve
 * @returns {string} The encoded function data
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
 * Prepares a transaction request for the ERC20 approve function.
 *
 * @param {ApprovePrepareTransactionRequestProps} props - The properties for preparing the transaction request
 * @param {Address} props.address - The address of the ERC20 token contract
 * @param {Address} props.owner - The address of the token owner
 * @param {Address} props.spender - The address of the spender
 * @param {bigint} props.amount - The amount of tokens to approve
 * @param {PublicClient} props.publicClient - The public client to use for the transaction
 * @returns {Promise<Object>} The prepared transaction request
 *
 * @example
 * const transactionRequest = await approvePrepareTransactionRequest({
 *   address: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   spender: '0xSpenderAddress',
 *   amount: BigInt(1000),
 *   publicClient,
 * });
 * console.log(transactionRequest);
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
 * Approves the spender to spend a specified amount of tokens on behalf of the owner.
 *
 * @param {ApproveProps} props - The properties for the approve function
 * @param {Address} props.address - The address of the ERC20 token contract
 * @param {Address} props.spender - The address of the spender
 * @param {bigint} props.amount - The amount of tokens to approve
 * @param {PublicClient} props.publicClient - The public client to use for the transaction
 * @param {WalletClient} props.walletClient - The wallet client to use for signing the transaction
 * @returns {Promise<Object>} The transaction receipt
 * @throws Will throw an error if the account is undefined
 *
 * @example
 * const receipt = await approve({
 *   address: '0xTokenAddress',
 *   spender: '0xSpenderAddress',
 *   amount: BigInt(1000),
 *   publicClient,
 *   walletClient,
 * });
 * console.log(receipt);
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
 * Fetches the allowance of a spender for a specific owner.
 *
 * @param {FetchAllowanceProps} props - The properties for fetching the allowance
 * @param {Address} props.address - The address of the ERC20 token contract
 * @param {Address} props.owner - The address of the token owner
 * @param {Address} props.spender - The address of the spender
 * @param {PublicClient} props.publicClient - The public client to use for the transaction
 * @returns {Promise<bigint>} The allowance amount
 *
 * @example
 * const allowance = await fetchAllowance({
 *   address: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   spender: '0xSpenderAddress',
 *   publicClient,
 * });
 * console.log(allowance);
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
 * Fetches the decimals of the ERC20 token.
 *
 * @param {Object} params - The parameters for fetching the decimals
 * @param {Address} params.address - The address of the ERC20 token contract
 * @param {PublicClient} params.publicClient - The public client to use for the transaction
 * @returns {Promise<number>} The number of decimals
 *
 * @example
 * const decimals = await fetchDecimals({
 *   address: '0xTokenAddress',
 *   publicClient,
 * });
 * console.log(decimals);
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

