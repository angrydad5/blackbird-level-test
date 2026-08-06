import Image from "next/image";
import { Check, X } from "lucide-react";
import { ClipAudioButtons } from "@/components/ClipAudioButtons";
import { clipAudioSrc, clipSlowAudioSrc, clipImageSrc } from "@/lib/clips";
import { PHENOMENA, type PhenomenonKey } from "@/lib/phenomena";

export function ClipBlock({
  index,
  sentence,
  translation,
  userAnswer,
  score,
  missed,
  phenomena,
}: {
  index: number;
  sentence: string;
  translation: string;
  userAnswer: string;
  score: number;
  missed: boolean;
  phenomena: PhenomenonKey[];
}) {
  return (
    <div className="rounded-2xl border border-offwhite/10 bg-offwhite/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-offwhite/40">
          {index + 1}번 문장
        </span>
        {missed ? (
          <span className="flex items-center gap-1 rounded-full bg-offwhite/10 px-2.5 py-1 text-xs font-medium text-offwhite/60">
            <X size={12} />
            놓침
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
            <Check size={12} />
            정답
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-offwhite/10 bg-offwhite/5">
          <Image
            src={clipImageSrc(index)}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold leading-snug text-offwhite">
            {sentence}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-offwhite/50">
            {translation}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ClipAudioButtons fastSrc={clipAudioSrc(index)} slowSrc={clipSlowAudioSrc(index)} />
      </div>

      {userAnswer && (
        <p className="mt-4 text-sm text-offwhite/40">
          내가 쓴 답: <span className="text-offwhite/60">{userAnswer}</span>
        </p>
      )}

      {missed && phenomena.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-offwhite/10 pt-4">
          {phenomena.map((key) => (
            <div key={key}>
              <span className="inline-flex items-center rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                {PHENOMENA[key].label}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-offwhite/60">
                {PHENOMENA[key].blurb}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
