import { execSync } from 'child_process';
import { readFileSync, rmSync } from 'fs';
import { Project, WriterFunction, Writers } from 'ts-morph';

const { objectType, unionType } = Writers;

function getNitroNodeImageTag(): string {
  const defaultNitroNodeTag = 'v2.3.3-6a1c1a7';
  const argv = process.argv.slice(2);

  if (argv.length < 2 || argv[0] !== '--nitro-node-tag') {
    console.log(
      `Using default nitro-node tag since none was provided. If you want to specify a tag, you can do "--nitro-node-tag v2.2.2-8f33fea".`,
    );
    return defaultNitroNodeTag;
  }

  return argv[1];
}

const nitroNodeTag = getNitroNodeImageTag();
const nitroNodeImage = `offchainlabs/nitro-node:${nitroNodeTag}`;
const nitroNodeHelpOutputFile = `${nitroNodeImage.replace('/', '-')}-help.txt`;

console.log(`Using image "${nitroNodeImage}".`);

function generateHeader() {
  return [
    `// ---`,
    `//`,
    `// THIS FILE IS AUTOMATICALLY GENERATED AND SHOULD NOT BE EDITED MANUALLY`,
    `//`,
    `// IMAGE: ${nitroNodeImage}`,
    `// TIMESTAMP: ${new Date().toISOString()}`,
    `// `,
    `// ---`,
  ].join('\n');
}

type CliOption = {
  name: string;
  type: string;
  docs: string[];
};

function parseCliOptions(fileContents: string): CliOption[] {
  const types: Record<string, string | undefined> = {
    string: 'string',
    strings: 'string[]',
    stringArray: 'string[]',
    int: 'number',
    uint: 'number',
    uint32: 'number',
    float: 'number',
    boolean: 'boolean',
    duration: 'string',
  };

  // split into lines
  let lines = fileContents.split('\n');
  // trim whitespaces
  lines = lines.map((line) => line.trim());
  // special case for flags with comments that span multiple lines
  // todo: generalize this so it automatically detects and merges multi-line comments??
  lines = lines.map((line, lineIndex) => {
    // this comment spans 3 lines
    if (line.includes('max-fee-cap-formula')) {
      return `${line} ${lines[lineIndex + 1]} ${lines[lineIndex + 2]}`;
    }

    return line;
  });
  // only leave lines that start with "--", e.g. "--auth.addr string" but exclude "--help" and "--dev"

  lines = lines.filter(
    (line) => line.startsWith('--') && !line.includes('--help') && !line.includes('--dev'),
  );
  // sanitize the boolean types
  lines = lines.map((line) => {
    let split = line.split(' ');
    // if the flag is just a boolean, then the type is omitted from the --help output, e.g. "--init.force"
    // to make things simpler and consistent, we replace the empty string with boolean
    if (split[1] === '') {
      split[1] = 'boolean';
    }

    return split.join(' ');
  });

  return lines.map((line) => {
    const [name, type] = line.split(' ');

    // get the mapped type from go to typescript
    const sanitizedType = types[type];

    // docs is everything after the param name and type (and one space in between)
    const docsStart = name.length + 1 + type.length;
    const docs = line.slice(docsStart).trim();

    if (typeof sanitizedType === 'undefined') {
      throw new Error(`Unknown type: ${type}`);
    }

    return {
      // remove "--" from the name
      name: name.replace('--', ''),
      // map the go type to the typescript type
      type: sanitizedType,
      // copy the rest of the line as docs
      docs: [docs],
    };
  });
}

type CliOptionNestedObject = {
  [key: string]: CliOption | CliOptionNestedObject;
};

function createCliOptionsNestedObject(options: CliOption[]): CliOptionNestedObject {
  const result: CliOptionNestedObject = {};

  options.forEach((option) => {
    let paths = option.name.split('.');
    let current: CliOptionNestedObject = result;

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const pathIsFinal = i === paths.length - 1;

      if (typeof current[path] === 'undefined') {
        current[path] = pathIsFinal ? option : {};
      }

      current = current[path] as CliOptionNestedObject;
    }
  });

  return result;
}

function isCliOption(value: CliOption | CliOptionNestedObject): value is CliOption {
  return 'type' in value;
}

function getDocs(value: CliOption | CliOptionNestedObject): string[] {
  if (isCliOption(value)) {
    return value.docs;
  }

  // docs only available for "primitive" properties, not objects
  return [];
}

function getTypeRecursively(value: CliOption | CliOptionNestedObject): string | WriterFunction {
  // if we reached the "primitive" property, we can just return its type
  if (isCliOption(value)) {
    return value.type;
  }

  // if not, recursively figure out the type for each of the object's properties
  return objectType({
    properties: Object.entries(value).map(([currentKey, currentValue]) => ({
      name: `'${currentKey}'`,
      type: getTypeRecursively(currentValue),
      docs: getDocs(currentValue),
      // make it optional
      hasQuestionToken: true,
    })),
  });
}

function main() {
  // run --help on the nitro binary and save the output to a file
  execSync(`docker run --rm ${nitroNodeImage} --help > ${nitroNodeHelpOutputFile} 2>&1`);

  // read and parse the file
  const content = readFileSync(nitroNodeHelpOutputFile, 'utf8');
  const cliOptions = parseCliOptions(content);
  const cliOptionsNestedObject = createCliOptionsNestedObject(cliOptions);

  // create the new source file
  const sourceFile = new Project().createSourceFile(
    `./src/types/NodeConfig.generated/versions/${nitroNodeTag}.ts`,
    '',
    { overwrite: true },
  );
  // append header
  sourceFile.insertText(0, generateHeader());
  // append NodeConfig type declaration
  sourceFile.addTypeAlias({
    name: 'NodeConfig',
    type: getTypeRecursively(cliOptionsNestedObject),
    docs: ['Nitro node configuration object'],
    isExported: true,
  });
  // append NodeConfigOption type declaration
  sourceFile.addTypeAlias({
    name: 'NodeConfigOption',
    type: unionType(
      // not sure why ts-morph is acting weird here
      // @ts-ignore
      ...cliOptions.map((option) =>
        objectType({
          properties: [
            {
              name: 'key',
              type: `"${option.name}"`,
              docs: option.docs,
            },
            {
              name: 'type',
              type: option.type,
            },
          ],
        }),
      ),
    ),
    docs: ['Union type for all Nitro node configuration options'],
    isExported: true,
  });

  // save file to disk
  sourceFile.saveSync();
  // remove output file that we used for parsing
  rmSync(nitroNodeHelpOutputFile);
}

main();
