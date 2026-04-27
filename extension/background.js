const OVERLAY_SCRIPT = 'linkiving-overlay.js';
const OVERLAY_MESSAGE_TYPE = 'LINKIVING_TOGGLE_OVERLAY';

function getPopupUrl(tab) {
  const url = new URL(chrome.runtime.getURL('index.html'));

  if (tab?.url) {
    url.searchParams.set('sourceTabUrl', tab.url);
  }

  if (typeof tab?.id === 'number') {
    url.searchParams.set('sourceTabId', String(tab.id));
  }

  return url.href;
}

function canOpenOverlay(tab) {
  return typeof tab?.id === 'number' && /^https?:\/\//i.test(tab.url ?? '');
}

async function toggleOverlay(tab) {
  if (!canOpenOverlay(tab)) {
    chrome.windows.create({
      url: getPopupUrl(tab),
      type: 'popup',
      width: 640,
      height: 660,
      focused: true,
    });
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [OVERLAY_SCRIPT],
    });

    await chrome.tabs.sendMessage(tab.id, {
      type: OVERLAY_MESSAGE_TYPE,
      iframeUrl: getPopupUrl(tab),
    });
  } catch {
    chrome.windows.create({
      url: getPopupUrl(tab),
      type: 'popup',
      width: 640,
      height: 680,
      focused: true,
    });
  }
}

chrome.action.onClicked.addListener(tab => {
  void toggleOverlay(tab);
});
