import { ReactNode } from 'react';

/**
 * 기본 모달 속성 인터페이스
 */
export interface BaseModalProps {
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
}

/**
 * 알림 모달 속성 인터페이스
 */
export interface AlertModalProps {
  title: string;
  description?: string;
  confirmText: string;
  onConfirm?: () => void;
}

/**
 * 확인 모달 속성 인터페이스
 */
export interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * 모달 타입
 */
export type ModalType = 'ALERT' | 'CONFIRM';

/**
 * 모달 옵션
 */
export interface ModalOptions {
  closeOnOverlayClick?: boolean;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
}

/**
 * 모달 타입별 속성 매핑
 */
export interface ModalPropsMap {
  ALERT: AlertModalProps;
  CONFIRM: ConfirmModalProps;
}

/**
 * 모달 데이터
 */
export interface ModalData<T extends ModalType = ModalType> {
  id: string;
  type: T;
  props: ModalPropsMap[T];
  options?: ModalOptions;
}
