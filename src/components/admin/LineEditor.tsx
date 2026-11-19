'use client';

import { useMemo, useRef, useState } from 'react';
import { assetUrl, createLine, deleteLine, updateLine } from '@/lib/admin/api';
import {
  LOCALES,
  STATUS_LABEL,
  type ContentStatus,
  type Line,
  type LineInput,
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
  | { mode: 'new'; preset: Partial<LineInput> }
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
          pose_id: target.preset.pose_id ?? '',
          situation_key: target.preset.situation_key ?? situations[0]?.key ?? '',
          locale: target.preset.locale ?? 'ko',
          line_text: '',
          weight: 10,
          status: 'draft',
          note: null,
        };

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

  const canSave =
    !!form.pose_id &&
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
      line_text: form.line_text.trim(),
      note: form.note?.trim() || null,
    };
    try {
      if (target.mode === 'edit') await updateLine(target.line.id, payload);
      else await createLine(payload);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (target.mode !== 'edit') return;
    if (!window.confirm('이 카드를 삭제할까요? 되돌릴 수 없습니다.\n(앱에서만 내리려면 상태를 "보관"으로 바꾸세요)')) return;
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
    <Modal title={target.mode === 'edit' ? '카드 수정' : '카드 추가'} onClose={onClose} wide>
      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div className="space-y-4">
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

          <Field label="포즈" hint={selectedPose ? selectedPose.pose_key : '선택 필요'}>
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
                  onClick={() => set('pose_id', p.id)}
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
          {form.status === 'active' && selectedPose && selectedPose.status !== 'active' && (
            <p className="text-sm text-caution">
              선택한 포즈가 &quot;{STATUS_LABEL[selectedPose.status]}&quot; 상태라 포즈를 공개하기 전까지 앱에 나오지 않습니다.
            </p>
          )}

          <Field label="메모" hint="관리용, 앱에 안 보임">
            <input
              value={form.note ?? ''}
              onChange={(e) => set('note', e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && <p className="rounded-lg bg-alarm-pale p-3 text-sm text-alarm">{error}</p>}
        </div>

        <div className="md:pt-6">
          <PhonePreview
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
