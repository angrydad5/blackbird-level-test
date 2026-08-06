import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { applyConvertKitTags } from "@/lib/convertkit";
import { buildMissedSummary } from "@/lib/phenomena";

export async function PATCH(request: Request, ctx: RouteContext<"/api/test-attempts/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const { email, band, goal1, goal2, overallScore, cefr, opic, clipScores } = body;
  console.log("[test-attempts PATCH] id:", id, "body:", JSON.stringify(body));

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("test_attempts").update({ email }).eq("id", id);

  if (error) {
    console.error("[test-attempts PATCH] supabase update failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let convertkit: "ok" | "error" | "skipped" = "skipped";
  let convertkitError: string | null = null;

  const tagNames = [
    typeof band === "string" ? `band-${band.toLowerCase().replace(/\s+/g, "-")}` : null,
    typeof goal1 === "string" ? goal1 : null,
    typeof goal2 === "string" ? goal2 : null,
  ].filter((t): t is string => Boolean(t));

  const siteUrl = process.env.SITE_URL ?? "https://blackbirdenglish.co";
  const fields = {
    score: typeof overallScore === "number" ? Math.round(overallScore * 10) / 10 : undefined,
    band_label: typeof band === "string" ? band : undefined,
    cefr: typeof cefr === "string" ? cefr : undefined,
    opic: typeof opic === "string" ? opic : undefined,
    missed_summary: Array.isArray(clipScores) ? buildMissedSummary(clipScores) : undefined,
    results_url: `${siteUrl}/results/${id}`,
  };

  console.log(
    "[test-attempts PATCH] computed tagNames:",
    tagNames,
    "fields:",
    fields,
  );

  if (tagNames.length > 0) {
    try {
      console.log("[test-attempts PATCH] calling applyConvertKitTags for", email);
      await applyConvertKitTags(email, tagNames, fields);
      convertkit = "ok";
      console.log("[test-attempts PATCH] ConvertKit tagging succeeded for", email);
    } catch (err) {
      convertkit = "error";
      convertkitError = err instanceof Error ? err.message : String(err);
      console.error("[test-attempts PATCH] ConvertKit tagging failed:", convertkitError);
    }
  } else {
    console.warn("[test-attempts PATCH] skipping ConvertKit: no tag names derived from body", body);
  }

  return NextResponse.json({ ok: true, convertkit, convertkitError });
}
