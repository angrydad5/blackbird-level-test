"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(true);
        setSubmitting(false);
        return;
      }
      window.location.reload();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <h1 className="text-center text-xl font-bold text-offwhite">관리자 로그인</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="mt-6 w-full rounded-xl border border-offwhite/15 bg-offwhite/[0.06] px-4 py-3.5 text-[16px] text-offwhite placeholder:text-offwhite/30 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!password || submitting}
          className="mt-4 w-full rounded-2xl bg-gold py-3.5 text-[16px] font-semibold text-navy-deep transition active:scale-[0.98] disabled:bg-offwhite/10 disabled:text-offwhite/30"
        >
          {submitting ? "확인 중..." : "로그인"}
        </button>
        {error && (
          <p className="mt-3 text-center text-sm text-offwhite/50">비밀번호가 틀렸어요.</p>
        )}
      </form>
    </main>
  );
}
