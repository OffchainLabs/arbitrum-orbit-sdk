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
};

// Calling main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
