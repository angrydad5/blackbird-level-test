import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ANSWER_KEYS, MISSED_THRESHOLD, getBand } from "@/lib/scoring";
import { CLIP_TRANSLATIONS, CLIP_PHENOMENA } from "@/lib/phenomena";
import { ClipBlock } from "@/components/ClipBlock";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const supabase = getSupabaseAdmin();
  const { data: attempt, error } = await supabase
    .from("test_attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (error || !attempt) {
    notFound();
  }

  const answers: string[] = attempt.answers ?? [];
  const scores: number[] = attempt.scores ?? [];
  const band = getBand(attempt.overall_score);
  const roundedScore = Math.round(attempt.overall_score);

  return (
    <main className="flex min-h-screen flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-offwhite/[0.08] px-3.5 py-1.5 text-xs font-medium text-gold">
            상세 분석
          </span>
          <h1 className="mt-4 text-[28px] font-bold leading-tight text-offwhite">
            {band.label}
          </h1>
          <p className="mt-2 text-[15px] font-medium text-offwhite/60">
            CEFR {band.cefr} · OPIc {band.opic} · 점수 {roundedScore}%
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {ANSWER_KEYS.map((sentence, i) => (
            <ClipBlock
              key={i}
              index={i}
              sentence={sentence}
              translation={CLIP_TRANSLATIONS[i]}
              userAnswer={answers[i] ?? ""}
              score={scores[i] ?? 0}
              missed={(scores[i] ?? 0) < MISSED_THRESHOLD}
              phenomena={CLIP_PHENOMENA[i]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
