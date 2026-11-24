export type ContentStatus = 'draft' | 'active' | 'archived';

export const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: '초안',
  active: '공개',
  archived: '보관',
};

export const LOCALES = ['ko', 'en', 'es'] as const;

export interface Situation {
  key: string;
  screen: string;
  state_id: string;
  label: string;
  description: string | null;
  available_vars: string[];
  /** false = 앱이 고정 얼굴 아이콘을 쓰고 멘트만 가져감 (로그아웃·탈퇴 확인) */
  shows_pose: boolean;
  sort_order: number;
}

export interface Pose {
  id: string;
  pose_key: string;
  storage_path: string;
  tags: string[];
  description: string | null;
  ai_prompt: string | null;
  ai_model: string | null;
  ai_meta: Record<string, unknown>;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface Line {
  id: string;
  /** 비어 있으면 아직 이미지와 묶지 않은 멘트 (공개 불가) */
  pose_id: string | null;
  situation_key: string;
  locale: string;
  line_text: string;
  weight: number;
  status: ContentStatus;
  /** 프롬프트 만들 때 참고할 원하는 동작도 여기에 적음 */
  note: string | null;
  /** AI 이미지 프롬프트 요청 표시 (Claude가 프롬프트를 채우면 false) */
  prompt_requested: boolean;
  /** ChatGPT 이미지 생성용 프롬프트 */
  image_prompt: string | null;
  /** Claude가 정한 포즈 이름: 이미지 올릴 때 포즈 이름 기본값 */
  suggested_pose_key: string | null;
  /** 사용자 추천에서 채택된 멘트면 그 추천 id (앱에서 추천자 닉네임 표시) */
  suggestion_id: string | null;
  created_at: string;
  updated_at: string;
}

export type LineInput = Pick<
  Line,
  'pose_id' | 'situation_key' | 'locale' | 'line_text' | 'weight' | 'status' | 'note'
>;

export type PoseMetaInput = Pick<
  Pose,
  'tags' | 'description' | 'ai_prompt' | 'ai_model' | 'ai_meta' | 'status'
>;

/** 기존 시스템 (현재 앱이 쓰는 screen_assets / screen_messages, 읽기 전용) */
export interface LegacyAsset {
  id: string;
  screen: string;
  state_id: string;
  asset_type: 'character' | 'background' | 'face' | string;
  asset_key: string;
  storage_path: string;
  description: string | null;
}

export interface LegacyMessage {
  id: string;
  screen: string;
  state_id: string;
  message_text: string;
}

/** 상황 라벨 '홈 · 오늘 지출 0원' → 그룹 '홈', 짧은 이름 '오늘 지출 0원' */
export function splitSituationLabel(label: string): { group: string; short: string } {
  const [group, ...rest] = label.split(' · ');
  return { group, short: rest.length ? rest.join(' · ') : group };
}

/**
 * 기존 시스템 상황 → 카드 상황
 * 카드는 기록 완료 화면의 18시 전/후 구분이 없음 (input.under_before18 → input.under)
 */
export function toCardSituationKey(legacyKey: string): string {
  return legacyKey.replace(/^(input\.(?:under|close|over))_(?:before|after)18$/, '$1');
}

/**
 * 앱에 실제로 나오는 카드: 멘트가 공개 + 포즈도 공개
 * (멘트만 쓰는 상황은 포즈 상관없이 멘트만 공개면 됨)
 */
export function isLive(line: Line, pose: Pose | undefined, textOnly = false): boolean {
  return line.status === 'active' && (textOnly || pose?.status === 'active');
}

/** 상황당 권장 카드 수 (반복 체감을 줄이기 위한 기준) */
export const HEALTHY_CARD_COUNT = 3;

/** 미리보기용 변수 샘플 값 */
export const SAMPLE_VARS: Record<string, string> = {
  nickname: '거위',
  streak: '12',
  amount: '38,000원',
  category: '배달음식',
};

/** 카드 만들기에서 멘트를 고른 채 이미지를 올릴 때 미리 채우는 값 */
export interface PosePreset {
  poseKey?: string;
  aiPrompt?: string;
  aiModel?: string;
}

// ---------- 사용자 멘트 추천 ----------

export type SuggestionStatus = 'pending' | 'adopted' | 'rejected';
export type SuggestionHint = 'saved' | 'close' | 'over' | 'no_record' | 'unknown';

export const SUGGESTION_STATUS_LABEL: Record<SuggestionStatus, string> = {
  pending: '검토 대기',
  adopted: '채택',
  rejected: '반려',
};

/** 마이페이지에서 사용자가 고른 쉬운 상황 */
export const SUGGESTION_HINT_LABEL: Record<SuggestionHint, string> = {
  saved: '돈 아꼈을 때',
  close: '아슬아슬할 때',
  over: '많이 썼을 때',
  no_record: '기록 안 했을 때',
  unknown: '잘 모르겠음',
};

/** 사용자가 고른 상황 → 채택할 때 기본으로 고를 카드 상황 (관리자가 바꿀 수 있음) */
export const SUGGESTION_HINT_DEFAULT_SITUATION: Record<SuggestionHint, string | null> = {
  saved: 'input.under',
  close: 'input.close',
  over: 'input.over',
  no_record: 'home.zero',
  unknown: null,
};

export interface LineSuggestion {
  id: string;
  user_id: string;
  line_text: string;
  /** 말풍선 아래에서 추천: 그 화면의 상황 */
  situation_key: string | null;
  /** 마이페이지에서 추천: 사용자가 고른 상황 */
  situation_hint: SuggestionHint | null;
  source: 'dialogue' | 'mypage';
  /** 추천할 때 보고 있던 교관 멘트 */
  shown_line_text: string | null;
  /** 채택되면 앱에서 닉네임 표시 동의 */
  show_credit: boolean;
  nickname_at_submit: string | null;
  status: SuggestionStatus;
  adopted_line_id: string | null;
  reviewed_at: string | null;
  notified_at: string | null;
  created_at: string;
}
