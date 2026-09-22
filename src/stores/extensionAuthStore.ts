import { create } from 'zustand';

export type ExtensionAuthStatus =
  | 'checking'
  | 'authenticated'
  | 'signed-out'
  | 'logged-out'
  | 'expired'
  | 'unavailable';

export const useExtensionAuthStore = create<{
  status: ExtensionAuthStatus;
  hasAuthenticated: boolean;
}>(() => ({ status: 'checking', hasAuthenticated: false }));

export function requireExtensionLogin(hadToken: boolean) {
  const { hasAuthenticated } = useExtensionAuthStore.getState();
  useExtensionAuthStore.setState({
    status: hadToken ? 'expired' : hasAuthenticated ? 'logged-out' : 'signed-out',
  });
}
