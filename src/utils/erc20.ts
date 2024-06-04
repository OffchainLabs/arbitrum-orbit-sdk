import { Address, PublicClient, WalletClient, encodeFunctionData } from 'viem';

import { erc20 } from '../contracts';

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
 * ApprovePrepareTransactionRequest prepares a transaction request to approve a
 * specified amount of tokens for a spender on the ERC20 token contract.
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
 * Approve allows a wallet owner to approve a specific amount of tokens to be
 * spent by another address.
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
 * fetchAllowance retrieves the allowance of tokens that the owner has approved
 * for the spender. It reads the contract state by calling the 'allowance'
 * function from the ERC20 contract ABI using the provided owner and spender
 * addresses.
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
 * FetchDecimals retrieves the number of decimal places used by the ERC20 token
 * contract at the specified address. It returns the number of decimals as a
 * {@link bigint}.
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
