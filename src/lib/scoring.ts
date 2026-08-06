export const ANSWER_KEYS = [
  "Can you get me some water?",
  "What do you want to do this weekend?",
  "If you knew would you tell me?",
  "We feel like \"we gotta know everything!\" but you don't, you're human",
  "Perhaps he's forgotten his name, sir",
  "Cause I walk in too many space where rich people just don't wanna live anymore",
  "He's from Britain originally, but he can be right about a lot of things",
  "So was this a crime though? I just want to hear your opinion",
  "How long is it going to take you to get him what he needs?",
  "Well they didn't really kick us out... we left cause they called the police. And we're gonna wait outside to re-enter",
];

const CLIP_WEIGHTS = [1, 1, 1, 1, 1, 1, 1, 1.5, 1.5, 1.5];
const TRIVIAL_WORDS = new Set(["a", "the"]);
export const MISSED_THRESHOLD = 60;

const PHRASE_EQUIVALENCES: [RegExp, string][] = [
  [/\bgoing to\b/g, "gonna"],
  [/\bwant to\b/g, "wanna"],
  [/\bgot to\b/g, "gotta"],
  [/\bhave to\b/g, "gotta"],
  [/\bshould have\b/g, "shouldve"],
  [/\bshould've\b/g, "shouldve"],
  [/\bwhat do you\b/g, "whaddya"],
  [/\bthem\b/g, "em"],
  [/\b'em\b/g, "em"],
];

function canonicalize(raw: string): string {
  let s = raw.toLowerCase();
  for (const [pattern, replacement] of PHRASE_EQUIVALENCES) {
    s = s.replace(pattern, replacement);
  }
  s = s.replace(/[^a-z0-9\s]/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function keyWords(canonical: string): string[] {
  return canonical.split(" ").filter((w) => w.length > 0 && !TRIVIAL_WORDS.has(w));
}

function levenshteinAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  const lenDiff = Math.abs(a.length - b.length);
  if (lenDiff > 1) return false;

  if (a.length === b.length) {
    let diffs = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) diffs++;
      if (diffs > 1) return false;
    }
    return diffs <= 1;
  }

  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      if (skipped) return false;
      skipped = true;
      j++;
    }
  }
  return true;
}

export function scoreClip(answerKey: string, userAnswer: string): number {
  const keyTokens = keyWords(canonicalize(answerKey));
  if (keyTokens.length === 0) return 100;

  const available = keyWords(canonicalize(userAnswer));
  let matched = 0;

  for (const key of keyTokens) {
    const idx = available.findIndex((w) => levenshteinAtMostOne(key, w));
    if (idx !== -1) {
      matched++;
      available.splice(idx, 1);
    }
  }

  return (matched / keyTokens.length) * 100;
}

export type Band = {
  label: string;
  cefr: string;
  opic: string;
  min: number;
};

export const BANDS: Band[] = [
  { min: 0, label: "Beginner", cefr: "A1", opic: "NL–NM 예상" },
  { min: 31, label: "Upper Beginner", cefr: "A1–A2", opic: "NH–IL 예상" },
  { min: 56, label: "Intermediate", cefr: "A2–B1", opic: "IM1–IM2 예상" },
  { min: 76, label: "Upper Intermediate", cefr: "B1–B2", opic: "IM3–IH 예상" },
  { min: 91, label: "Advanced", cefr: "B2–C1", opic: "AL–AH 예상" },
];

export function getBand(overallScore: number): Band {
  let band = BANDS[0];
  for (const b of BANDS) {
    if (overallScore >= b.min) band = b;
  }
  return band;
}

export type ScoringResult = {
  clipScores: number[];
  overallScore: number;
  missedClips: number[];
  band: Band;
};

export function scoreTest(answers: string[]): ScoringResult {
  const clipScores = ANSWER_KEYS.map((key, i) => scoreClip(key, answers[i] ?? ""));

  const weightedSum = clipScores.reduce((sum, score, i) => sum + score * CLIP_WEIGHTS[i], 0);
  const totalWeight = CLIP_WEIGHTS.reduce((sum, w) => sum + w, 0);
  const overallScore = weightedSum / totalWeight;

  const missedClips = clipScores
    .map((score, i) => ({ score, i }))
    .filter(({ score }) => score < MISSED_THRESHOLD)
    .map(({ i }) => i);

  return { clipScores, overallScore, missedClips, band: getBand(overallScore) };
}
