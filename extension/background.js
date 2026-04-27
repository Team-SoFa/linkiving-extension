const OVERLAY_SCRIPT = 'linkiving-overlay.js';
const OVERLAY_MESSAGE_TYPE = 'LINKIVING_TOGGLE_OVERLAY';
const UNSUPPORTED_POPUP = 'unsupported-popup.html';

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

async function updateActionPopup(tab) {
  if (typeof tab?.id !== 'number') return;

  await chrome.action.setPopup({
    tabId: tab.id,
    popup: canOpenOverlay(tab) ? '' : UNSUPPORTED_POPUP,
  });
}

async function showOverlay(tab) {
  if (!canOpenOverlay(tab)) return false;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [OVERLAY_SCRIPT],
    });

    await chrome.tabs.sendMessage(tab.id, {
      type: OVERLAY_MESSAGE_TYPE,
      iframeUrl: getPopupUrl(tab),
    });
    return true;
  } catch {
    return false;
  }
}

async function toggleOverlay(tab) {
  await showOverlay(tab);
}

chrome.action.onClicked.addListener(tab => {
  void toggleOverlay(tab);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id === tabId) {
    await updateActionPopup(tab);
  }
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (tab.active && (changeInfo.url || changeInfo.status === 'complete')) {
    void updateActionPopup(tab);
  }
});

chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
  void updateActionPopup(tab);
});
