import { describe, expect, it } from 'vitest';

import { getUnsupportedTabReason, normalizeHttpUrl } from './url';

describe('normalizeHttpUrl', () => {
  it('adds https to a hostname without a protocol', () => {
    expect(normalizeHttpUrl(' example.com/path ')).toBe('https://example.com/path');
  });

  it('keeps valid http urls', () => {
    expect(normalizeHttpUrl('http://localhost:3000')).toBe('http://localhost:3000/');
  });

  it.each(['javascript:alert(1)', 'chrome://extensions', 'not-a-host']) (
    'rejects unsupported input: %s',
    input => {
      expect(normalizeHttpUrl(input)).toBeNull();
    }
  );
});

describe('getUnsupportedTabReason', () => {
  it.each(['chrome://extensions', 'edge://extensions', 'file:///tmp/test.html', 'devtools://x']) (
    'returns a reason for restricted pages: %s',
    url => {
      expect(getUnsupportedTabReason(url)).not.toBeNull();
    }
  );

  it('accepts normal web pages', () => {
    expect(getUnsupportedTabReason('https://linkiving.com/all-link')).toBeNull();
  });
});
