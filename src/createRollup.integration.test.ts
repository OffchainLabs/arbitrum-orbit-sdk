import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { nitroTestnodeL2 } from './chains';
import { generateChainId } from './utils';
import { prepareChainConfig } from './prepareChainConfig';
import { createRollupPrepareConfig } from './createRollupPrepareConfig';
import { createRollupPrepareTransactionRequest } from './createRollupPrepareTransactionRequest';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

import { getTestPrivateKeyAccount } from './testHelpers';

const deployer = getTestPrivateKeyAccount();

const publicClient = createPublicClient({
  chain: nitroTestnodeL2,
  transport: http(),
});

it('successfully deploys eth rollup', async () => {
  // generate a random chain id
  const chainId = generateChainId();

  // create the chain config
  const chainConfig = prepareChainConfig({
    chainId,
    arbitrum: { InitialChainOwner: deployer.address },
  });

  // prepare the transaction for deploying the core contracts
  const request = await createRollupPrepareTransactionRequest({
    params: {
      config: createRollupPrepareConfig({
        chainId: BigInt(chainId),
        owner: deployer.address,
        chainConfig,
      }),
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
  const txReceipt = createRollupPrepareTransactionReceipt(
    await publicClient.waitForTransactionReceipt({ hash: txHash })
  );

  expect(txReceipt.status).toEqual('success');
});
