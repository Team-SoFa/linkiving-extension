import { syncManifestVersion } from './extension-version.mjs';

const version = syncManifestVersion(process.cwd());
console.log(`Extension manifest version synchronized to ${version}.`);
