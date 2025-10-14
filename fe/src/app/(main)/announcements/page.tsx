"use client";

import Link from "next/link";
import { MOCK_ANNOUNCEMENTS } from "@/constants/shared/announcements-mock";

/**
 * @description 공지사항 목록 페이지
 * TODO: Notion에서 데이터 가져오기
 */
const AnnouncementsPage = () => {
  const pinnedAnnouncements = MOCK_ANNOUNCEMENTS.filter(
    (item) => item.isPinned
  );
  const regularAnnouncements = MOCK_ANNOUNCEMENTS.filter(
    (item) => !item.isPinned
  );

  return (
    <div className="min-h-screen bg-white p-4">
      {/* 고정된 공지 */}
      {pinnedAnnouncements.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-600">
            📌 중요 공지
          </h2>
          <div className="space-y-3">
            {pinnedAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.id}`}
                className="block rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 hover:bg-yellow-100"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {announcement.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    👁️ {announcement.views}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  {announcement.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{announcement.author}</span>
                  <span>{announcement.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 일반 공지 */}
      <div className="space-y-3">
        {regularAnnouncements.map((announcement) => (
          <Link
            key={announcement.id}
            href={`/announcements/${announcement.id}`}
            className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{announcement.title}</h3>
              <span className="text-xs text-gray-500">
                👁️ {announcement.views}
              </span>
            </div>
            <p className="mb-2 text-sm text-gray-600">
              {announcement.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{announcement.author}</span>
              <span>{announcement.createdAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
