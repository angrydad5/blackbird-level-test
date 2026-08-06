"use client";

import { useState } from "react";
import type { GoalOption } from "@/lib/goals";

export function GoalSingleScreen({
  step,
  totalSteps,
  title,
  options,
  buttonLabel = "다음",
  onNext,
}: {
  step: number;
  totalSteps: number;
  title: string;
  options: GoalOption[];
  buttonLabel?: string;
  onNext: (tag: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-1 flex-col px-6 py-10">
      <span className="text-xs font-medium text-offwhite/40">
        질문 {step} / {totalSteps}
      </span>
      <h1 className="mt-3 text-[22px] font-bold leading-snug text-offwhite">
        {title}
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.tag}
            onClick={() => setSelected(option.tag)}
            className={`rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition ${
              selected === option.tag
                ? "border-gold bg-gold/10 text-offwhite"
                : "border-offwhite/15 bg-offwhite/[0.04] text-offwhite/80"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="mt-auto w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-navy-deep transition active:scale-[0.98] disabled:bg-offwhite/10 disabled:text-offwhite/30"
      >
        {buttonLabel}
      </button>
    </main>
  );
}
