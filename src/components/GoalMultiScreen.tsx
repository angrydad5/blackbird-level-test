"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function GoalMultiScreen({
  step,
  totalSteps,
  title,
  options,
  buttonLabel = "결과 보기",
  onNext,
}: {
  step: number;
  totalSteps: number;
  title: string;
  options: string[];
  buttonLabel?: string;
  onNext: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(option: string) {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col px-6 py-10">
      <span className="text-xs font-medium text-offwhite/40">
        질문 {step} / {totalSteps}
      </span>
      <h1 className="mt-3 text-[22px] font-bold leading-snug text-offwhite">
        {title}
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition ${
                checked
                  ? "border-gold bg-gold/10 text-offwhite"
                  : "border-offwhite/15 bg-offwhite/[0.04] text-offwhite/80"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked ? "border-gold bg-gold" : "border-offwhite/30"
                }`}
              >
                {checked && <Check size={14} className="text-navy-deep" />}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
        className="mt-8 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-navy-deep transition active:scale-[0.98] disabled:bg-offwhite/10 disabled:text-offwhite/30"
      >
        {buttonLabel}
      </button>
    </main>
  );
}
