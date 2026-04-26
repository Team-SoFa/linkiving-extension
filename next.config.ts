import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

const projectRoot = process.cwd();

function loadFallbackEnvFile(filename: string) {
  const filePath = join(projectRoot, filename);
  if (!existsSync(filePath)) return;

  const file = readFileSync(filePath, 'utf8');

  for (const rawLine of file.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Next.js natively loads `.env.local`. Keep `.env_local` only as a legacy fallback.
loadFallbackEnvFile('.env.local');
loadFallbackEnvFile('.env_local');

const isProd = process.env.NODE_ENV === 'production';
type SvgRuleCandidate = {
  test?: RegExp;
  exclude?: RegExp;
};

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    const fileLoaderRule = config.module?.rules?.find((rule: unknown) => {
      if (typeof rule !== 'object' || !rule) return false;
      if ('test' in rule && rule.test instanceof RegExp) {
        return rule.test.test('.svg');
      }
      return false;
    }) as SvgRuleCandidate | undefined;

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module?.rules?.push({
      test: /\.svg$/i,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    });

    return config;
  },
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true,
  assetPrefix: isProd ? '/next' : undefined,
};

export default nextConfig;
