import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { src, answers, scores, overallScore, band, goals } = body;

  if (!Array.isArray(answers) || !Array.isArray(scores) || typeof overallScore !== "number" || typeof band !== "string") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("test_attempts")
      .insert({
        src: src ?? null,
        answers,
        scores,
        overall_score: overallScore,
        band,
        goals,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[test-attempts POST] supabase insert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[test-attempts POST] unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
