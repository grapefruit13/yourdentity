"use client";

import { useEffect } from "react";
import { useTopBarStore } from "@/stores/shared/topbar-store";

type ApplicationStatus = "신청 완료" | "전달 완료";

interface ApplicationHistoryItem {
  id: string;
  productName: string;
  status: ApplicationStatus;
  point: number;
  quantity: number;
  thumbnailLabel: string;
}

interface ApplicationHistorySection {
  date: string;
  items: ApplicationHistoryItem[];
}

const APPLICATION_HISTORY: ApplicationHistorySection[] = [
  {
    date: "2025.6.11(수)",
    items: [
      {
        id: "20250611-1",
        productName: "온라인 상품권 2만원권",
        status: "신청 완료",
        point: 200,
        quantity: 1,
        thumbnailLabel: "온라인 상품권",
      },
      {
        id: "20250611-2",
        productName: "온라인 상품권 2만원권",
        status: "신청 완료",
        point: 200,
        quantity: 1,
        thumbnailLabel: "온라인 상품권",
      },
    ],
  },
  {
    date: "2025.6.10(화)",
    items: [
      {
        id: "20250610-1",
        productName: "온라인 상품권 2만원권",
        status: "전달 완료",
        point: 200,
        quantity: 1,
        thumbnailLabel: "온라인 상품권",
      },
    ],
  },
];

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  "신청 완료": "text-blue-500",
  "전달 완료": "text-emerald-500",
};

const StoreDetailPage = () => {
  const setTitle = useTopBarStore((state) => state.setTitle);
  const resetTopBar = useTopBarStore((state) => state.reset);

  useEffect(() => {
    setTitle("신청내역");
    return () => {
      resetTopBar();
    };
  }, [setTitle, resetTopBar]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <section className="px-5 pt-16">
        <p className="text-xs text-gray-400">
          최근에 신청한 나다움 교환 내역을 확인할 수 있어요.
        </p>
      </section>

      <div className="mt-6 space-y-8 px-5 pb-16">
        {APPLICATION_HISTORY.map((section) => (
          <section key={section.date} className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-gray-500">{section.date}</p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium text-gray-400"
              >
                상세 보기
                <span className="text-xs text-gray-400">›</span>
              </button>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-[11px] font-semibold text-gray-500">
                      {item.thumbnailLabel}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-xs font-semibold ${STATUS_BADGE_CLASS[item.status]}`}
                      >
                        {item.status}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {item.point}N · {item.quantity}개
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default StoreDetailPage;
