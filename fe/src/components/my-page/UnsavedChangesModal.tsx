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
      title="프로필 편집 나가기"
      description="화면을 나가면 변경사항이 저장되지 않아요. 수정을 그만두시겠어요?"
      confirmText="확인"
      cancelText="취소"
      onConfirm={onConfirm}
      onClose={onClose}
      variant="primary"
    />
  );
};

export default UnsavedChangesModal;
