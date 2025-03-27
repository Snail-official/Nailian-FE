import React from 'react';
import Modal from '~/shared/ui/Modal';
import { useErrorStore } from '../model/errorStore';

function ErrorModal() {
  const { error, hideError } = useErrorStore();

  if (!error) return null;

  return (
    <Modal
      title={error || '알 수 없는 오류가 발생했어요'}
      cancelText="돌아가기"
      onCancel={hideError}
    />
  );
}

export default ErrorModal;
