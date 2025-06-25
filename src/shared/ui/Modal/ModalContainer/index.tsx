import React from 'react';
import { useModalStore } from '~/shared/store/modalStore';
import { ModalData } from '~/shared/types/modal';
import AlertModal from '../variants/AlertModal';
import ConfirmModal from '../variants/ConfirmModal';

/**
 * 모달 타입 가드 함수
 */
function isAlertModal(modal: ModalData): modal is ModalData<'ALERT'> {
  return modal.type === 'ALERT';
}

function isConfirmModal(modal: ModalData): modal is ModalData<'CONFIRM'> {
  return modal.type === 'CONFIRM';
}

/**
 * 모달 컨테이너 컴포넌트
 */
function ModalContainer() {
  const { modals, closeModal } = useModalStore();

  const renderModal = (modal: ModalData) => {
    const { id, options } = modal;

    const handleClose = () => {
      closeModal(id);
    };

    if (isAlertModal(modal)) {
      const alertProps = modal.props;
      return (
        <AlertModal
          key={id}
          title={alertProps.title}
          description={alertProps.description}
          confirmText={alertProps.confirmText}
          onConfirm={() => {
            alertProps.onConfirm?.();
            handleClose();
          }}
          onClose={handleClose}
          closeOnOverlayClick={
            options?.closeOnOverlayClick ?? options?.closeOnBackdrop ?? true
          }
        />
      );
    }

    if (isConfirmModal(modal)) {
      const confirmProps = modal.props;
      return (
        <ConfirmModal
          key={id}
          title={confirmProps.title}
          description={confirmProps.description}
          confirmText={confirmProps.confirmText}
          cancelText={confirmProps.cancelText}
          onConfirm={() => {
            confirmProps.onConfirm?.();
            handleClose();
          }}
          onCancel={() => {
            confirmProps.onCancel?.();
            handleClose();
          }}
          onClose={handleClose}
          closeOnOverlayClick={
            options?.closeOnOverlayClick ?? options?.closeOnBackdrop ?? true
          }
        />
      );
    }

    return null;
  };

  return <>{modals.map(renderModal)}</>;
}

export default ModalContainer;
