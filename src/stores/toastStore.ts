import type { IconMapTypes } from '@/components/Icons/icons';
import type { ToastVariant } from '@/components/basics/Toast/Toast';
import React from 'react';
import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  showIcon?: boolean;
  actionLabel?: string;
  actionLabelIcon?: IconMapTypes;
  onAction?: () => void;
  placement?: 'modal-bottom';
}

interface ToastStore {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

const generateToastId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useToastStore = create<ToastStore>(set => ({
  toasts: [],
  showToast: ({ id, ...toast }) => {
    const toastId = id ?? generateToastId();
    set(state => ({ toasts: [...state.toasts, { id: toastId, ...toast }] }));
    return toastId;
  },
  hideToast: id => set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

export const showToast = (toast: Omit<ToastItem, 'id'> & { id?: string }) =>
  useToastStore.getState().showToast(toast);

export const hideToast = (id: string) => useToastStore.getState().hideToast(id);

export const clearToasts = () => useToastStore.getState().clearToasts();
