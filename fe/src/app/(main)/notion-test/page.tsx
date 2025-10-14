"use client";

import { NotionPageRenderer } from "@/components/shared/NotionPageRenderer";
import { MOCK_NOTION_HOME } from "@/constants/shared/notion-home-mock";

/**
 * @description NotionPageRenderer 테스트 페이지
 * 홈 페이지로 전환하기 전에 Notion 렌더링 테스트용
 */
const NotionTestPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[470px] px-4 py-4">
        <h1 className="mb-4 text-2xl font-bold">Notion 렌더링 테스트</h1>
        <NotionPageRenderer
          recordMap={MOCK_NOTION_HOME}
          fullPage={false}
          darkMode={false}
          className="notion-test"
        />
      </div>
    </div>
  );
};

export default NotionTestPage;
