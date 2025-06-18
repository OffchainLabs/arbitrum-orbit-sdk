import { createPublicClient, PublicClient, Chain, Transport, http } from 'viem';
import { ChainConfig } from './types/ChainConfig';
import { BridgeUiConfig } from './types/bridgeUiConfig';
import { createRollupPrepareTransaction } from './createRollupPrepareTransaction';
import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';
import { createTokenBridgeFetchTokenBridgeContracts } from './createTokenBridgeFetchTokenBridgeContracts';

/**
 * Parameters for retrieving bridge UI configuration
 */
export type GetBridgeUiConfigParams<TChain extends Chain> = {
  parentChain: TChain;
  deploymentTxHash: `0x${string}`;
  chainName?: string;
  rpcUrl?: string;
  explorerUrl?: string;
  parentChainPublicClient?: PublicClient<Transport, TChain>;
};

/**
 * Retrieves the bridge UI configuration for an Orbit chain
 *
 * This function fetches all necessary contract addresses and chain information
 * required to set up a bridge UI for an Orbit chain. It uses the deployment
 * transaction to extract core contract addresses and token bridge information.
 *
 * @param params - Configuration parameters for retrieving bridge UI information
 * @returns Bridge UI configuration information
 *
 * @example
 * ```typescript
 * const bridgeConfig = await getBridgeUiConfig({
 *   parentChain: arbitrumSepolia,
 *   deploymentTxHash: '0x...',
 *   chainName: 'My Orbit Chain',
 *   rpcUrl: 'https://my-rpc-url',
 *   explorerUrl: 'https://my-explorer'
 * });
 * ```
 */
export async function getBridgeUiConfig<TChain extends Chain>(
  params: GetBridgeUiConfigParams<TChain>,
): Promise<BridgeUiConfig> {
  const {
    parentChain,
    deploymentTxHash,
    chainName = 'Orbit Chain',
    rpcUrl = 'http://localhost:8449',
    explorerUrl = 'http://localhost',
    parentChainPublicClient: providedClient,
  } = params;

  // Create a new public client if not provided
  const parentChainPublicClient: PublicClient<Transport, TChain> =
    providedClient ||
    createPublicClient({
      chain: parentChain,
      transport: http(),
    });

  const txData = await parentChainPublicClient.getTransaction({ hash: deploymentTxHash });
  // Get the deployment transaction
  const tx = createRollupPrepareTransaction(txData);

  // Extract chain configuration from transaction inputs
  const config = tx.getInputs()[0].config;
  const chainConfig: ChainConfig = JSON.parse(config.chainConfig);

  // Get the transaction receipt
  const txReceiptData = await parentChainPublicClient.getTransactionReceipt({
    hash: deploymentTxHash,
  });
  const txReceipt = createRollupPrepareTransactionReceipt(txReceiptData);

  // Get core contract addresses
  const coreContracts = txReceipt.getCoreContracts();

  // Get token bridge contract addresses
  const tokenBridgeContracts = await createTokenBridgeFetchTokenBridgeContracts({
    inbox: coreContracts.inbox,
    parentChainPublicClient,
  });

  // Build and return the configuration object
  return {
    chainInfo: {
      chainName,
      chainId: chainConfig.chainId,
      parentChainId: parentChain.id,
      rpcUrl,
      explorerUrl,
      nativeToken: coreContracts.nativeToken,
    },
    coreContracts: {
      rollup: coreContracts.rollup,
      inbox: coreContracts.inbox,
      outbox: coreContracts.outbox,
      sequencerInbox: coreContracts.sequencerInbox,
      bridge: coreContracts.bridge,
      nativeToken: coreContracts.nativeToken,
    },
    tokenBridgeContracts: {
      l2Contracts: {
        customGateway: tokenBridgeContracts.parentChainContracts.customGateway,
        multicall: tokenBridgeContracts.parentChainContracts.multicall,
        proxyAdmin: tokenBridgeContracts.orbitChainContracts.proxyAdmin,
        router: tokenBridgeContracts.parentChainContracts.router,
        standardGateway: tokenBridgeContracts.parentChainContracts.standardGateway,
        weth: tokenBridgeContracts.parentChainContracts.weth,
        wethGateway: tokenBridgeContracts.parentChainContracts.wethGateway,
      },
      l3Contracts: {
        customGateway: tokenBridgeContracts.orbitChainContracts.customGateway,
        multicall: tokenBridgeContracts.orbitChainContracts.multicall,
        proxyAdmin: tokenBridgeContracts.orbitChainContracts.proxyAdmin,
        router: tokenBridgeContracts.orbitChainContracts.router,
        standardGateway: tokenBridgeContracts.orbitChainContracts.standardGateway,
        weth: tokenBridgeContracts.orbitChainContracts.weth,
        wethGateway: tokenBridgeContracts.orbitChainContracts.wethGateway,
      },
    },
  };
}
