"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { MAX_PLAYS, TOTAL_CLIPS, clipAudioSrc, clipImageSrc } from "@/lib/clips";

export function TestScreen({
  onComplete,
  src,
}: {
  onComplete: (answers: string[]) => void;
  src?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" ? crypto.randomUUID() : "",
  );

  useEffect(() => {
    setText("");
    setPlayCount(0);
    setIsPlaying(false);
  }, [index]);

  useEffect(() => {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionIdRef.current,
        src,
        clipNumber: index + 1,
      }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, index]);

  function handlePlay() {
    const audio = audioRef.current;
    if (!audio || isPlaying || playCount >= MAX_PLAYS) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
    setPlayCount((c) => c + 1);
  }

  function handleNext() {
    const next = [...answers];
    next[index] = text.trim();
    setAnswers(next);

    if (index === TOTAL_CLIPS - 1) {
      onComplete(next);
      return;
    }
    setIndex(index + 1);
  }

  const playsLeft = MAX_PLAYS - playCount;
  const canPlay = !isPlaying && playCount < MAX_PLAYS;
  const canSubmit = text.trim().length > 0;

  return (
    <main className="flex min-h-screen flex-1 flex-col px-6 py-8">
      <audio
        key={index}
        ref={audioRef}
        src={clipAudioSrc(index)}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      <div className="w-full">
        <div className="flex items-center justify-between text-xs font-medium text-offwhite/50">
          <span>
            {index + 1} / {TOTAL_CLIPS}
          </span>
          <span>{playsLeft > 0 ? `재생 ${playsLeft}회 남음` : "재생 완료"}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-offwhite/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${((index + 1) / TOTAL_CLIPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-offwhite/10 bg-offwhite/5">
          <Image
            key={index}
            src={clipImageSrc(index)}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
            priority={index === 0}
          />
        </div>

        <button
          onClick={handlePlay}
          disabled={!canPlay}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy-deep transition active:scale-95 disabled:bg-offwhite/10 disabled:text-offwhite/30"
        >
          {isPlaying ? (
            <Volume2 size={32} className="animate-pulse" />
          ) : (
            <Play size={32} className="ml-1" />
          )}
        </button>
        <p className="-mt-2 text-sm text-offwhite/60">
          {isPlaying
            ? "재생 중..."
            : playCount === 0
              ? "탭해서 듣기"
              : playCount < MAX_PLAYS
                ? "다시 듣기"
                : "재생 횟수를 모두 사용했어요"}
        </p>

        <div className="flex w-full max-w-[220px] items-center gap-3">
          {volume === 0 ? (
            <VolumeX size={18} className="shrink-0 text-offwhite/50" />
          ) : volume < 0.5 ? (
            <Volume1 size={18} className="shrink-0 text-offwhite/50" />
          ) : (
            <Volume2 size={18} className="shrink-0 text-offwhite/50" />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-gold"
            aria-label="볼륨"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="text-sm font-medium text-offwhite/70">
          들은 문장을 그대로 적어보세요
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 입력하세요"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-offwhite/15 bg-offwhite/[0.06] px-4 py-3.5 text-[16px] text-offwhite placeholder:text-offwhite/30 focus:border-gold focus:outline-none"
        />
        <button
          onClick={handleNext}
          disabled={!canSubmit}
          className="mt-4 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-navy-deep transition active:scale-[0.98] disabled:bg-offwhite/10 disabled:text-offwhite/30"
        >
          {index === TOTAL_CLIPS - 1 ? "결과 보기" : "다음"}
        </button>
      </div>
    </main>
  );
}
