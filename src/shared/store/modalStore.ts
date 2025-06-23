import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  ModalData,
  ModalOptions,
  ModalPropsMap,
  ModalType,
} from '../types/modal';

/**
 * 모달 스토어 상태 인터페이스
 */
interface ModalState {
  modals: ModalData[];
  showModal: <T extends ModalType>(
    type: T,
    props: ModalPropsMap[T],
    options?: ModalOptions,
  ) => string;
  closeModal: (id: string) => void;
}

/**
 * 모달 스토어
 */
export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],
  showModal: <T extends ModalType>(
    type: T,
    props: ModalPropsMap[T],
    options?: ModalOptions,
  ) => {
    const id = uuidv4();
    set(state => ({
      modals: [...state.modals, { id, type, props, options }],
    }));
    return id;
  },
  closeModal: id => {
    const modalToClose = get().modals.find(modal => modal.id === id);
    if (modalToClose?.options?.onClose) {
      modalToClose.options.onClose();
    }
    set(state => ({
      modals: state.modals.filter(modal => modal.id !== id),
    }));
  },
}));
