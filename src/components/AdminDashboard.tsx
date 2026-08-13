"use client";

import { useEffect, useState } from "react";

type Range = "7d" | "30d" | "all";

type Overview = {
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  totalEmails: number;
  emailCaptureRate: number;
};

type StatsResponse = {
  overview: Overview;
};

const RANGE_LABELS: Record<Range, string> = {
  "7d": "최근 7일",
  "30d": "최근 30일",
  all: "전체 기간",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-offwhite/10 bg-offwhite/[0.03] p-4">
      <p className="text-xs font-medium text-offwhite/50">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-offwhite">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [range, setRange] = useState<Range>("all");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/stats?range=${range}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-offwhite">관리자 대시보드</h1>

        <div className="mt-6 flex gap-2">
          {(["7d", "30d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                range === r
                  ? "bg-gold text-navy-deep"
                  : "border border-offwhite/15 bg-offwhite/[0.04] text-offwhite/70"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <p className="mt-8 text-sm text-offwhite/50">불러오는 중...</p>
        ) : (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-offwhite/60">개요</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="테스트 시작" value={String(data.overview.totalStarts)} />
              <StatCard label="테스트 완료" value={String(data.overview.totalCompletions)} />
              <StatCard
                label="완료율"
                value={`${data.overview.completionRate.toFixed(1)}%`}
              />
              <StatCard label="이메일 수집" value={String(data.overview.totalEmails)} />
              <StatCard
                label="이메일 수집률"
                value={`${data.overview.emailCaptureRate.toFixed(1)}%`}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
