"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function ClipAudioButtons({
  fastSrc,
  slowSrc,
}: {
  fastSrc: string;
  slowSrc: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<"fast" | "slow" | null>(null);

  function play(kind: "fast" | "slow") {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = kind === "fast" ? fastSrc : slowSrc;
    audio.currentTime = 0;
    audio.play();
    setPlaying(kind);
  }

  return (
    <div className="flex gap-2">
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <button
        onClick={() => play("fast")}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
          playing === "fast"
            ? "border-gold bg-gold/10 text-gold"
            : "border-offwhite/15 bg-offwhite/[0.04] text-offwhite/70"
        }`}
      >
        <Play size={12} className={playing === "fast" ? "animate-pulse" : ""} />
        원본 속도
      </button>
      <button
        onClick={() => play("slow")}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
          playing === "slow"
            ? "border-gold bg-gold/10 text-gold"
            : "border-offwhite/15 bg-offwhite/[0.04] text-offwhite/70"
        }`}
      >
        <Play size={12} className={playing === "slow" ? "animate-pulse" : ""} />
        천천히 듣기
      </button>
    </div>
  );
}
