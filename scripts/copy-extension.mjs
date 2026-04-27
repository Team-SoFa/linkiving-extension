import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'out');
const nextDir = join(outDir, 'next', '_next');
const staticDir = join(outDir, '_next');
const extensionDir = join(root, 'extension');
const manifestPath = join(outDir, 'manifest.json');
mkdirSync(outDir, { recursive: true });

if (existsSync(staticDir)) {
  rmSync(join(outDir, 'next'), { recursive: true, force: true });
  mkdirSync(dirname(nextDir), { recursive: true });
  cpSync(staticDir, nextDir, { recursive: true });
}

cpSync(extensionDir, outDir, { recursive: true });

function removeReservedArtifacts(targetDir) {
  for (const entry of readdirSync(targetDir)) {
    const fullPath = join(targetDir, entry);
    const stats = statSync(fullPath);
    const relativePath = fullPath.slice(outDir.length + 1);

    if (stats.isDirectory()) {
      if (relativePath === 'next/_next') {
        continue;
      }
      if (entry === '_next' || entry.startsWith('_')) {
        rmSync(fullPath, { recursive: true, force: true });
        continue;
      }
      removeReservedArtifacts(fullPath);
      continue;
    }

    if (basename(fullPath).startsWith('__')) {
      rmSync(fullPath, { force: true });
    }
  }
}

removeReservedArtifacts(outDir);

function collectHtmlFiles(targetDir, results = []) {
  for (const entry of readdirSync(targetDir)) {
    const fullPath = join(targetDir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      collectHtmlFiles(fullPath, results);
      continue;
    }

    if (entry.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

function removeGeneratedInlineScripts(targetDir) {
  for (const entry of readdirSync(targetDir)) {
    const fullPath = join(targetDir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      removeGeneratedInlineScripts(fullPath);
      continue;
    }

    if (/^__?inline-script-\d+\.js$/i.test(entry)) {
      rmSync(fullPath, { force: true });
    }
  }
}

function externalizeInlineScripts(htmlFilePath) {
  const html = readFileSync(htmlFilePath, 'utf8');
  const htmlDir = dirname(htmlFilePath);
  let scriptIndex = 0;
  let updated = false;

  const rewrittenHtml = html.replace(
    /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi,
    (_match, scriptContent) => {
      scriptIndex += 1;
      updated = true;

      const fileName = `inline-script-${scriptIndex}.js`;
      const scriptPath = join(htmlDir, fileName);
      writeFileSync(scriptPath, scriptContent, 'utf8');

      const scriptSrc = relative(htmlDir, scriptPath).replace(/\\/g, '/');
      return `<script src="${scriptSrc}"></script>`;
    }
  );

  if (updated) {
    writeFileSync(htmlFilePath, rewrittenHtml, 'utf8');
  }
}

function normalizeManifest() {
  if (!existsSync(manifestPath)) return;

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  delete manifest.content_security_policy;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

normalizeManifest();
removeGeneratedInlineScripts(outDir);

for (const htmlFilePath of collectHtmlFiles(outDir)) {
  externalizeInlineScripts(htmlFilePath);
}
