"use client";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * @description 로그아웃 확인 모달 컴포넌트
 */
const LogoutModal: React.FC<LogoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 모달 컨텐츠 */}
      <div className="mx-8 w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
        {/* 제목 */}
        <h2 className="mb-5 text-center text-base font-medium text-black">
          로그아웃 하시겠습니까?
        </h2>
        
        {/* 버튼들 */}
        <div className="flex gap-3">
          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-[#FF006C] bg-white px-4 py-3 text-sm font-medium text-[#FF006C] hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          
          {/* 확인 버튼 */}
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#FF006C] px-4 py-3 text-sm font-medium text-white hover:bg-[#e6005a] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
