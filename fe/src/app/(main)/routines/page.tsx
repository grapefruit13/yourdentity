"use client";

import Link from "next/link";
import { MOCK_ROUTINES } from "@/constants/shared/routines-mock";

/**
 * @description 한끗루틴 목록 페이지
 * TODO: Notion에서 데이터 가져오기
 */
const RoutinesPage = () => {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="space-y-4">
        {MOCK_ROUTINES.map((routine) => (
          <Link
            key={routine.id}
            href={`/routines/${routine.id}`}
            className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 flex-shrink-0">
                <img
                  src={routine.thumbnailUrl}
                  alt={routine.title}
                  className="h-20 w-20 rounded-lg object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{routine.title}</h2>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    {routine.status}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  {routine.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>⏱️ {routine.duration}분</span>
                  <span>
                    👥 {routine.currentParticipants}/{routine.maxParticipants}명
                  </span>
                  <span>📊 {routine.difficulty}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoutinesPage;
