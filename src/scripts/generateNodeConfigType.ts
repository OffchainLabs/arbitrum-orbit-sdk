import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const nitroTag = 'v2.1.2-4c55843-dev';
const nitroHelpOutputFile = 'nitro-node-help-output.txt';

function main() {
  execSync(`docker run --rm offchainlabs/nitro-node:${nitroTag} --help >& ${nitroHelpOutputFile}`);

  const content = readFileSync(nitroHelpOutputFile, 'utf8');
  let lines = content.split('\n');
  lines = lines.splice(1, lines.length - 2).map((line) => line.trim());
  lines = lines.splice(0, 5);
  lines = lines.map((line) => line.replace(/\s\s+/g, ':'));
  const blas = lines
    .map((line) => line.split(':'))
    .map(([param, comment]) => [...param.split(' '), comment])
    .map(([param, type, comment]) => ({
      param: param.replace('--', ''),
      type,
      comment,
    }));

  console.log(blas);
}

main();
