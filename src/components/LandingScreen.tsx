export function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-5 text-center">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/sean-landing.jpg"
          alt=""
          className="mx-auto h-64 w-auto translate-x-4 sm:h-72 md:h-80"
        />

        <span className="-mt-1 inline-flex items-center rounded-full bg-offwhite/[0.08] px-3.5 py-1.5 text-xs font-medium text-gold">
          영어 듣기 레벨테스트
        </span>

        <h1 className="mt-3 text-[28px] font-bold leading-tight text-offwhite">
          내 영어 듣기 실력,
          <br />
          정확히 몇 레벨일까요?
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-offwhite/70">
          실제 원어민 음성 10문제를 듣고 받아쓰기만 하면
          <br />
          레벨과 CEFR, OPIc 예상 등급까지 알려드려요.
        </p>

        <button
          onClick={onStart}
          className="mt-6 w-full rounded-2xl bg-gold py-4 text-[17px] font-semibold text-navy-deep transition active:scale-[0.98]"
        >
          테스트 시작하기
        </button>

        <p className="mt-3 text-xs text-offwhite/40">약 5분 · 회원가입 필요 없음</p>
      </div>
    </main>
  );
}
