import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');
const requiredPaths = [
  'manifest.json',
  'index.html',
  'background.js',
  'linkiving-overlay.js',
  'linkiving-page-toast.js',
  'unsupported-popup.html',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
];

for (const relativePath of requiredPaths) {
  assert.ok(existsSync(join(outDir, relativePath)), `Missing build artifact: ${relativePath}`);
}

const manifest = JSON.parse(readFileSync(join(outDir, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.content_scripts, undefined, 'Content scripts must not run on every page');
assert.ok(!manifest.host_permissions?.includes('<all_urls>'));
assert.ok(!manifest.host_permissions?.includes('http://*/*'));
assert.ok(!manifest.host_permissions?.includes('https://*/*'));
assert.deepEqual(manifest.web_accessible_resources?.[0]?.resources, ['index.html']);

function collectHtmlFiles(directory, results = []) {
  for (const entry of readdirSync(directory)) {
    const filePath = join(directory, entry);
    if (statSync(filePath).isDirectory()) {
      collectHtmlFiles(filePath, results);
    } else if (entry.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}

for (const htmlPath of collectHtmlFiles(outDir)) {
  const html = readFileSync(htmlPath, 'utf8');
  assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)[^>]*>/i, `Inline script found: ${htmlPath}`);
}

console.log('Extension build artifacts verified.');
