import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/adminAuth";

function rangeCutoff(range: string): string | null {
  const now = Date.now();
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (range === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "all";
  const cutoff = rangeCutoff(range);

  const supabase = getSupabaseAdmin();

  let startsQuery = supabase.from("test_progress").select("*", { count: "exact", head: true });
  let completionsQuery = supabase.from("test_attempts").select("*", { count: "exact", head: true });
  let emailsQuery = supabase
    .from("test_attempts")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null);

  if (cutoff) {
    startsQuery = startsQuery.gte("created_at", cutoff);
    completionsQuery = completionsQuery.gte("created_at", cutoff);
    emailsQuery = emailsQuery.gte("created_at", cutoff);
  }

  const [{ count: starts, error: startsError }, { count: completions, error: completionsError }, { count: emails, error: emailsError }] =
    await Promise.all([startsQuery, completionsQuery, emailsQuery]);

  const error = startsError || completionsError || emailsError;
  if (error) {
    console.error("[admin/stats] query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalStarts = starts ?? 0;
  const totalCompletions = completions ?? 0;
  const totalEmails = emails ?? 0;

  return NextResponse.json({
    overview: {
      totalStarts,
      totalCompletions,
      completionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
      totalEmails,
      emailCaptureRate: totalCompletions > 0 ? (totalEmails / totalCompletions) * 100 : 0,
    },
  });
}
