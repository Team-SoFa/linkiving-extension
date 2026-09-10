import { resolve } from 'node:path';

import { verifyVersions } from './extension-version.mjs';

const [tag, manifestArgument] = process.argv.slice(2);
const manifestPath = manifestArgument ? resolve(process.cwd(), manifestArgument) : undefined;
const version = verifyVersions(process.cwd(), { tag, manifestPath });

console.log(`Extension version ${version} is valid and synchronized.`);
