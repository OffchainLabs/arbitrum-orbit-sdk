import { OrbitHandler } from './lib/client';
import { wasmModuleRootHandler } from './partial-handlers/rollup';
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
  const wasmModuleRootMessage = await wasmModuleRootHandler(
    orbitHandler,
    process.env.ROLLUP_ADDRESS as `0x${string}`,
  );

  console.log(`*****************`);
  console.log(`Warning messages:`);
  console.log(`*****************`);
  if (wasmModuleRootMessage) {
    console.log(wasmModuleRootMessage);
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
