import { create } from 'zustand';
import { useModalStore } from '~/shared/ui/Modal';

interface ErrorState {
  error: string | null;
  showError: (message: string) => void;
  hideError: () => void;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  error: null,
  showError: (message: string) => {
    set({ error: message });

    useModalStore.getState().showModal('ALERT', {
      title: message || '알 수 없는 오류가 발생했어요',
      confirmText: '돌아가기',
      onConfirm: () => get().hideError(),
    });
  },

  hideError: () => set({ error: null }),
}));
