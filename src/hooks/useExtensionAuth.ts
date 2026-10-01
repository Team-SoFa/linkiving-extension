import { backendApiClient } from '@/lib/api/client';
import { FetchError } from '@/lib/api/errors';
import { resolveExtensionAccessToken } from '@/lib/chrome/auth';
import { APP_BASE_URL } from '@/lib/chrome/navigation';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/constants/auth';
import { requireExtensionLogin, useExtensionAuthStore } from '@/stores/extensionAuthStore';
import { clearToasts } from '@/stores/toastStore';
import { useCallback, useEffect, useRef } from 'react';

const AUTH_HISTORY_KEY = `linkiving.authenticated:${APP_BASE_URL}`;

export function useExtensionAuth() {
  const status = useExtensionAuthStore(state => state.status);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    if (useExtensionAuthStore.getState().status !== 'authenticated') {
      useExtensionAuthStore.setState({ status: 'checking' });
    }

    try {
      const storage = typeof chrome !== 'undefined' ? chrome.storage?.local : undefined;
      const history = await storage?.get(AUTH_HISTORY_KEY).catch(() => undefined);
      const token = await resolveExtensionAccessToken();
      if (id !== requestId.current) return;

      if (history?.[AUTH_HISTORY_KEY] === true) {
        useExtensionAuthStore.setState({ hasAuthenticated: true });
      }
      if (!token) {
        requireExtensionLogin(false);
        return;
      }

      await backendApiClient('/v1/member/me', { signal: requestController.signal });
      if (id !== requestId.current) return;
      useExtensionAuthStore.setState({ status: 'authenticated', hasAuthenticated: true });
      void storage?.set({ [AUTH_HISTORY_KEY]: true }).catch(() => undefined);
    } catch (error) {
      if (id !== requestId.current) return;
      if (!(error instanceof FetchError && error.status === 401)) {
        useExtensionAuthStore.setState({ status: 'unavailable' });
      }
    }
  }, []);

  useEffect(() => {
    const recheck = () => {
      void refresh();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') recheck();
    };
    const onCookieChange = ({ cookie }: chrome.cookies.CookieChangeInfo) => {
      if (cookie.name === ACCESS_TOKEN_COOKIE_NAME) recheck();
    };

    recheck();
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const cookieChanges = typeof chrome !== 'undefined' ? chrome.cookies?.onChanged : undefined;
    cookieChanges?.addListener(onCookieChange);
    return () => {
      requestId.current += 1;
      controller.current?.abort();
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cookieChanges?.removeListener(onCookieChange);
    };
  }, [refresh]);

  useEffect(() => {
    if (status !== 'authenticated') clearToasts();
  }, [status]);

  return { status, refresh };
}
