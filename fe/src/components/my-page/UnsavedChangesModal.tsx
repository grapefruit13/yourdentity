"use client";

import Modal from "@/components/shared/ui/modal";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * @description 변경사항 저장 확인 모달 컴포넌트
 * 프로필 편집 중 뒤로가기 시 표시
 */
const UnsavedChangesModal = ({
  isOpen,
  onClose,
  onConfirm,
}: UnsavedChangesModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title="그만둘까요?"
      description="작성 중인 내용이 사라져요."
      confirmText="그만두기"
      cancelText="계속하기"
      onConfirm={onConfirm}
      onClose={onClose}
      variant="primary"
    />
  );
};

export default UnsavedChangesModal;
