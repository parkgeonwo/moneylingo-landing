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
  pose_id: string;
  situation_key: string;
  locale: string;
  line_text: string;
  weight: number;
  status: ContentStatus;
  note: string | null;
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

/** 앱에 실제로 나오는 카드: 멘트와 포즈가 모두 공개 상태 */
export function isLive(line: Line, pose: Pose | undefined): boolean {
  return line.status === 'active' && pose?.status === 'active';
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
