"use client";

import { useEffect, useState } from "react";

type Range = "24h" | "7d" | "30d" | "all";

type Overview = {
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  totalEmails: number;
  emailCaptureRate: number;
};

type GoalRow = { tag: string; label: string; count: number; percent: number };

type ClipMissRow = {
  clipNumber: number;
  sentence: string;
  missRate: number;
  missCount: number;
};

type DropoffRow = { clipNumber: number; reached: number; percentOfStarts: number };

type StatsResponse = {
  overview: Overview;
  goalBreakdown: GoalRow[];
  urgencyBreakdown: GoalRow[];
  perClipMissRate: ClipMissRow[];
  dropoffFunnel: DropoffRow[];
};

const RANGE_LABELS: Record<Range, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-offwhite/10 bg-offwhite/[0.03] p-4">
      <p className="text-xs font-medium text-offwhite/50">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-offwhite">{value}</p>
    </div>
  );
}

function BreakdownBar({ label, count, percent }: { label: string; count: number; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-offwhite/80">{label}</span>
        <span className="text-offwhite/50">
          {count} ({percent.toFixed(1)}%)
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-offwhite/10">
        <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [range, setRange] = useState<Range>("all");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/admin/stats?range=${range}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.reload();
            return;
          }
          throw new Error("failed to load stats");
        }
        setData(await res.json());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-offwhite">Admin Dashboard</h1>

        <div className="mt-6 flex gap-2">
          {(["24h", "7d", "30d", "all"] as Range[]).map((r) => (
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

        {error ? (
          <p className="mt-8 text-sm text-offwhite/50">
            Couldn&apos;t load stats. Try refreshing the page.
          </p>
        ) : loading || !data ? (
          <p className="mt-8 text-sm text-offwhite/50">Loading...</p>
        ) : (
          <div className="mt-8 flex flex-col gap-10">
            <section>
              <h2 className="text-sm font-semibold text-offwhite/60">Overview</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Test starts" value={String(data.overview.totalStarts)} />
                <StatCard label="Test completions" value={String(data.overview.totalCompletions)} />
                <StatCard
                  label="Completion rate"
                  value={`${data.overview.completionRate.toFixed(1)}%`}
                />
                <StatCard label="Emails captured" value={String(data.overview.totalEmails)} />
                <StatCard
                  label="Email capture rate"
                  value={`${data.overview.emailCaptureRate.toFixed(1)}%`}
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-offwhite/60">
                Why are they studying English?
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {data.goalBreakdown.map((g) => (
                  <BreakdownBar key={g.tag} label={g.label} count={g.count} percent={g.percent} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-offwhite/60">How urgent is it for them?</h2>
              <div className="mt-3 flex flex-col gap-3">
                {data.urgencyBreakdown.map((g) => (
                  <BreakdownBar key={g.tag} label={g.label} count={g.count} percent={g.percent} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-offwhite/60">
                Drop-off funnel (how far people get)
              </h2>
              <p className="mt-1 text-xs text-offwhite/40">
                Clip 1 = everyone who started. Each bar below shows how many made it that far.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {data.dropoffFunnel.map((d) => (
                  <div key={d.clipNumber} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-xs font-medium text-offwhite/50">
                      Clip {d.clipNumber}
                    </span>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-offwhite/10">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${d.percentOfStarts}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right text-xs text-offwhite/50">
                      {d.reached} ({d.percentOfStarts.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-offwhite/60">
                Per-clip miss rate (worst first)
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {data.perClipMissRate.map((c) => (
                  <div
                    key={c.clipNumber}
                    className="rounded-xl border border-offwhite/10 bg-offwhite/[0.03] p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-offwhite">
                        Clip {c.clipNumber}
                      </span>
                      <span className="text-offwhite/50">
                        {c.missCount} missed ({c.missRate.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-offwhite/40">{c.sentence}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-offwhite/10">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${c.missRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
