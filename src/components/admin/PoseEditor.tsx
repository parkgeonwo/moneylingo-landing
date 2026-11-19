'use client';

import { useEffect, useState } from 'react';
import {
  assetUrl,
  createPose,
  deletePose,
  suggestPoseKey,
  updatePose,
  validateImageFile,
} from '@/lib/admin/api';
import { STATUS_LABEL, type ContentStatus, type Pose, type PoseMetaInput } from '@/lib/admin/types';
import {
  Field,
  Modal,
  PoseImage,
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from './ui';

interface PoseEditorProps {
  /** null = 새 포즈 업로드 */
  pose: Pose | null;
  linkedLineCount: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onAddLine: (pose: Pose) => void;
}

const POSE_KEY_PATTERN = /^[a-z0-9_]+$/;

export default function PoseEditor({ pose, linkedLineCount, onClose, onSaved, onAddLine }: PoseEditorProps) {
  const isNew = pose === null;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [poseKey, setPoseKey] = useState(pose?.pose_key ?? '');
  const [tags, setTags] = useState(pose?.tags.join(', ') ?? '');
  const [description, setDescription] = useState(pose?.description ?? '');
  const [aiPrompt, setAiPrompt] = useState(pose?.ai_prompt ?? '');
  const [aiModel, setAiModel] = useState(pose?.ai_model ?? '');
  const [aiMeta, setAiMeta] = useState(
    pose && Object.keys(pose.ai_meta).length ? JSON.stringify(pose.ai_meta, null, 2) : ''
  );
  const [status, setStatus] = useState<ContentStatus>(pose?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미리보기 URL은 모달이 닫힐 때 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const fileError = validateImageFile(f);
    if (fileError) {
      setError(fileError);
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    if (!poseKey) setPoseKey(suggestPoseKey(f.name));
  };

  const parseMeta = (): Record<string, unknown> | null => {
    if (!aiMeta.trim()) return {};
    try {
      const parsed: unknown = JSON.parse(aiMeta);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // 아래에서 null 반환
    }
    return null;
  };

  const keyValid = POSE_KEY_PATTERN.test(poseKey);
  const canSave = !saving && (!isNew || (file && keyValid));

  const handleSave = async () => {
    const meta = parseMeta();
    if (meta === null) {
      setError('AI 메타데이터는 JSON 객체 형식이어야 합니다. 예: {"seed": 1234}');
      return;
    }
    const input: PoseMetaInput = {
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: description.trim() || null,
      ai_prompt: aiPrompt.trim() || null,
      ai_model: aiModel.trim() || null,
      ai_meta: meta,
      status,
    };

    setSaving(true);
    setError(null);
    try {
      if (isNew && file) await createPose(file, poseKey, input);
      else if (pose) await updatePose(pose.id, input);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pose) return;
    if (!window.confirm(`포즈 "${pose.pose_key}"와 이미지 파일을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setSaving(true);
    try {
      const { fileRemoved } = await deletePose(pose);
      if (!fileRemoved) {
        window.alert(
          `포즈는 삭제됐지만 이미지 파일(${pose.storage_path})은 남아 있습니다.\n` +
            'Storage 조회 권한 SQL(20261119_character_cards_storage_select.sql)을 실행했는지 확인하세요.'
        );
      }
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const imageSrc = previewUrl ?? (pose ? assetUrl(pose.storage_path) : null);

  return (
    <Modal title={isNew ? '포즈 올리기' : `포즈 · ${pose.pose_key}`} onClose={onClose} wide>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div>
          <div className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
            {imageSrc ? (
              <PoseImage src={imageSrc} alt="포즈" className="h-full w-full p-2" />
            ) : (
              <span className="text-sm text-gray-400">이미지 없음</span>
            )}
          </div>
          {isNew ? (
            <label className={`${secondaryButton} mt-3 block cursor-pointer text-center`}>
              {file ? '다른 파일 선택' : '이미지 파일 선택'}
              <input
                type="file"
                accept="image/webp,image/png"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          ) : (
            <p className="mt-3 text-xs text-gray-500">
              이미지를 바꾸려면 새 포즈로 올려주세요. 같은 이름으로 덮어쓰면 앱 캐시 때문에 옛 이미지가 보일 수 있습니다.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">투명 배경 webp 권장 · 5MB 이하</p>
        </div>

        <div className="space-y-4">
          <Field label="포즈 이름" hint="영문 소문자·숫자·_ (예: facepalm_01)">
            <input
              value={poseKey}
              onChange={(e) => setPoseKey(e.target.value)}
              disabled={!isNew}
              className={`${inputClass} font-mono disabled:bg-gray-50 disabled:text-gray-500`}
            />
          </Field>
          {isNew && poseKey && !keyValid && (
            <p className="-mt-2 text-sm text-red-600">영문 소문자, 숫자, _만 쓸 수 있습니다.</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="태그" hint="쉼표로 구분">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="한심, 팔짱"
                className={inputClass}
              />
            </Field>
            <Field label="상태">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className={inputClass}
              >
                {(Object.keys(STATUS_LABEL) as ContentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="설명">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="팔짱 끼고 한심하게 내려다보는 거위"
              className={inputClass}
            />
          </Field>

          <Field label="AI 프롬프트" hint="같은 캐릭터로 새 포즈를 만들 때 참고">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="AI 도구/모델">
              <input value={aiModel} onChange={(e) => setAiModel(e.target.value)} className={inputClass} />
            </Field>
            <Field label="AI 메타데이터" hint="JSON, 선택">
              <textarea
                rows={1}
                value={aiMeta}
                onChange={(e) => setAiMeta(e.target.value)}
                placeholder='{"seed": 1234}'
                className={`${inputClass} resize-y font-mono text-xs`}
              />
            </Field>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
        {pose ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={saving || linkedLineCount > 0}
              title={linkedLineCount > 0 ? '연결된 멘트가 있어 삭제할 수 없습니다. 상태를 "보관"으로 바꾸세요.' : undefined}
              className={dangerButton}
            >
              삭제
            </button>
            {linkedLineCount > 0 && (
              <span className="text-xs text-gray-400">멘트 {linkedLineCount}개 연결됨 · 삭제 대신 보관</span>
            )}
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {pose && (
            <button onClick={() => onAddLine(pose)} className={secondaryButton}>
              이 포즈로 카드 추가
            </button>
          )}
          <button onClick={onClose} className={secondaryButton}>
            취소
          </button>
          <button onClick={handleSave} disabled={!canSave} className={primaryButton}>
            {saving ? '저장 중…' : isNew ? '올리기' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
