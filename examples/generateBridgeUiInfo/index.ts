import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { config } from 'dotenv';
import { ChainConfig, createRollupPrepareTransaction, createRollupPrepareTransactionReceipt } from '@arbitrum/orbit-sdk';
import { createTokenBridgeFetchTokenBridgeContracts } from '@arbitrum/orbit-sdk';
import { writeFile } from 'fs/promises';
config();

interface BridgeUiInfo {
  chainInfo: {
    chainName: string;
    chainId: number;
    parentChainId: number;
    rpcUrl: string;
    explorerUrl: string;
    nativeToken?: string;
  };
  coreContracts: {
    rollup: string;
    inbox: string;
    outbox: string;
    sequencerInbox: string;
    bridge: string;
    nativeToken?: string;
  };
  tokenBridgeContracts: {
    l2Contracts: {
      customGateway: string;
      multicall: string;
      proxyAdmin: string;
      router: string;
      standardGateway: string;
      weth: string;
      wethGateway: string;
    };
    l3Contracts: {
      customGateway: string;
      multicall: string;
      proxyAdmin: string;
      router: string;
      standardGateway: string;
      weth: string;
      wethGateway: string;
    };
  };
}

async function main() {
  try {
    const parentChain = arbitrumSepolia;
    // Create chain client
    const parentChainPublicClient = createPublicClient({
      chain: parentChain,
      transport: http()
    });

    // Get chain information
    const chainId = await parentChainPublicClient.getChainId();

    const txHash = process.env.ORBIT_DEPLOYMENT_TRANSACTION_HASH as `0x${string}`;

    // get the transaction
    const tx = createRollupPrepareTransaction(
        await parentChainPublicClient.getTransaction({ hash: txHash }),
    );

    // get the chain config from the transaction inputs
    const config = tx.getInputs()[0].config;
    const chainConfig: ChainConfig = JSON.parse(config.chainConfig);

    // get the transaction receipt
    const txReceipt = createRollupPrepareTransactionReceipt(
        await parentChainPublicClient.getTransactionReceipt({ hash: txHash }),
    );

    // Get core contract addresses
    const coreContracts = txReceipt.getCoreContracts();

    // Get token bridge contract addresses
    const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
      inbox: coreContracts.inbox,
      parentChainPublicClient: parentChainPublicClient
    });

    // Build chain info object
    const chainInfo: BridgeUiInfo = {
      chainInfo: {
        chainName: 'My Orbit Chain',
        chainId: chainConfig.chainId,
        parentChainId: parentChain.id,
        rpcUrl: process.env.ORBIT_CHAIN_RPC || 'http://localhost:8449',
        explorerUrl: process.env.ORBIT_CHAIN_EXPLORER_URL || 'http://localhost',
        nativeToken: coreContracts.nativeToken
      },
      coreContracts: {
        rollup: coreContracts.rollup,
        inbox: coreContracts.inbox,
        outbox: coreContracts.outbox,
        sequencerInbox: coreContracts.sequencerInbox,
        bridge: coreContracts.bridge,
        nativeToken: coreContracts.nativeToken
      },
      tokenBridgeContracts: {
        l2Contracts: {
          customGateway: tokenBridgeContracts.parentChainContracts.customGateway,
          multicall: tokenBridgeContracts.parentChainContracts.multicall,
          proxyAdmin: tokenBridgeContracts.orbitChainContracts.proxyAdmin,
          router: tokenBridgeContracts.parentChainContracts.router,
          standardGateway: tokenBridgeContracts.parentChainContracts.standardGateway,
          weth: tokenBridgeContracts.parentChainContracts.weth,
          wethGateway: tokenBridgeContracts.parentChainContracts.wethGateway
        },
        l3Contracts: {
          customGateway: tokenBridgeContracts.orbitChainContracts.customGateway,
          multicall: tokenBridgeContracts.orbitChainContracts.multicall,
          proxyAdmin: tokenBridgeContracts.orbitChainContracts.proxyAdmin,
          router: tokenBridgeContracts.orbitChainContracts.router,
          standardGateway: tokenBridgeContracts.orbitChainContracts.standardGateway,
          weth: tokenBridgeContracts.orbitChainContracts.weth,
          wethGateway: tokenBridgeContracts.orbitChainContracts.wethGateway
        }
      }
    };

    // Write to output.json file
    await writeFile('output.json', JSON.stringify(chainInfo, null, 2));
    console.log('Bridge UI info has been written to output.json');


  } catch (error) {
    console.error('Error generating chain info:', error);
  }
}

main().catch(console.error); 