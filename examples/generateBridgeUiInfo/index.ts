import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { config } from 'dotenv';
import {
  getBridgeUiConfig,
  BridgeUiConfig,
  GetBridgeUiConfigParams,
} from '@arbitrum/orbit-sdk';
import { writeFile } from 'fs/promises';
config();

async function main() {
  try {
    const parentChain = arbitrumSepolia;
    const txHash = process.env.ORBIT_DEPLOYMENT_TRANSACTION_HASH as `0x${string}`;

    // Optionally, you can create your own public client and pass it in params
    const parentChainPublicClient = createPublicClient({
      chain: parentChain,
      transport: http(),
    });

    // Prepare params for getBridgeUiConfig
    const params = {
      parentChain,
      deploymentTxHash: txHash,
      chainName: 'My Orbit Chain',
      rpcUrl: process.env.ORBIT_CHAIN_RPC || 'http://localhost:8449',
      explorerUrl: process.env.ORBIT_CHAIN_EXPLORER_URL || 'http://localhost',
      parentChainPublicClient,
    } as const;

    // Get bridge UI config
    const bridgeUiInfo: BridgeUiConfig = await getBridgeUiConfig(params as any);

    // Write to output.json
    await writeFile('output.json', JSON.stringify(bridgeUiInfo, null, 2));
    console.log('Bridge UI info has been written to output.json');
  } catch (error) {
    console.error('Error generating chain info:', error);
  }
}

main().catch(console.error);
