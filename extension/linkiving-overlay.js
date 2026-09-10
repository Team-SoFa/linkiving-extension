(function setupLinkivingOverlay() {
  const LINKIVING_OVERLAY_ID = `linkiving-extension-overlay-root-${chrome.runtime.id}`;
  const LINKIVING_OVERLAY_MESSAGE_TYPE = 'LINKIVING_TOGGLE_OVERLAY';
  const LINKIVING_CLOSE_MESSAGE_TYPE = 'LINKIVING_CLOSE_OVERLAY';
  const EXTENSION_ORIGIN = new URL(chrome.runtime.getURL('/')).origin;
  let activeIframe = null;

  function removeLinkivingOverlay() {
    document.getElementById(LINKIVING_OVERLAY_ID)?.remove();
    activeIframe = null;
  }

  function isExtensionPageUrl(value) {
    if (typeof value !== 'string') return false;

    try {
      const url = new URL(value);
      return url.origin === EXTENSION_ORIGIN && url.pathname === '/index.html';
    } catch {
      return false;
    }
  }

  function createLinkivingOverlay(iframeUrl) {
    removeLinkivingOverlay();

    const root = document.createElement('div');
    root.id = LINKIVING_OVERLAY_ID;
    root.style.position = 'fixed';
    root.style.top = '0px';
    root.style.right = 'clamp(8px, 4vw, 32px)';
    root.style.width = 'min(640px, calc(100vw - 16px))';
    root.style.height = 'min(660px, calc(100vh - 8px))';
    root.style.zIndex = '2147483647';
    root.style.borderRadius = 'clamp(16px, 4vw, 28px)';
    root.style.overflow = 'hidden';
    root.style.boxShadow = '0 18px 60px rgba(0, 0, 0, 0.24)';
    root.style.background = 'transparent';

    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.title = 'Linkiving Extension';
    iframe.allow = 'clipboard-read; clipboard-write';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.background = 'transparent';

    root.appendChild(iframe);
    document.documentElement.appendChild(root);
    activeIframe = iframe;
  }

  if (!window.__LINKIVING_OVERLAY_INSTALLED__) {
    window.__LINKIVING_OVERLAY_INSTALLED__ = true;

    chrome.runtime.onMessage.addListener((message, sender) => {
      if (
        sender.id !== chrome.runtime.id ||
        message?.type !== LINKIVING_OVERLAY_MESSAGE_TYPE ||
        !isExtensionPageUrl(message.iframeUrl)
      ) {
        return;
      }

      if (document.getElementById(LINKIVING_OVERLAY_ID)) {
        removeLinkivingOverlay();
        return;
      }

      createLinkivingOverlay(message.iframeUrl);
    });

    window.addEventListener('message', event => {
      if (
        event.origin === EXTENSION_ORIGIN &&
        event.source === activeIframe?.contentWindow &&
        event.data?.type === LINKIVING_CLOSE_MESSAGE_TYPE
      ) {
        removeLinkivingOverlay();
      }
    });
  }
})();
