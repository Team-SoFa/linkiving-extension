import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function assertValidChromeVersion(version, label = 'version') {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){0,3}$/.test(version)) {
    throw new Error(`${label} must contain one to four dot-separated integers: ${version}`);
  }

  const parts = version.split('.').map(Number);
  if (parts.every(part => part === 0) || parts.some(part => part > 65_535)) {
    throw new Error(`${label} is not a valid Chrome extension version: ${version}`);
  }

  return version;
}

export function getPackageVersion(root) {
  const packageJson = readJson(join(root, 'package.json'));
  return assertValidChromeVersion(packageJson.version, 'package.json version');
}

export function syncManifestVersion(root, manifestPath = join(root, 'extension', 'manifest.json')) {
  const packageVersion = getPackageVersion(root);
  const manifest = readJson(manifestPath);

  if (manifest.version !== packageVersion) {
    manifest.version = packageVersion;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  return packageVersion;
}

export function verifyVersions(root, { tag, manifestPath } = {}) {
  const packageVersion = getPackageVersion(root);
  const resolvedManifestPath = manifestPath ?? join(root, 'extension', 'manifest.json');
  const manifest = readJson(resolvedManifestPath);
  const manifestVersion = assertValidChromeVersion(
    manifest.version,
    `${resolvedManifestPath} version`
  );

  if (manifestVersion !== packageVersion) {
    throw new Error(
      `Version mismatch: package.json=${packageVersion}, manifest=${manifestVersion}. ` +
        'Run pnpm version:sync.'
    );
  }

  if (tag) {
    const tagVersion = tag.startsWith('v') ? tag.slice(1) : tag;
    assertValidChromeVersion(tagVersion, 'release tag version');
    if (tagVersion !== packageVersion) {
      throw new Error(`Version mismatch: tag=${tag}, package.json=${packageVersion}`);
    }
  }

  return packageVersion;
}
