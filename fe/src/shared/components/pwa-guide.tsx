"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const PWAGuide = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 left-4 z-50 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 font-semibold text-blue-900">
            📱 앱으로 설치하기
          </h3>
          <p className="mb-3 text-sm text-blue-700">
            유스-잇을 앱처럼 사용해보세요!
          </p>

          {!isExpanded && (
            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700"
            >
              설치 방법 보기
            </Button>
          )}

          {isExpanded && (
            <div className="space-y-2 text-sm text-blue-700">
              <div className="rounded border bg-white p-3">
                <p className="mb-2 font-medium">📱 모바일 (iOS/Android):</p>
                <ol className="list-inside list-decimal space-y-1 text-xs">
                  <li>브라우저 메뉴 (⋯ 또는 공유 버튼) 열기</li>
                  <li>
                    &quot;홈 화면에 추가&quot; 또는 &quot;앱 설치&quot; 선택
                  </li>
                  <li>&quot;추가&quot; 또는 &quot;설치&quot; 버튼 누르기</li>
                </ol>
              </div>

              <div className="rounded border bg-white p-3">
                <p className="mb-2 font-medium">💻 데스크톱 (Chrome/Edge):</p>
                <ol className="list-inside list-decimal space-y-1 text-xs">
                  <li>주소창 오른쪽의 설치 아이콘 클릭</li>
                  <li>또는 메뉴 → &quot;앱 설치&quot; 선택</li>
                  <li>&quot;설치&quot; 버튼 클릭</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="p-1 text-blue-700 hover:bg-blue-100"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

export default PWAGuide;
