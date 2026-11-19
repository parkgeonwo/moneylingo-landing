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

/** 미리보기용 변수 샘플 값 */
export const SAMPLE_VARS: Record<string, string> = {
  nickname: '거위',
  streak: '12',
  amount: '38,000원',
  category: '배달음식',
};
