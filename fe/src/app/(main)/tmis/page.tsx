"use client";

import Link from "next/link";
import { MOCK_TMIS } from "@/constants/shared/tmis-mock";

/**
 * @description TMI 프로젝트 목록 페이지
 * TODO: Notion에서 데이터 가져오기
 */
const TmisPage = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="space-y-4">
        {MOCK_TMIS.map((tmi) => (
          <Link
            key={tmi.id}
            href={`/tmis/${tmi.id}`}
            className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 flex-shrink-0">
                <img
                  src={tmi.thumbnailUrl}
                  alt={tmi.title}
                  className="h-20 w-20 rounded-lg object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{tmi.title}</h2>
                  <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                    {tmi.status}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">{tmi.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>📁 {tmi.projectType}</span>
                  <span>⏰ 마감: {tmi.deadline}</span>
                  <span>👥 {tmi.participants}명 참여</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TmisPage;
