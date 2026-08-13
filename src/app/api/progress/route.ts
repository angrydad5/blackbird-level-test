import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, src, clipNumber } = body;

  if (typeof sessionId !== "string" || typeof clipNumber !== "number") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("test_progress").upsert(
      {
        session_id: sessionId,
        src: typeof src === "string" ? src : null,
        furthest_clip: clipNumber,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );

    if (error) {
      console.error("[progress POST] supabase upsert failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[progress POST] unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
