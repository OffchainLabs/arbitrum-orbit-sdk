import { OrbitHandler } from './lib/client';
import { factoryDeploymentsHandler } from './partial-handlers/factoryDeployments';
import { precompilesHandler } from './partial-handlers/precompiles';
import { rollupHandler } from './partial-handlers/rollup';
import 'dotenv/config';

if (!process.env.PARENT_CHAIN_ID || !process.env.ROLLUP_ADDRESS) {
  throw new Error(
    `The following environmental variables are required: PARENT_CHAIN_ID, ROLLUP_ADDRESS`,
  );
}

// Get the orbit handler
const orbitHandler = new OrbitHandler(
  Number(process.env.PARENT_CHAIN_ID),
  process.env.ORBIT_CHAIN_ID ? Number(process.env.ORBIT_CHAIN_ID) : undefined,
  process.env.ORBIT_CHAIN_RPC ?? undefined,
);

const main = async () => {
  // Rollup information
  const rollupWarningMessages = await rollupHandler(
    orbitHandler,
    process.env.ROLLUP_ADDRESS as `0x${string}`,
  );

  // const wasmModuleRootMessage = await wasmModuleRootHandler(
  //   orbitHandler,
  //   process.env.ROLLUP_ADDRESS as `0x${string}`,
  // );

  // Precompiles information
  const precompilesWarningMessages = await precompilesHandler(orbitHandler);

  // Factory deployments information
  const factoryDeploymentWarningMessages = await factoryDeploymentsHandler(orbitHandler);

  // Rendering warning messages
  const warningMessages = [
    ...rollupWarningMessages,
    // wasmModuleRootMessage,
    ...precompilesWarningMessages,
    ...factoryDeploymentWarningMessages,
  ];

  console.log(`*****************`);
  console.log(`Warning messages:`);
  console.log(`*****************`);
  if (warningMessages.length > 0) {
    console.log(warningMessages.join('\n'));
  } else {
    console.log(`No messages`);
  }
};

// Calling main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
