export const TOTAL_CLIPS = 10;
export const MAX_PLAYS = 2;

export function clipAudioSrc(index: number) {
  const n = String(index + 1).padStart(2, "0");
  return `/audio/clip-${n}.mp3`;
}

export function clipImageSrc(index: number) {
  const n = String(index + 1).padStart(2, "0");
  return `/images/clip-${n}.jpg`;
}

export function clipSlowAudioSrc(index: number) {
  const n = String(index + 1).padStart(2, "0");
  return `/audio/slow/clip-${n}-slow.mp3`;
}
