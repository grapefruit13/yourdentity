'use client';

import React from 'react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const CommunityModal: React.FC<CommunityModalProps> = ({ 
  isOpen, 
  onClose, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl px-24 py-8 max-w-4xl w-full mx-4 max-h-[90vh] h-full overflow-y-auto shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {children || (
          <div className="w-full">
            {/* 활동 후기 헤더 */}
            <div className="text-sm text-gray-500 mb-2">활동 후기</div>
            
            {/* 제목 */}
            <h2 className="text-3xl font-bold mb-4 text-gray-800">[6월 월간] 청소년 소모임 후기</h2>
            
            {/* 프로필 섹션 */}
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-800">새싹</span>
                  <span className="text-xs px-1.5 py-0.5 bg-pink-200 text-pink-600 rounded-md">한끗</span>
                </div>
                <div className="text-xs text-gray-500">2025. 6. 15</div>
              </div>
            </div>
            
            {/* 내용 */}
            <div className="text-base text-gray-700 leading-relaxed mb-6">
              <p className="mb-3">
                학교 밖 생활을 시작한 지 얼마 되지 않아 마음이 복잡했지만, 이번 달 '유스보이스'라는 커뮤니티의 월간 소모임에 처음 참여하면서 생각이 조금 정리되었다. 모임에서 만난 사람들은 각자 다른 이유로 학교 밖을 선택했지만, 공통점은 자기 자리에서 최선을 다하려고 애쓴다는 점이었다.
              </p>
              <p className="mb-3">
                누군가는 일을 병행하며 자격증을 준비하고, 누군가는 창작을 꾸준히 이어가고, 또 다른 누군가는 새로운 진로를 탐색 중이었다. "나만 낯선 길을 걷는 게 아니구나"라는 안도감이 들었다.
              </p>
              <p className="mb-3">
                가장 인상 깊었던 순간은 초청 강연 시간이었다. 강연자 '서하림(가명)'은 어린 시절부터 이어진 굴곡과 실패를 숨기지 않고 이야기했다. 화려한 성공담 대신, 멈추지 않고 버틴 날들의 기록을 조용히 꺼내 놓는 모습이 오래 마음에 남았다.
              </p>
              <p className="mb-3">
                "완벽한 계획보다, 오늘 조금이라도 움직였다는 사실이 내일의 나를 지탱한다"는 말이 특히 큰 울림이었다. 나는 강연 내내 고개를 끄덕이며, 지금의 불안도 언젠가 내 문장이 되고 내 선택을 지지해 줄 자원이 될 수 있겠다고 생각했다.
              </p>
              <p className="mb-3">
                모임이 끝날 무렵, 작은 책 선물을 받았다. 표지를 쓰다듬다 보니 오늘의 감정이 서랍에 곱게 정리되는 느낌이었다. 집에 돌아오자마자 첫 장에 날짜를 적고, 강연에서 메모한 문장들을 옮겨 적었다.
              </p>
              <p className="mb-3">
                다음 달에는 그냥 참여자에 머무르지 말고, 내가 겪는 시행착오와 작은 성취들을 짧은 글로 나눠 보기로 했다. 시작선에 서 있는 마음은 여전히 떨리지만, 오늘 만난 사람들과 문장 덕분에 한 발 더 나아갈 용기가 생겼다. 다음 소모임에도 꼭 참여할 것이다.
              </p>
              <p className="text-gray-500">
                + 책 선물 진짜 너무너무 좋아요..
              </p>
            </div>
            
            {/* 활동후기 및 월간 태그 */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-sm text-gray-500">활동후기</span>
              <div className="w-10 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">월간</span>
              </div>
            </div>
            
            {/* 하단 액션 바 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm text-gray-600">0</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </div>
            
            {/* 댓글 작성칸 */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="border border-gray-200 rounded-lg p-4">
                <input 
                  type="text" 
                  placeholder="댓글을 작성해보세요."
                  className="w-full px-0 py-2 border-none focus:outline-none bg-transparent"
                />
                <div className="flex justify-end items-center gap-2 mt-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="font-bold text-sm">Aa</span>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityModal;
