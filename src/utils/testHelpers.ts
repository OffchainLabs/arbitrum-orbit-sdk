import { Address, PrivateKeyAccount, PublicClient } from 'viem';
import {
  CreateRollupPrepareConfigResult,
  createRollupPrepareConfig,
} from '../createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from '../createRollupPrepareTransactionRequest';
import { prepareChainConfig } from '../prepareChainConfig';
import { generateChainId } from './generateChainId';
import {
  CreateRollupTransaction,
  createRollupPrepareTransaction,
} from '../createRollupPrepareTransaction';
import {
  CreateRollupTransactionReceipt,
  createRollupPrepareTransactionReceipt,
} from '../createRollupPrepareTransactionReceipt';
import { CoreContracts } from '../types/CoreContracts';

export type CreateTestRollupParams = {
  deployer: PrivateKeyAccount;
  batchPoster: Address;
  validators: Address[];
  publicClient: PublicClient;
};

export type CreateTestRollupResult = {
  config: CreateRollupPrepareConfigResult;
  transaction: CreateRollupTransaction;
  transactionReceipt: CreateRollupTransactionReceipt;
  coreContracts: CoreContracts;
};

export async function createTestRollup({
  deployer,
  batchPoster,
  validators,
  publicClient,
}: CreateTestRollupParams): Promise<CreateTestRollupResult> {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  const config = createRollupPrepareConfig({
    chainId: BigInt(chainId),
    owner: deployer.address,
    chainConfig,
  });

  // prepare the transaction for deploying the core contracts
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config,
      batchPoster,
      validators,
    },
    account: deployer.address,
    publicClient,
  });

  // sign and send the transaction
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction
  const tx = createRollupPrepareTransaction(await publicClient.getTransaction({ hash: txHash }));

  // get the transaction receipt after waiting for the transaction to complete
  const txReceipt = createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash }),
  );

  const coreContracts = txReceipt.getCoreContracts();

  return {
    config,
    transaction: tx,
    transactionReceipt: txReceipt,
    coreContracts,
  };
}
