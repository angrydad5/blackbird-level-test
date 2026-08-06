export type GoalOption = { tag: string; label: string };

export const GOAL1_OPTIONS: GoalOption[] = [
  { tag: "goal-listening", label: "넷플릭스·영화·유튜브를 자막 없이 보고 싶어요" },
  { tag: "goal-travel", label: "여행 가서 자유롭게 말하고 싶어요" },
  { tag: "goal-conversation", label: "외국인 친구·동료와 대화하고 싶어요" },
  { tag: "goal-career", label: "시험(오픽)·커리어·해외 업무 때문에요" },
];

export const GOAL2_OPTIONS: GoalOption[] = [
  { tag: "urgency-high", label: "3개월 안에 결과가 필요해요 (시험·출국·이직)" },
  { tag: "urgency-mid", label: "올해 안에 늘고 싶어요" },
  { tag: "urgency-low", label: "천천히 꾸준히 하고 싶어요" },
];

export const GOAL3_OPTIONS: string[] = [
  "넷플릭스/유튜브 자막 없이 보기",
  "해외여행에서 자유롭게 소통하기",
  "외국인 친구 사귀기",
  "오픽/토익스피킹 점수 올리기",
  "업무에서 영어 사용하기",
  "영어 면접 준비하기",
  "해외 이민/유학 준비",
  "원어민 발음 이해하기",
  "스몰톡 자연스럽게 하기",
  "영어로 프레젠테이션 하기",
];
