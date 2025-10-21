import { config } from 'dotenv';
import { execSync } from 'child_process';
config();

// Env variables check
if (typeof process.env.NITRO_NODE_IMAGE === 'undefined') {
  throw new Error(`Please provide the "NITRO_NODE_IMAGE" environment variable`);
}
if (typeof process.env.L1_BASE_FEE === 'undefined') {
  throw new Error(`Please provide the "L1_BASE_FEE" environment variable`);
}
const nitroNodeImage = process.env.NITRO_NODE_IMAGE;
const l1BaseFee = Number(process.env.L1_BASE_FEE);

function main() {
  // Step 0 - Build genesis file generator container from Github
  // Note: remove this step once we have a public image
  console.log(`Build genesis file generator container...`);
  execSync(
    `docker build -t genesis-file-generator https://github.com/OffchainLabs/genesis-file-generator.git#containerization`,
  );

  // Step 1 - Generate genesis file
  console.log(`Generate genesis file...`);
  execSync(`docker run --env-file ./.env genesis-file-generator > genesis.json`);

  // Step 2 - Obtain genesis block hash and sendRoot hash
  console.log(`Obtain genesis block hash and sendRoot hash...`);
  console.log(`Using image "${nitroNodeImage}" and L1 base fee "${l1BaseFee}".`);
  const genesisHashes = execSync(
    `docker run -v $(pwd):/data/genesisDir --entrypoint genesis-generator ${nitroNodeImage} --genesis-json-file /data/genesisDir/genesis.json --initial-l1-base-fee ${l1BaseFee}`,
  );

  // Step 3 - Extract hashes and output results
  // genesisHashes has the following structure:
  // BlockHash: 0xabcd, SendRoot: 0x1234, Batch: 1, PosInBatch: 0
  const genesisHashesStr = genesisHashes.toString();
  const genesisBlockHash = genesisHashesStr.split(',')[0].split(':')[1].trim();
  const sendRootHash = genesisHashesStr.split(',')[1].split(':')[1].trim();

  console.log('');
  console.log('-------------------');
  console.log('Genesis information');
  console.log('-------------------');
  console.log('Genesis file generated: genesis.json');
  console.log(`Block hash: ${genesisBlockHash}`);
  console.log(`SendRoot hash: ${sendRootHash}`);
}

main();
