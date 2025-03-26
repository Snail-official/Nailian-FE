import { create } from 'zustand';

interface ErrorState {
  error: string | null;
  showError: (message: string) => void;
  hideError: () => void;
}

export const useErrorStore = create<ErrorState>(set => ({
  error: null,
  showError: (message: string) => set({ error: message }),
  hideError: () => set({ error: null }),
}));
