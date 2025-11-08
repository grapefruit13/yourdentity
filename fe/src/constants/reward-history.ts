import type { HistorySection, HistoryType } from "@/types/reward-history";

export const REWARD_HISTORY_TABS: {
  key: "all" | HistoryType;
  label: string;
}[] = [
  { key: "all", label: "전체" },
  { key: "earn", label: "적립" },
  { key: "use", label: "사용" },
  { key: "expire", label: "소멸" },
];

export const REWARD_HISTORY_DATA: HistorySection[] = [
  {
    date: "2025.10.23(수)",
    items: [
      {
        id: "20251023-1",
        title: "한끗루틴 참여",
        amount: 300,
        type: "earn",
        label: "적립",
      },
      {
        id: "20251023-2",
        title: "한끗루틴 참여",
        amount: 300,
        type: "earn",
        label: "적립",
      },
    ],
  },
  {
    date: "2025.10.20(일)",
    items: [
      {
        id: "20251020-1",
        title: "온라인 상품권 2만원권 교환",
        amount: -150,
        type: "use",
        label: "사용",
      },
      {
        id: "20251020-2",
        title: "한끗루틴 참여",
        amount: 300,
        type: "earn",
        label: "적립",
        description: "적립 · 2025.11.01(토) 소멸 예정",
      },
      {
        id: "20251020-3",
        title: "온라인 상품권 2만원권 교환",
        amount: -150,
        type: "use",
        label: "사용",
      },
    ],
  },
];
