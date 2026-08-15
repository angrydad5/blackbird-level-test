import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { ANSWER_KEYS, MISSED_THRESHOLD } from "@/lib/scoring";

function rangeCutoff(range: string): string | null {
  const now = Date.now();
  if (range === "24h") return new Date(now - 24 * 60 * 60 * 1000).toISOString();
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (range === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

const GOAL1_LABELS: Record<string, string> = {
  "goal-listening": "Watch without subtitles",
  "goal-travel": "Travel confidently",
  "goal-conversation": "Talk with foreign friends/colleagues",
  "goal-career": "Exam / career / work abroad",
};

const GOAL2_LABELS: Record<string, string> = {
  "urgency-high": "Within 3 months",
  "urgency-mid": "Within this year",
  "urgency-low": "Slow and steady",
};

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "all";
  const cutoff = rangeCutoff(range);

  const supabase = getSupabaseAdmin();

  let startsQuery = supabase.from("test_progress").select("furthest_clip");
  let emailsQuery = supabase
    .from("test_attempts")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null);
  let attemptsQuery = supabase.from("test_attempts").select("scores, goals");

  if (cutoff) {
    startsQuery = startsQuery.gte("created_at", cutoff);
    emailsQuery = emailsQuery.gte("created_at", cutoff);
    attemptsQuery = attemptsQuery.gte("created_at", cutoff);
  }

  const [
    { data: progress, error: startsError },
    { count: emails, error: emailsError },
    { data: attempts, error: attemptsError },
  ] = await Promise.all([startsQuery, emailsQuery, attemptsQuery]);

  const error = startsError || emailsError || attemptsError;
  if (error) {
    console.error("[admin/stats] query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const progressRows = progress ?? [];
  const totalStarts = progressRows.length;
  const totalEmails = emails ?? 0;
  const rows = attempts ?? [];
  const totalCompletions = rows.length;

  // Drop-off funnel: how many sessions reached at least clip N
  const dropoffFunnel = Array.from({ length: 10 }, (_, i) => {
    const clipNumber = i + 1;
    const reached = progressRows.filter(
      (p) => (p.furthest_clip as number) >= clipNumber,
    ).length;
    return {
      clipNumber,
      reached,
      percentOfStarts: totalStarts > 0 ? (reached / totalStarts) * 100 : 0,
    };
  });

  // Goal / urgency breakdown
  const goal1Counts: Record<string, number> = {};
  const goal2Counts: Record<string, number> = {};
  for (const row of rows) {
    const goals = row.goals as { goal1?: string; goal2?: string } | null;
    if (goals?.goal1) goal1Counts[goals.goal1] = (goal1Counts[goals.goal1] ?? 0) + 1;
    if (goals?.goal2) goal2Counts[goals.goal2] = (goal2Counts[goals.goal2] ?? 0) + 1;
  }
  const goal1Total = Object.values(goal1Counts).reduce((a, b) => a + b, 0);
  const goal2Total = Object.values(goal2Counts).reduce((a, b) => a + b, 0);

  const goalBreakdown = Object.entries(GOAL1_LABELS).map(([tag, label]) => ({
    tag,
    label,
    count: goal1Counts[tag] ?? 0,
    percent: goal1Total > 0 ? ((goal1Counts[tag] ?? 0) / goal1Total) * 100 : 0,
  }));

  const urgencyBreakdown = Object.entries(GOAL2_LABELS).map(([tag, label]) => ({
    tag,
    label,
    count: goal2Counts[tag] ?? 0,
    percent: goal2Total > 0 ? ((goal2Counts[tag] ?? 0) / goal2Total) * 100 : 0,
  }));

  // Per-clip miss rate
  const missCounts = new Array(10).fill(0);
  let scoredRows = 0;
  for (const row of rows) {
    const scores = row.scores as number[] | null;
    if (!Array.isArray(scores) || scores.length !== 10) continue;
    scoredRows++;
    scores.forEach((score, i) => {
      if (score < MISSED_THRESHOLD) missCounts[i]++;
    });
  }

  const perClipMissRate = ANSWER_KEYS.map((sentence, i) => ({
    clipNumber: i + 1,
    sentence,
    missRate: scoredRows > 0 ? (missCounts[i] / scoredRows) * 100 : 0,
    missCount: missCounts[i],
  })).sort((a, b) => b.missRate - a.missRate);

  return NextResponse.json({
    overview: {
      totalStarts,
      totalCompletions,
      completionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
      totalEmails,
      emailCaptureRate: totalCompletions > 0 ? (totalEmails / totalCompletions) * 100 : 0,
    },
    goalBreakdown,
    urgencyBreakdown,
    perClipMissRate,
    dropoffFunnel,
  });
}
