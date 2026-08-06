export const CLIP_TRANSLATIONS = [
  "물 좀 갖다 줄래?",
  "이번 주말에 뭐 하고 싶어?",
  "알았다면 나한테 말해줬을 거야?",
  "우리는 \"다 알아야 해!\"라고 느끼지만, 안 그래도 돼. 너도 그냥 사람이잖아",
  "아마 이름을 잊어버리신 것 같아요, 선생님",
  "왜냐하면 부자들이 더 이상 살고 싶어하지 않는 동네를 너무 많이 다녀봤거든",
  "원래 영국 출신이긴 한데, 맞는 말을 많이 하는 사람이야",
  "그래서 이게 범죄였어? 그냥 네 생각이 궁금해서",
  "그 사람한테 필요한 걸 갖다 주는 데 얼마나 걸릴 것 같아?",
  "사실 우리를 쫓아낸 건 아니고... 경찰을 불러서 우리가 그냥 나온 거야. 그리고 다시 들어가려고 밖에서 기다릴 거야",
];

export type PhenomenonKey = "flap-t" | "linking" | "gotta" | "gonna" | "glottal-stop";

export const PHENOMENA: Record<PhenomenonKey, { label: string; blurb: string }> = {
  "flap-t": {
    label: "Flap T",
    blurb:
      "원어민들은 T 발음을 부드러운 ㅅ/ㄷ 소리로 바꿔서 말해요. \"get me\"가 \"게레미\"처럼 들리는 이유죠. 교과서에서 배운 또박또박한 T와는 완전히 다른 소리라, 처음엔 아예 다른 단어처럼 들려요.",
  },
  linking: {
    label: "연음",
    blurb:
      "원어민은 단어와 단어 사이를 끊지 않고 이어서 말해요. \"If you knew\"가 \"이퓨뉴\"처럼 들리는 거죠. 단어 하나하나는 아는데 이어지면 안 들리는 이유가 바로 이거예요.",
  },
  gotta: {
    label: "Gotta",
    blurb:
      "\"have got to\"가 줄어들면서 \"gotta\"가 돼요. 원어민 대화의 절반은 이런 축약형이라, 이걸 놓치면 문장 전체의 흐름을 놓치게 돼요.",
  },
  gonna: {
    label: "Gonna",
    blurb:
      "\"going to\"가 빠르게 말하면 \"gonna\"로 줄어들어요. 미드에서 정말 자주 나오는 표현인데, 교과서엔 \"going to\"만 나오니 실전에서 못 알아듣는 경우가 많아요. 가끔 \"going to\"라고 또박하게 적어도 정답으로 인정돼요 — 둘 다 맞는 표현이에요.",
  },
  "glottal-stop": {
    label: "글로탈 스톱",
    blurb:
      "어떤 T는 아예 사라지고 목에서 살짝 끊기는 소리로 바뀌어요. \"Britain\"이 \"브리튼\"이 아니라 \"브리인\"처럼 들리는 이유죠. Button, mountain, kitten도 똑같은 패턴이에요.",
  },
};

// 0-indexed clip -> phenomena tested by that clip
export const CLIP_PHENOMENA: PhenomenonKey[][] = [
  ["flap-t"], // clip 1
  [], // clip 2
  ["linking"], // clip 3
  ["gotta"], // clip 4
  [], // clip 5
  ["linking"], // clip 6
  ["flap-t", "glottal-stop"], // clip 7
  ["linking"], // clip 8
  ["flap-t", "linking"], // clip 9
  ["gonna"], // clip 10
];

// phenomenon -> which 0-indexed clips test it (inverse of CLIP_PHENOMENA)
const PHENOMENON_CLIPS: Record<PhenomenonKey, number[]> = {
  "flap-t": [0, 6, 8],
  linking: [2, 5, 7, 8],
  gotta: [3],
  gonna: [9],
  "glottal-stop": [6],
};

// short name used inside the missed_summary sentence (distinct from the badge label)
const SUMMARY_LABEL: Record<PhenomenonKey, string> = {
  "flap-t": "flap T",
  linking: "연음",
  gotta: "gotta 축약",
  gonna: "gonna 축약",
  "glottal-stop": "글로탈 스톱",
};

const MISSED_THRESHOLD = 60;

export function buildMissedSummary(clipScores: number[]): string {
  const phenomenonKeys = Object.keys(PHENOMENON_CLIPS) as PhenomenonKey[];

  const averages = phenomenonKeys
    .map((key) => {
      const indices = PHENOMENON_CLIPS[key];
      const avg = indices.reduce((sum, i) => sum + (clipScores[i] ?? 0), 0) / indices.length;
      return { key, avg };
    })
    .filter(({ avg }) => avg < MISSED_THRESHOLD)
    .sort((a, b) => a.avg - b.avg);

  if (averages.length === 0) {
    return "전반적으로 잘 들으셨어요! 아주 미세한 부분만 놓치셨네요.";
  }

  const names = averages.slice(0, 2).map(({ key }) => SUMMARY_LABEL[key]);
  return `특히 ${names.join("과 ")}에서 많이 놓치셨어요.`;
}
