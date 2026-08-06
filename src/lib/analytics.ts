declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent = "test_start" | "test_complete" | "email_submit";

export function trackEvent(name: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", name);
  window.fbq?.("trackCustom", name);
}
