'use client';

import { useMemo, useRef, useState } from 'react';
import { assetUrl, createLine, deleteLine, markSuggestionAdopted, updateLine } from '@/lib/admin/api';
import {
  LOCALES,
  STATUS_LABEL,
  type ContentStatus,
  type Line,
  type LineInput,
  type LineSuggestion,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import {
  Field,
  Modal,
  PhonePreview,
  PoseImage,
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from './ui';

export type LineEditorTarget =
  | { mode: 'new'; preset: Partial<LineInput>; suggestion?: LineSuggestion }
  | { mode: 'edit'; line: Line };

interface LineEditorProps {
  target: LineEditorTarget;
  situations: Situation[];
  poses: Pose[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const MAX_LENGTH = 200;

export default function LineEditor({ target, situations, poses, onClose, onSaved }: LineEditorProps) {
  const initial: LineInput =
    target.mode === 'edit'
      ? {
          pose_id: target.line.pose_id,
          situation_key: target.line.situation_key,
          locale: target.line.locale,
          line_text: target.line.line_text,
          weight: target.line.weight,
          status: target.line.status,
          note: target.line.note,
        }
      : {
          pose_id: target.preset.pose_id ?? null,
          situation_key: target.preset.situation_key ?? situations[0]?.key ?? '',
          locale: target.preset.locale ?? 'ko',
          line_text: target.preset.line_text ?? '',
          weight: 10,
          status: 'draft',
          note: target.preset.note ?? null,
        };
  const suggestion = target.mode === 'new' ? target.suggestion : undefined;

  const [form, setForm] = useState<LineInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseFilter, setPoseFilter] = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  const situation = situations.find((s) => s.key === form.situation_key);
  const selectedPose = poses.find((p) => p.id === form.pose_id);
  const set = <K extends keyof LineInput>(key: K, value: LineInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** 상황에서 허용하지 않는 변수 (DB 트리거와 같은 규칙을 저장 전에 미리 표시) */
  const invalidVars = useMemo(() => {
    const allowed = new Set(situation?.available_vars ?? []);
    return Array.from(form.line_text.matchAll(/\{([a-z_]+)\}/g))
      .map((m) => m[1])
      .filter((v) => !allowed.has(v));
  }, [form.line_text, situation]);

  const filteredPoses = useMemo(() => {
    const q = poseFilter.trim().toLowerCase();
    return poses.filter(
      (p) =>
        p.status !== 'archived' || p.id === form.pose_id
    ).filter(
      (p) =>
        !q ||
        p.pose_key.includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [poses, poseFilter, form.pose_id]);

  const insertVar = (name: string) => {
    const el = textRef.current;
    const token = `{${name}}`;
    const start = el?.selectionStart ?? form.line_text.length;
    const end = el?.selectionEnd ?? form.line_text.length;
    const next = form.line_text.slice(0, start) + token + form.line_text.slice(end);
    set('line_text', next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  /** 이미지 없는 멘트는 공개 불가 (DB 제약과 같은 규칙) */
  const textOnly = situation?.shows_pose === false;
  const activeWithoutPose = !textOnly && form.status === 'active' && !form.pose_id;

  const canSave =
    !activeWithoutPose &&
    !!form.situation_key &&
    form.line_text.trim().length > 0 &&
    form.line_text.length <= MAX_LENGTH &&
    invalidVars.length === 0 &&
    !saving;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload: LineInput = {
      ...form,
      pose_id: textOnly ? null : form.pose_id,
      line_text: form.line_text.trim(),
      note: form.note?.trim() || null,
    };
    try {
      if (target.mode === 'edit') {
        await updateLine(target.line.id, payload);
      } else {
        const created = await createLine(payload, suggestion?.id);
        if (suggestion) await markSuggestionAdopted(suggestion.id, created.id);
      }
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (target.mode !== 'edit') return;
    if (!window.confirm('이 멘트를 삭제할까요? 되돌릴 수 없습니다.\n(앱에서만 내리려면 상태를 "보관"으로 바꾸세요)')) return;
    setSaving(true);
    try {
      await deleteLine(target.line.id);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={target.mode === 'edit' ? '멘트 수정' : suggestion ? '추천 멘트 채택' : '멘트 추가'}
      onClose={onClose}
      wide
    >
      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          {suggestion && (
            <div className="rounded-xl bg-mint-pale px-4 py-3 text-sm">
              <p className="font-semibold text-ink">
                {suggestion.nickname_at_submit ?? '알 수 없음'}님의 추천
                <span className="ml-2 text-xs font-normal text-ink-soft">
                  {suggestion.show_credit ? '앱에 닉네임 표시' : '닉네임 표시 안 함'}
                </span>
              </p>
              <p className="mt-1 text-ink-soft">원문: “{suggestion.line_text}”</p>
              <p className="mt-1 text-xs text-ink-muted">
                다듬어서 저장하면 채택 처리돼요. 이미지까지 묶어 공개한 뒤 추천 멘트 탭에서 채택 알림을 보내세요.
              </p>
            </div>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="상황">
              <select
                value={form.situation_key}
                onChange={(e) => set('situation_key', e.target.value)}
                className={inputClass}
              >
                {situations.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="언어">
              <select value={form.locale} onChange={(e) => set('locale', e.target.value)} className={inputClass}>
                {Array.from(new Set([...LOCALES, form.locale])).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {situation?.description && <p className="-mt-2 text-xs text-ink-muted">{situation.description}</p>}

          <Field label="멘트" hint={`${form.line_text.length}/${MAX_LENGTH}`}>
            <textarea
              ref={textRef}
              rows={3}
              value={form.line_text}
              onChange={(e) => set('line_text', e.target.value)}
              placeholder="그렇게 돈 쓸 거면 그냥 앱 삭제해라"
              className={`${inputClass} resize-y`}
            />
          </Field>
          <div className="-mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-muted">변수 넣기:</span>
            {(situation?.available_vars ?? []).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVar(v)}
                className="rounded-md bg-mint-pale px-2 py-0.5 font-mono text-xs text-mint-dark hover:bg-mint-faint"
              >
                {`{${v}}`}
              </button>
            ))}
          </div>
          {invalidVars.length > 0 && (
            <p className="text-sm text-alarm">
              이 상황에서 쓸 수 없는 변수: {invalidVars.map((v) => `{${v}}`).join(' ')}
            </p>
          )}
          {form.line_text.length > MAX_LENGTH && (
            <p className="text-sm text-alarm">{MAX_LENGTH}자를 넘을 수 없습니다.</p>
          )}

          {textOnly ? (
            <p className="rounded-lg bg-paper px-3 py-2.5 text-sm text-ink-soft">
              이 상황은 앱이 고정 얼굴 아이콘을 보여줘서 <strong className="text-ink">멘트만</strong> 있으면 돼요.
            </p>
          ) : (
          <Field label="포즈" hint={selectedPose ? selectedPose.pose_key : '안 고르면 이미지 없는 멘트로 저장돼요'}>
            <input
              placeholder="포즈 이름·태그 검색"
              value={poseFilter}
              onChange={(e) => setPoseFilter(e.target.value)}
              className={`${inputClass} mb-2`}
            />
            <div className="grid max-h-52 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-line p-2 sm:grid-cols-6">
              {filteredPoses.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set('pose_id', form.pose_id === p.id ? null : p.id)}
                  title={`${p.pose_key}${p.status !== 'active' ? ` (${STATUS_LABEL[p.status]})` : ''}`}
                  className={`relative aspect-square rounded-lg bg-paper p-1 ${
                    form.pose_id === p.id ? 'ring-2 ring-mint-strong' : 'hover:ring-1 hover:ring-ink-muted'
                  }`}
                >
                  <PoseImage src={assetUrl(p.storage_path)} alt={p.pose_key} className="h-full w-full" />
                  {p.status !== 'active' && (
                    <span className="absolute left-1 top-1 rounded bg-caution-pale px-1 text-[10px] text-caution">
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                </button>
              ))}
              {filteredPoses.length === 0 && (
                <p className="col-span-full py-6 text-center text-xs text-ink-muted">포즈가 없습니다</p>
              )}
            </div>
          </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="상태">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as ContentStatus)}
                className={inputClass}
              >
                {(Object.keys(STATUS_LABEL) as ContentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="가중치" hint="1~100, 클수록 자주">
              <input
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={(e) => set('weight', Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
                className={inputClass}
              />
            </Field>
          </div>
          {activeWithoutPose && (
            <p className="text-sm text-alarm">이미지가 없는 멘트는 공개할 수 없어요. 포즈를 고르거나 초안으로 두세요.</p>
          )}
          {form.status === 'active' && selectedPose && selectedPose.status !== 'active' && (
            <p className="text-sm text-caution">
              선택한 포즈가 &quot;{STATUS_LABEL[selectedPose.status]}&quot; 상태라 포즈를 공개하기 전까지 앱에 나오지 않습니다.
            </p>
          )}

          <Field label="메모" hint="관리용, 앱에 안 보임 · 원하는 동작을 적으면 프롬프트에 반영">
            <input
              value={form.note ?? ''}
              onChange={(e) => set('note', e.target.value)}
              className={inputClass}
            />
          </Field>

          {target.mode === 'edit' && target.line.image_prompt && (
            <PromptBox prompt={target.line.image_prompt} poseKey={target.line.suggested_pose_key} />
          )}

          {error && <p className="rounded-lg bg-alarm-pale p-3 text-sm text-alarm">{error}</p>}
        </div>

        <div className="md:pt-6">
          <PhonePreview
            textOnly={textOnly}
            imageUrl={selectedPose ? assetUrl(selectedPose.storage_path) : undefined}
            text={form.line_text}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        {target.mode === 'edit' ? (
          <button onClick={handleDelete} disabled={saving} className={dangerButton}>
            삭제
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className={secondaryButton}>
            취소
          </button>
          <button onClick={handleSave} disabled={!canSave} className={primaryButton}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Claude가 쓴 이미지 프롬프트: 전체를 그대로 ChatGPT에 붙여넣는 용도 */
function PromptBox({ prompt, poseKey }: { prompt: string; poseKey: string | null }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    setTimeout(() => setCopyState('idle'), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-ink">AI 이미지 프롬프트</span>
          <span className="ml-2 text-xs text-ink-muted">기본 캐릭터 이미지와 함께 ChatGPT에 그대로 붙여넣기</span>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label="프롬프트 복사"
          title="프롬프트 복사"
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-mint-pale hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {copyState === 'copied' ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
            </svg>
          )}
          {copyState === 'copied' ? '복사됨' : copyState === 'failed' ? '복사 실패' : '복사'}
        </button>
      </div>
      <textarea
        readOnly
        rows={10}
        value={prompt}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="AI 이미지 프롬프트"
        className={`${inputClass} mt-1 resize-y text-xs leading-relaxed`}
      />
      {poseKey && (
        <p className="mt-1 text-xs text-ink-muted">
          포즈 이름 <span className="font-mono text-ink">{poseKey}</span> · 카드 만들기에서 이 멘트를 고르고 이미지를 올리면 자동으로 채워져요
        </p>
      )}
    </div>
  );
}
