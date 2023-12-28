import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { config } from 'dotenv';
import {
  CreateRollupTransactionReceipt,
  createRollupPrepareTransactionReceipt,
} from './createRollupPrepareTransactionReceipt';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { createPublicClient, http } from 'viem';
import { nitroTestnodeL1 } from './chains';

config();

export function getTestPrivateKeyAccount(): PrivateKeyAccount {
  const privateKey = process.env.PRIVATE_KEY;

  if (typeof privateKey === 'undefined') {
    throw Error(`missing PRIVATE_KEY env variable`);
  }

  return privateKeyToAccount(sanitizePrivateKey(privateKey));
}

function sanitizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}`;
  }

  return privateKey as `0x${string}`;
}

export async function testSetupCreateRollup(): Promise<CreateRollupTransactionReceipt> {
  const publicClient = createPublicClient({
    chain: nitroTestnodeL1,
    transport: http(),
  });

  const deployer = getTestPrivateKeyAccount();

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
      batchPoster: deployer.address,
      validators: [deployer.address],
    },
    account: deployer.address,
    publicClient,
  });

  // sign and send the transaction
  const txHash = await publicClient.sendRawTransaction({
    serializedTransaction: await deployer.signTransaction(request),
  });

  // get the transaction receipt after waiting for the transaction to complete
  return createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash }),
  );
}
