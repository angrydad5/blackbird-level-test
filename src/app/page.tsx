"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LandingScreen } from "@/components/LandingScreen";
import { TestScreen } from "@/components/TestScreen";
import { GoalSingleScreen } from "@/components/GoalSingleScreen";
import { GoalMultiScreen } from "@/components/GoalMultiScreen";
import { ResultCard } from "@/components/ResultCard";
import { scoreTest, type ScoringResult } from "@/lib/scoring";
import { GOAL1_OPTIONS, GOAL2_OPTIONS, GOAL3_OPTIONS } from "@/lib/goals";
import { trackEvent } from "@/lib/analytics";

type Step = "landing" | "test" | "goal1" | "goal2" | "goal3" | "result";

function Home() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src");

  const [step, setStep] = useState<Step>("landing");
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [goal1, setGoal1] = useState<string | null>(null);
  const [goal2, setGoal2] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  if (step === "landing") {
    return (
      <LandingScreen
        onStart={() => {
          trackEvent("test_start");
          setStep("test");
        }}
      />
    );
  }

  if (step === "test") {
    return (
      <TestScreen
        src={src}
        onComplete={(a) => {
          setAnswers(a);
          setResult(scoreTest(a));
          setStep("goal1");
        }}
      />
    );
  }

  if (step === "goal1") {
    return (
      <GoalSingleScreen
        key="goal1"
        step={1}
        totalSteps={3}
        title="영어 공부하는 가장 큰 이유는?"
        options={GOAL1_OPTIONS}
        onNext={(tag) => {
          setGoal1(tag);
          setStep("goal2");
        }}
      />
    );
  }

  if (step === "goal2") {
    return (
      <GoalSingleScreen
        key="goal2"
        step={2}
        totalSteps={3}
        title="얼마나 급하세요?"
        options={GOAL2_OPTIONS}
        onNext={(tag) => {
          setGoal2(tag);
          setStep("goal3");
        }}
      />
    );
  }

  if (step === "goal3") {
    return (
      <GoalMultiScreen
        step={3}
        totalSteps={3}
        title="영어로 이런 것도 하고 싶으세요? (해당하는 것 모두 선택)"
        options={GOAL3_OPTIONS}
        onNext={async (selected) => {
          const goals = { goal1, goal2, goal3: selected };
          trackEvent("test_complete", {
            overall_score: result?.overallScore,
            band_label: result?.band.label,
            goal: goal1 ?? undefined,
          });

          try {
            const res = await fetch("/api/test-attempts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                src,
                answers,
                scores: result?.clipScores,
                overallScore: result?.overallScore,
                band: result?.band.label,
                goals,
              }),
            });
            const data = await res.json();
            setAttemptId(data.id ?? null);
          } catch {
            setAttemptId(null);
          }

          setStep("result");
        }}
      />
    );
  }

  if (step === "result" && result) {
    return <ResultCard result={result} goal1={goal1} goal2={goal2} attemptId={attemptId} />;
  }

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
