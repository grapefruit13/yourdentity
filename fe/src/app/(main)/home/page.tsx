"use client";

import { NotionPageRenderer } from "@/components/shared/NotionPageRenderer";
import { MOCK_NOTION_HOME } from "@/constants/shared/notion-home-mock";

/**
 * @description 홈 페이지 - Notion 기반 홈 화면
 * 관리자가 Notion에서 자유롭게 구성한 콘텐츠를 그대로 반영
 *
 * @todo 실제 Notion API 연동 구현
 */
const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-4 py-4">
        <NotionPageRenderer
          recordMap={MOCK_NOTION_HOME}
          className="notion-home"
        />
      </div>
    </div>
  );
};

export default HomePage;
