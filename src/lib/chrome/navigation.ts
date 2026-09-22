export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_EXTENSION_APP_URL?.trim() || 'https://linkiving.com';

export function appUrl(path = '') {
  return `${APP_BASE_URL.replace(/\/$/, '')}${path}`;
}

export function openLinkiving() {
  window.open(appUrl(), '_blank', 'noopener,noreferrer');
}

export function closeExtensionPanel() {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'LINKIVING_CLOSE_OVERLAY' }, '*');
    return;
  }
  window.close();
}
