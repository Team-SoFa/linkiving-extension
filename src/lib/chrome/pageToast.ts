import type { ToastVariant } from '@/components/basics/Toast/Toast';

import { getUnsupportedTabReason } from '../url';

const PAGE_TOAST_MESSAGE_TYPE = 'LINKIVING_SHOW_PAGE_TOAST';
const PAGE_TOAST_SCRIPT = 'linkiving-page-toast.js';

interface PageToastMessage {
  type: typeof PAGE_TOAST_MESSAGE_TYPE;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  actionUrl?: string;
}

interface PageToastOptions {
  actionLabel?: string;
  actionUrl?: string;
  sourceTabId?: number | null;
}

async function getActiveWebTab() {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
    return null;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || getUnsupportedTabReason(tab.url)) {
    return null;
  }

  return tab;
}

async function sendPageToastMessage(tabId: number, message: PageToastMessage) {
  try {
    if (chrome.scripting?.executeScript) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [PAGE_TOAST_SCRIPT],
      });
    }
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[linkiving-extension] failed to show page toast', error);
    }
    return false;
  }
}

export async function showCurrentPageToast(
  message: string,
  variant: ToastVariant = 'success',
  options: PageToastOptions = {}
) {
  if (options.sourceTabId) {
    return sendPageToastMessage(options.sourceTabId, {
      type: PAGE_TOAST_MESSAGE_TYPE,
      message,
      variant,
      actionLabel: options.actionLabel,
      actionUrl: options.actionUrl,
    });
  }

  const tab = await getActiveWebTab();
  if (!tab?.id) {
    return false;
  }

  return sendPageToastMessage(tab.id, {
    type: PAGE_TOAST_MESSAGE_TYPE,
    message,
    variant,
    actionLabel: options.actionLabel,
    actionUrl: options.actionUrl,
  });
}
