declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent = "test_start" | "test_complete" | "email_submit";

export type AnalyticsParams = {
  overall_score?: number;
  band_label?: string;
  goal?: string;
};

export function trackEvent(name: AnalyticsEvent, params?: AnalyticsParams) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", name, params);
  window.fbq?.("trackCustom", name, params);
}

// Meta standard events (e.g. CompleteRegistration) use fbq('track', ...), a
// separate namespace from custom events (fbq('trackCustom', ...)) so ad-set
// optimization dropdowns in Meta Events Manager can target them.
export function trackMetaStandardEvent(name: string) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", name);
}
