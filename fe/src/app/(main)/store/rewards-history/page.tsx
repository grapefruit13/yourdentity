"use client";

import { useMemo, useState } from "react";
import {
  REWARD_HISTORY_DATA,
  REWARD_HISTORY_TABS,
} from "@/constants/reward-history";

const RewardsHistoryPage = () => {
  const [activeTab, setActiveTab] =
    useState<(typeof REWARD_HISTORY_TABS)[number]["key"]>("all");

  const availableRewards = 1500;
  const expiringRewards = 120;

  const filteredHistory = useMemo(() => {
    if (activeTab === "all") return REWARD_HISTORY_DATA;

    return REWARD_HISTORY_DATA.map((section) => ({
      date: section.date,
      items: section.items.filter((item) => item.type === activeTab),
    })).filter((section) => section.items.length > 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <section className="px-5 pt-10">
        <h1 className="text-lg font-semibold text-gray-900">나다움 내역</h1>
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm text-gray-500">사용 가능한 나다움</p>
          <p className="mt-2 text-3xl font-semibold text-rose-500">
            {availableRewards}
            <span className="ml-1 text-lg font-medium text-rose-400">N</span>
          </p>
          <p className="mt-3 text-xs font-medium text-gray-400">
            소멸 예정인 나다움{" "}
            <span className="ml-1 text-sm font-semibold text-gray-500">
              {expiringRewards}N
            </span>
          </p>
        </div>
      </section>

      <nav className="mt-6 flex gap-2 px-5">
        {REWARD_HISTORY_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 space-y-6 px-5 pb-10">
        {filteredHistory.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white py-16 text-center text-sm text-gray-400 shadow-sm">
            해당 내역이 아직 없어요.
          </div>
        )}

        {filteredHistory.map((section) => (
          <section key={section.date}>
            <p className="text-xs font-medium text-gray-400">{section.date}</p>
            <div className="mt-3 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              {section.items.map((item, index) => {
                const amount =
                  item.amount > 0 ? `+${item.amount}N` : `${item.amount}N`;
                const isLast = index === section.items.length - 1;
                const amountColor =
                  item.type === "earn" ? "text-rose-500" : "text-gray-500";

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-6 py-4 ${
                      isLast ? "" : "border-b border-gray-100"
                    }`}
                  >
                    <div className="max-w-[65%]">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-400">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-semibold ${amountColor}`}>
                        {amount}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default RewardsHistoryPage;
