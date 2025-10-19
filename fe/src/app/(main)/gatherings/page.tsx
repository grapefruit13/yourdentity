"use client";

import Link from "next/link";
import { MOCK_GATHERINGS } from "@/constants/shared/gatherings-mock";

/**
 * @description 월간소모임 목록 페이지
 * TODO: Notion에서 데이터 가져오기
 */
const GatheringsPage = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="space-y-4">
        {MOCK_GATHERINGS.map((gathering) => (
          <Link
            key={gathering.id}
            href={`/gatherings/${gathering.id}`}
            className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 flex-shrink-0">
                <img
                  src={gathering.thumbnailUrl}
                  alt={gathering.title}
                  className="h-20 w-20 rounded-lg object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{gathering.title}</h2>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      gathering.status === "모집중"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {gathering.status}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  {gathering.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>
                    📅 {gathering.meetingDate} {gathering.meetingTime}
                  </span>
                  <span>📍 {gathering.location}</span>
                  <span>
                    👥 {gathering.currentParticipants}/
                    {gathering.maxParticipants}명
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GatheringsPage;
