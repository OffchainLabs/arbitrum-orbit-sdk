import { parseAbi, zeroAddress } from 'viem';
import { OrbitHandler } from './lib/client';
import {
  createRollupFetchCoreContracts,
  createTokenBridgeFetchTokenBridgeContracts,
} from '@arbitrum/orbit-sdk';
import 'dotenv/config';

if (!process.env.PARENT_CHAIN_ID || !process.env.ROLLUP_ADDRESS) {
  throw new Error(
    `The following environmental variables are required: PARENT_CHAIN_ID, ROLLUP_ADDRESS`,
  );
}

// Get the orbit handler
const orbitHandler = new OrbitHandler(
  Number(process.env.PARENT_CHAIN_ID),
  process.env.PARENT_CHAIN_RPC ?? undefined,
  process.env.ORBIT_CHAIN_ID ? Number(process.env.ORBIT_CHAIN_ID) : undefined,
  process.env.ORBIT_CHAIN_RPC ?? undefined,
);

const main = async () => {
  // Chain ID
  const orbitChainId = orbitHandler.orbitPublicClient?.chain?.id;
  const parentChainId = orbitHandler.parentChainPublicClient.chain?.id;
  console.log('Orbit chain id: ', orbitChainId);
  console.log('Parent chain id: ', parentChainId);
  console.log('');

  // Getting rollup contracts
  const rollupAddress = process.env.ROLLUP_ADDRESS as `0x${string}`;
  const rollupInformation = await createRollupFetchCoreContracts({
    rollup: rollupAddress,
    publicClient: orbitHandler.parentChainPublicClient,
  });
  console.log('Rollup contracts: ', rollupInformation);
  console.log('');

  // Getting token bridge contracts
  const tokenBridgeCreatorAddress = process.env.PARENT_CHAIN_TOKEN_BRIDGE_CREATOR as `0x${string}`;
  const tokenBridgeInformation = await createTokenBridgeFetchTokenBridgeContracts({
    inbox: rollupInformation.inbox,
    parentChainPublicClient: orbitHandler.parentChainPublicClient,
    tokenBridgeCreatorAddressOverride: tokenBridgeCreatorAddress,
  });
  console.log('TokenBridge contracts: ', tokenBridgeInformation);
  console.log('');

  // Native token
  const nativeTokenAddress = rollupInformation.nativeToken;
  console.log('Native token address: ', nativeTokenAddress);
  if (nativeTokenAddress !== zeroAddress) {
    const nativeTokenName = await orbitHandler.parentChainPublicClient.readContract({
      address: nativeTokenAddress,
      abi: parseAbi(['function name() view returns (string)']),
      functionName: 'name',
    });

    const nativeTokenSymbol = await orbitHandler.parentChainPublicClient.readContract({
      address: nativeTokenAddress,
      abi: parseAbi(['function symbol() view returns (string)']),
      functionName: 'symbol',
    });

    console.log('Native token name: ', nativeTokenName);
    console.log('Native token symbol: ', nativeTokenSymbol);
  }
  console.log('');

  // Confirm period blocks
  const confirmPeriodBlocks = await orbitHandler.parentChainPublicClient.readContract({
    address: rollupInformation.rollup,
    abi: parseAbi(['function confirmPeriodBlocks() view returns (uint256)']),
    functionName: 'confirmPeriodBlocks',
  });
  console.log('Confirm period blocks: ', Number(confirmPeriodBlocks));
  console.log('');
};

// Calling main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
