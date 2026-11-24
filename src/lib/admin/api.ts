import { getSupabase, getSupabaseUrl } from '@/lib/supabase';
import type {
  ContentStatus,
  LegacyAsset,
  LegacyMessage,
  Line,
  LineInput,
  LineSuggestion,
  Pose,
  PoseMetaInput,
  Situation,
} from './types';

const BUCKET = 'assets';
const POSE_FOLDER = 'characters';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
};

export function assetUrl(storagePath: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? '알 수 없는 오류'}`);
}

// ---------- 인증 ----------

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await getSupabase().rpc('is_admin');
  if (error) fail('관리자 확인 실패', error);
  return data === true;
}

// ---------- 조회 ----------

export async function fetchAll(): Promise<{
  situations: Situation[];
  poses: Pose[];
  lines: Line[];
}> {
  const [s, p, l] = await Promise.all([
    getSupabase().from('character_situations').select('*').order('sort_order'),
    getSupabase().from('character_poses').select('*').order('created_at', { ascending: false }),
    getSupabase().from('character_lines').select('*').order('created_at', { ascending: false }),
  ]);
  if (s.error) fail('상황 조회 실패', s.error);
  if (p.error) fail('포즈 조회 실패', p.error);
  if (l.error) fail('멘트 조회 실패', l.error);
  return { situations: s.data, poses: p.data, lines: l.data };
}

/** 현재 앱이 쓰는 기존 콘텐츠 (활성 항목만 조회됨: 기존 RLS 정책) */
export async function fetchLegacy(): Promise<{ assets: LegacyAsset[]; messages: LegacyMessage[] }> {
  const [a, m] = await Promise.all([
    getSupabase()
      .from('screen_assets')
      .select('id, screen, state_id, asset_type, asset_key, storage_path, description')
      .order('screen')
      .order('state_id')
      .order('asset_key'),
    getSupabase()
      .from('screen_messages')
      .select('id, screen, state_id, message_text')
      .order('screen')
      .order('state_id')
      .order('created_at'),
  ]);
  if (a.error) fail('기존 이미지 조회 실패', a.error);
  if (m.error) fail('기존 멘트 조회 실패', m.error);
  return { assets: a.data, messages: m.data };
}

// ---------- 빠른 상태 변경 ----------

export async function setLineStatus(id: string, status: ContentStatus): Promise<void> {
  const { error } = await getSupabase().from('character_lines').update({ status }).eq('id', id);
  if (error) fail('상태 변경 실패', error);
}

export async function setPoseStatus(id: string, status: ContentStatus): Promise<void> {
  const { error } = await getSupabase().from('character_poses').update({ status }).eq('id', id);
  if (error) fail('상태 변경 실패', error);
}

// ---------- 멘트 ----------

/** suggestionId: 사용자 추천을 다듬어 채택하는 경우 (앱에서 추천자 닉네임 표시) */
export async function createLine(input: LineInput, suggestionId?: string): Promise<Line> {
  const { data, error } = await getSupabase()
    .from('character_lines')
    .insert({ ...input, suggestion_id: suggestionId ?? null })
    .select()
    .single();
  if (error || !data) fail('멘트 저장 실패', error);
  return data;
}

export async function updateLine(id: string, input: LineInput): Promise<void> {
  const { error } = await getSupabase().from('character_lines').update(input).eq('id', id);
  if (error) fail('멘트 수정 실패', error);
}

/** 멘트에 이미지 묶기 (카드 만들기) */
export async function setLinePose(id: string, poseId: string): Promise<void> {
  const { error } = await getSupabase().from('character_lines').update({ pose_id: poseId }).eq('id', id);
  if (error) fail('이미지 연결 실패', error);
}

/** AI 이미지 프롬프트 요청 표시 켜기/끄기 */
export async function setLinePromptRequested(id: string, requested: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('character_lines')
    .update({ prompt_requested: requested })
    .eq('id', id);
  if (error) fail('프롬프트 요청 표시 실패', error);
}

/** 멘트의 프롬프트로 만든 이미지에 프롬프트 기록 남기기 (비어 있을 때만) */
export async function recordPosePrompt(poseId: string, prompt: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('character_poses')
    .update({ ai_prompt: prompt, ai_model: 'ChatGPT' })
    .eq('id', poseId)
    .is('ai_prompt', null)
    .select('id');
  if (error) fail('프롬프트 기록 실패', error);
  return (data?.length ?? 0) > 0;
}

export async function deleteLine(id: string): Promise<void> {
  const { error } = await getSupabase().from('character_lines').delete().eq('id', id);
  if (error) fail('멘트 삭제 실패', error);
}

// ---------- 포즈 ----------

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES[file.type]) return 'webp 또는 png 파일만 올릴 수 있습니다.';
  if (file.size > MAX_IMAGE_BYTES) return '이미지는 5MB 이하여야 합니다.';
  return null;
}

/** 파일명 → pose_key 후보 (영문 소문자/숫자/_만) */
export function suggestPoseKey(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * 이미지 업로드 + 포즈 행 생성
 * 행 생성이 실패하면 올린 파일을 지워서 고아 파일을 남기지 않음
 * 같은 이름 덮어쓰기는 금지 (앱/CDN 캐시 때문에 옛 이미지가 계속 보일 수 있음)
 */
export async function createPose(
  file: File,
  poseKey: string,
  meta: PoseMetaInput
): Promise<void> {
  const fileError = validateImageFile(file);
  if (fileError) throw new Error(fileError);

  const storagePath = `${POSE_FOLDER}/${poseKey}.${ALLOWED_IMAGE_TYPES[file.type]}`;

  const upload = await getSupabase().storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (upload.error) fail('이미지 업로드 실패 (같은 이름의 파일이 이미 있을 수 있음)', upload.error);

  const { error } = await getSupabase()
    .from('character_poses')
    .insert({ pose_key: poseKey, storage_path: storagePath, ...meta });

  if (error) {
    await getSupabase().storage.from(BUCKET).remove([storagePath]);
    fail('포즈 저장 실패', error);
  }
}

export async function updatePose(id: string, meta: PoseMetaInput): Promise<void> {
  const { error } = await getSupabase().from('character_poses').update(meta).eq('id', id);
  if (error) fail('포즈 수정 실패', error);
}

/**
 * 기존 앱 캐릭터 이미지를 포즈로 가져오기
 * 파일은 복사하지 않고 같은 경로를 가리킴 (기존 이미지가 이미 characters/ 폴더에 있음)
 */
export async function importLegacyAsPose(asset: LegacyAsset, existingKeys: Set<string>): Promise<string> {
  if (!asset.storage_path.startsWith(`${POSE_FOLDER}/`)) {
    throw new Error(`characters/ 폴더 밖의 이미지는 가져올 수 없습니다: ${asset.storage_path}`);
  }
  const base = suggestPoseKey(asset.storage_path.split('/').pop() ?? asset.asset_key) || 'legacy';
  let poseKey = base;
  for (let n = 2; existingKeys.has(poseKey); n++) poseKey = `${base}_${n}`;

  const { error } = await getSupabase()
    .from('character_poses')
    .insert({
      pose_key: poseKey,
      storage_path: asset.storage_path,
      tags: ['기존'],
      description: asset.description,
      ai_meta: { legacy_asset_id: asset.id },
      status: 'draft',
    });
  if (error) fail('가져오기 실패', error);
  return poseKey;
}

/**
 * 포즈 삭제 (연결된 멘트가 있으면 DB가 거부함)
 * 기존 앱이 쓰는 이미지 파일(legacyPaths)은 지우지 않고 남겨둠
 * @returns 이미지 파일 처리 결과
 */
export async function deletePose(
  pose: Pose,
  legacyPaths: Set<string>
): Promise<{ file: 'removed' | 'kept_for_legacy' | 'remove_failed' }> {
  const { error } = await getSupabase().from('character_poses').delete().eq('id', pose.id);
  if (error) fail('포즈 삭제 실패 (연결된 멘트가 있으면 삭제할 수 없음)', error);

  if (legacyPaths.has(pose.storage_path)) return { file: 'kept_for_legacy' };

  const removed = await getSupabase().storage.from(BUCKET).remove([pose.storage_path]);
  return { file: !removed.error && (removed.data?.length ?? 0) > 0 ? 'removed' : 'remove_failed' };
}

// ---------- 사용자 멘트 추천 ----------

export async function fetchSuggestions(): Promise<LineSuggestion[]> {
  const { data, error } = await getSupabase()
    .from('line_suggestions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) fail('추천 멘트 조회 실패', error);
  return data;
}

/** 추천을 다듬어 만든 멘트와 연결하고 채택 처리 */
export async function markSuggestionAdopted(id: string, lineId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('line_suggestions')
    .update({ status: 'adopted', adopted_line_id: lineId, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) fail('채택 처리 실패', error);
}

/** 반려 또는 검토 대기로 되돌리기 */
export async function setSuggestionStatus(id: string, status: 'pending' | 'rejected'): Promise<void> {
  const { error } = await getSupabase()
    .from('line_suggestions')
    .update({ status, reviewed_at: status === 'pending' ? null : new Date().toISOString() })
    .eq('id', id);
  if (error) fail('추천 상태 변경 실패', error);
}

/**
 * 채택 알림 푸시 (Edge Function notify-suggestion-adopted)
 * @returns 'sent' | 'notification_disabled' (사용자가 알림을 꺼둠)
 */
export async function notifySuggestionAdopted(id: string): Promise<'sent' | 'notification_disabled'> {
  const { data, error } = await getSupabase().functions.invoke('notify-suggestion-adopted', {
    body: { suggestion_id: id },
  });
  if (error) {
    // 함수가 돌려준 오류 문구가 있으면 그걸 보여줌
    const context = (error as { context?: Response }).context;
    const body = context ? await context.json().catch(() => null) : null;
    throw new Error(`채택 알림 실패: ${body?.error ?? error.message}`);
  }
  return data?.skipped === 'notification_disabled' ? 'notification_disabled' : 'sent';
}
