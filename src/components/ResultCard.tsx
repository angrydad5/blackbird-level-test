"use client";

import { useState } from "react";
import type { ScoringResult } from "@/lib/scoring";
import { trackEvent } from "@/lib/analytics";

const GOAL_CLOSING_SENTENCES: Record<string, string> = {
  "goal-listening": "미드/유튜브에서 원어민이 이 속도로 말합니다.",
  "goal-travel": "여행 중 카페 주문, 입국 심사에서 원어민이 이 속도로 말합니다.",
  "goal-conversation": "원어민 친구와의 대화가 이 속도로 진행됩니다.",
  "goal-career": "비즈니스 미팅에서 이 속도로 대화가 진행됩니다.",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function ResultCard({
  result,
  goal1,
  goal2,
  attemptId,
}: {
  result: ScoringResult;
  goal1: string | null;
  goal2: string | null;
  attemptId: string | null;
}) {
  const { overallScore, band, missedClips } = result;
  const roundedScore = Math.round(overallScore);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const missedSentence =
    missedClips.length > 0
      ? `특히 ${missedClips.map((i) => i + 1).join(", ")}번 문장에서 놓친 부분이 많아요.`
      : "모든 문장을 고르게 잘 들으셨어요!";

  const closingSentence = goal1 ? GOAL_CLOSING_SENTENCES[goal1] : undefined;

  async function handleSubmit() {
    if (!attemptId || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch(`/api/test-attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          band: band.label,
          goal1,
          goal2,
          overallScore,
          cefr: band.cefr,
          opic: band.opic,
          clipScores: result.clipScores,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.convertkit === "ok") {
        trackEvent("email_submit", {
          overall_score: overallScore,
          band_label: band.label,
          goal: goal1 ?? undefined,
        });
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <span className="inline-flex items-center rounded-full bg-offwhite/[0.08] px-3.5 py-1.5 text-xs font-medium text-gold">
          레벨테스트 결과
        </span>

        <h1 className="mt-6 text-[32px] font-bold leading-tight text-offwhite">
          {band.label}
        </h1>
        <p className="mt-2 text-[15px] font-medium text-offwhite/60">
          CEFR {band.cefr} · OPIc {band.opic}
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm font-medium text-offwhite/60">
            <span>점수</span>
            <span className="text-gold">{roundedScore}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-offwhite/10">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${roundedScore}%` }}
            />
          </div>
        </div>

        <p className="mt-8 text-[15px] leading-relaxed text-offwhite/70">
          {missedSentence}
        </p>

        {closingSentence && (
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-offwhite">
            {closingSentence}
          </p>
        )}

        <div className="mt-10 border-t border-offwhite/10 pt-8">
          {status === "success" ? (
            <p className="text-[15px] font-medium text-gold">이메일이 저장됐어요!</p>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-offwhite/80">
                클립별 상세 분석 + 맞춤 학습 플랜을 보내드릴게요.
                <br />
                어디로 보내드릴까요?
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="mt-4 w-full rounded-xl border border-offwhite/15 bg-offwhite/[0.06] px-4 py-3.5 text-[16px] text-offwhite placeholder:text-offwhite/30 focus:border-gold focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!email.includes("@") || status === "submitting" || !attemptId}
                className="mt-4 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-navy-deep transition active:scale-[0.98] disabled:bg-offwhite/10 disabled:text-offwhite/30"
              >
                {status === "submitting" ? "저장 중..." : "분석 받기"}
              </button>
              {status === "error" && (
                <p className="mt-3 text-sm text-offwhite/50">
                  저장에 실패했어요. 다시 시도해주세요.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
