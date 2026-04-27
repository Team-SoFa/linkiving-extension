(function setupLinkivingOverlay() {
  const LINKIVING_OVERLAY_ID = 'linkiving-extension-overlay-root';
  const LINKIVING_OVERLAY_MESSAGE_TYPE = 'LINKIVING_TOGGLE_OVERLAY';
  const LINKIVING_CLOSE_MESSAGE_TYPE = 'LINKIVING_CLOSE_OVERLAY';

  function removeLinkivingOverlay() {
    document.getElementById(LINKIVING_OVERLAY_ID)?.remove();
  }

  function createLinkivingOverlay(iframeUrl) {
    removeLinkivingOverlay();

    const root = document.createElement('div');
    root.id = LINKIVING_OVERLAY_ID;
    root.style.position = 'fixed';
    root.style.top = '0px';
    root.style.right = '32px';
    root.style.width = '640px';
    root.style.height = '660px';
    root.style.zIndex = '2147483647';
    root.style.borderRadius = '28px';
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
  }

  if (!window.__LINKIVING_OVERLAY_INSTALLED__) {
    window.__LINKIVING_OVERLAY_INSTALLED__ = true;

    chrome.runtime.onMessage.addListener(message => {
      if (message?.type !== LINKIVING_OVERLAY_MESSAGE_TYPE || !message.iframeUrl) {
        return;
      }

      if (document.getElementById(LINKIVING_OVERLAY_ID)) {
        removeLinkivingOverlay();
        return;
      }

      createLinkivingOverlay(message.iframeUrl);
    });

    window.addEventListener('message', event => {
      if (event.data?.type === LINKIVING_CLOSE_MESSAGE_TYPE) {
        removeLinkivingOverlay();
      }
    });
  }
})();
