(function () {
  const MESSAGE_TYPE = 'LINKIVING_SHOW_PAGE_TOAST';
  const CONTAINER_ID = 'linkiving-page-toast-root';
  const TOAST_DURATION_MS = 5000;
  const FADE_DURATION_MS = 300;

  function getContainer() {
    let host = document.getElementById(CONTAINER_ID);
    if (host) {
      return host.shadowRoot.querySelector('[data-linkiving-toast-list]');
    }

    host = document.createElement('div');
    host.id = CONTAINER_ID;
    host.style.all = 'initial';
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
      }

      [data-linkiving-toast-root] {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        padding: 0 16px 120px;
        pointer-events: none;
        font-family:
          Pretendard,
          -apple-system,
          BlinkMacSystemFont,
          system-ui,
          "Segoe UI",
          sans-serif;
      }

      [data-linkiving-toast-list] {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        pointer-events: none;
      }

      [data-linkiving-toast] {
        box-sizing: border-box;
        display: inline-flex;
        min-height: 64px;
        align-items: center;
        border-radius: 16px;
        padding: 16px 32px 16px 28px;
        background: #0099ff;
        color: #ffffff;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -2px rgba(0, 0, 0, 0.1);
        pointer-events: auto;
        opacity: 1;
        transition: opacity ${FADE_DURATION_MS}ms ease;
      }

      [data-linkiving-toast][data-variant="success"] {
        background: #3ae745;
      }

      [data-linkiving-toast][data-variant="error"] {
        background: #e13232;
      }

      [data-linkiving-toast][data-variant="info"] {
        background: #0099ff;
      }

      [data-linkiving-toast][data-variant="warning"] {
        background: #ffcc00;
        color: #11131d;
      }

      [data-linkiving-toast][data-closing="true"] {
        opacity: 0;
      }

      [data-linkiving-toast-icon] {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        margin-right: 12px;
        color: inherit;
      }

      [data-linkiving-toast-body] {
        display: flex;
        flex: 1 1 auto;
        align-items: center;
      }

      [data-linkiving-toast-message] {
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
        letter-spacing: 0;
        white-space: pre-wrap;
      }

      [data-linkiving-toast-action] {
        box-sizing: border-box;
        display: inline-flex;
        height: 32px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        margin-left: 30px;
        border: 1px solid #c7c8cd;
        border-radius: 8px;
        padding: 0 12px;
        background: #fdfdfd;
        color: #43444e;
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        line-height: 130%;
        white-space: nowrap;
        transition: all 150ms ease;
      }

      [data-linkiving-toast-action]:hover,
      [data-linkiving-toast-action]:focus {
        background: #f5f6fa;
        border-color: #c7c8cd;
        color: #43444e;
      }

      [data-linkiving-toast-action-inner] {
        display: flex;
        align-items: center;
        column-gap: 4px;
      }

      [data-linkiving-toast-action-icon] {
        width: 16px;
        height: 16px;
        color: currentColor;
      }

      [data-linkiving-toast-action-label] {
        padding-right: 4px;
      }
    `;

    const root = document.createElement('div');
    root.setAttribute('data-linkiving-toast-root', '');

    const list = document.createElement('div');
    list.setAttribute('data-linkiving-toast-list', '');

    root.appendChild(list);
    shadow.append(style, root);

    return list;
  }

  function createCompleteIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('data-linkiving-toast-icon', '');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `
      <path d="M12 3C16.968 3 21 7.032 21 12C21 16.968 16.968 21 12 21C7.032 21 3 16.968 3 12C3 7.032 7.032 3 12 3ZM16.7681 8.40176C16.417 8.04818 15.8451 8.04682 15.4928 8.39912L10.2 13.691L8.50371 12.0018C8.15286 11.6525 7.58569 11.6528 7.23545 12.0026C6.88469 12.3534 6.88469 12.9228 7.23545 13.2735L9.56367 15.6018C9.91514 15.9532 10.4849 15.9532 10.8363 15.6018L16.7654 9.67266C17.1159 9.32217 17.1171 8.75361 16.7681 8.40176Z" fill="currentColor"></path>
    `;
    return icon;
  }

  function createAllLinkIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('data-linkiving-toast-action-icon', '');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `
      <path d="M3 10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3H4C3.44772 3 3 3.44772 3 4V10ZM5 5H9V9H5V5Z" fill="currentColor"></path>
      <path d="M14 3C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3H14ZM19 9H15V5H19V9Z" fill="currentColor"></path>
      <path d="M3 20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13H4C3.44772 13 3 13.4477 3 14V20ZM5 15H9V19H5V15Z" fill="currentColor"></path>
      <path d="M12.9975 19.9991C12.9975 20.5514 13.4452 20.9991 13.9975 20.9991H19.9975C20.5498 20.9991 20.9975 20.5514 20.9975 19.9991V13.9991C20.9975 13.4468 20.5498 12.9991 19.9975 12.9991H13.9975C13.4452 12.9991 12.9975 13.4468 12.9975 13.9991V19.9991ZM14.9975 14.9991H18.9975V18.9991H14.9975V14.9991Z" fill="currentColor"></path>
    `;
    return icon;
  }

  function createActionButton(actionLabel, actionUrl) {
    const action = document.createElement('button');
    action.type = 'button';
    action.setAttribute('data-linkiving-toast-action', '');

    const inner = document.createElement('div');
    inner.setAttribute('data-linkiving-toast-action-inner', '');
    inner.appendChild(createAllLinkIcon());

    const label = document.createElement('span');
    label.setAttribute('data-linkiving-toast-action-label', '');
    label.textContent = actionLabel;
    inner.appendChild(label);

    action.appendChild(inner);
    action.addEventListener('click', () => {
      if (actionUrl) {
        window.open(actionUrl, '_blank', 'noopener,noreferrer');
      }
    });

    return action;
  }

  function showToast(message, variant, actionLabel, actionUrl) {
    const list = getContainer();
    const toast = document.createElement('div');
    toast.setAttribute('data-linkiving-toast', '');
    toast.setAttribute('data-variant', variant || 'info');

    toast.appendChild(createCompleteIcon());

    const body = document.createElement('div');
    body.setAttribute('data-linkiving-toast-body', '');

    const text = document.createElement('div');
    text.setAttribute('data-linkiving-toast-message', '');
    text.textContent = message || '링크가 저장되었습니다. 요약 생성을 시작합니다.';
    body.appendChild(text);

    if (actionLabel) {
      body.appendChild(createActionButton(actionLabel, actionUrl));
    }

    toast.appendChild(body);
    list.appendChild(toast);

    window.setTimeout(() => {
      toast.setAttribute('data-closing', 'true');
      window.setTimeout(() => {
        toast.remove();
      }, FADE_DURATION_MS);
    }, TOAST_DURATION_MS);
  }

  if (window.__LINKIVING_PAGE_TOAST_HANDLER__) {
    chrome.runtime.onMessage.removeListener(window.__LINKIVING_PAGE_TOAST_HANDLER__);
  }

  window.__LINKIVING_PAGE_TOAST_HANDLER__ = (message, _sender, sendResponse) => {
    if (message && message.type === MESSAGE_TYPE) {
      showToast(message.message, message.variant, message.actionLabel, message.actionUrl);
      sendResponse({ ok: true });
    }
  };

  chrome.runtime.onMessage.addListener(window.__LINKIVING_PAGE_TOAST_HANDLER__);
})();
