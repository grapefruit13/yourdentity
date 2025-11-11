"use client";

import Modal from "@/components/shared/ui/modal";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * @description 로그아웃 확인 모달 컴포넌트
 */
const LogoutModal = ({ isOpen, onClose, onConfirm }: LogoutModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title="로그아웃 할까요?"
      confirmText="확인"
      cancelText="취소"
      onConfirm={onConfirm}
      onClose={onClose}
      variant="primary"
    />
  );
};

export default LogoutModal;
