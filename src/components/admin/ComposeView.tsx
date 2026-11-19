'use client';

import { useMemo, useRef, useState } from 'react';
import { assetUrl, createLine, setLinePose } from '@/lib/admin/api';
import {
  LOCALES,
  STATUS_LABEL,
  splitSituationLabel,
  type ContentStatus,
  type Line,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import type { Derived } from './AdminDashboard';
import {
  EmptyState,
  PoseImage,
  RenderedLine,
  SpeechBubble,
  StatusBadge,
  StatusSwitch,
  filterClass,
  inputClass,
  primaryButton,
  secondaryButton,
} from './ui';

interface ComposeViewProps {
  situations: Situation[];
  poses: Pose[];
  lines: Line[];
  derived: Derived;
  /** 목록을 다시 불러오지 않고 바로 갱신 */
  onLinesChanged: (update: (prev: Line[]) => Line[]) => void;
  onEditLine: (line: Line) => void;
  onCreatePose: () => void;
  onLineStatus: (id: string, status: ContentStatus) => Promise<void>;
}

type PairFilter = 'unpaired' | 'all' | 'paired';

const PAIR_FILTER_LABEL: Record<PairFilter, string> = {
  unpaired: '이미지 없음',
  all: '전체',
  paired: '카드 완성',
};

const MAX_LENGTH = 200;

export default function ComposeView({
  situations,
  poses,
  lines,
  derived,
  onLinesChanged,
  onEditLine,
  onCreatePose,
  onLineStatus,
}: ComposeViewProps) {
  const hasUnpaired = derived.unpairedBySituation.size > 0;

  const [locale, setLocale] = useState('ko');
  const [situationFilter, setSituationFilter] = useState<string | 'all'>('all');
  const [pairFilter, setPairFilter] = useState<PairFilter>(hasUnpaired ? 'unpaired' : 'all');
  const [query, setQuery] = useState('');

  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedPoseId, setSelectedPoseId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const selectedLine = lines.find((l) => l.id === selectedLineId);
  const selectedPose = poses.find((p) => p.id === selectedPoseId);
  const currentPose = selectedLine ? derived.poseOf(selectedLine) : undefined;
  /** 미리보기에 쓸 이미지: 새로 고른 것 > 지금 묶여 있는 것 */
  const previewPose = selectedPose ?? currentPose;

  const visibleLines = useMemo(() => {
    const q = query.trim();
    return lines.filter(
      (l) =>
        l.status !== 'archived' &&
        l.locale === locale &&
        (situationFilter === 'all' || l.situation_key === situationFilter) &&
        (pairFilter === 'all' || (pairFilter === 'unpaired' ? !l.pose_id : !!l.pose_id)) &&
        (!q || l.line_text.includes(q) || l.note?.includes(q))
    );
  }, [lines, locale, situationFilter, pairFilter, query]);

  const visiblePoses = useMemo(() => poses.filter((p) => p.status !== 'archived'), [poses]);
  const localeOptions = Array.from(new Set([...LOCALES, ...lines.map((l) => l.locale)]));

  const selectLine = (id: string) => {
    setSelectedLineId((cur) => (cur === id ? null : id));
    setMessage(null);
  };

  const selectPose = (id: string) => {
    setSelectedPoseId((cur) => (cur === id ? null : id));
    setMessage(null);
  };

  const handleCreated = (line: Line) => {
    onLinesChanged((prev) => [line, ...prev]);
    setSelectedLineId(line.id);
    setMessage({ tone: 'ok', text: '멘트를 추가했어요. 이제 이미지를 고르세요.' });
  };

  const handleLink = async () => {
    if (!selectedLine || !selectedPose) return;
    setLinking(true);
    setMessage(null);
    const wasUnpaired = !selectedLine.pose_id;
    try {
      await setLinePose(selectedLine.id, selectedPose.id);
      onLinesChanged((prev) =>
        prev.map((l) => (l.id === selectedLine.id ? { ...l, pose_id: selectedPose.id } : l))
      );
      // 이미지 없는 멘트를 연달아 묶을 수 있게 다음 멘트를 자동 선택
      const next = visibleLines.find((l) => !l.pose_id && l.id !== selectedLine.id);
      setSelectedPoseId(null);
      if (wasUnpaired && next && pairFilter === 'unpaired') {
        setSelectedLineId(next.id);
        setMessage({ tone: 'ok', text: '카드로 묶었어요. 다음 멘트를 골라뒀어요.' });
      } else {
        setMessage({ tone: 'ok', text: wasUnpaired ? '카드로 묶었어요.' : '이미지를 바꿨어요.' });
      }
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setLinking(false);
    }
  };

  const action = (() => {
    if (!selectedLine) return { label: '멘트를 고르세요', enabled: false };
    if (!selectedPose) return { label: '이미지를 고르세요', enabled: false };
    if (selectedLine.pose_id === selectedPose.id) return { label: '이미 묶인 카드예요', enabled: false };
    return { label: selectedLine.pose_id ? '이미지 바꾸기' : '카드로 묶기', enabled: true };
  })();

  return (
    <div className="pb-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">카드 만들기</h1>
        <p className="mt-1 text-sm text-ink-soft">멘트 하나, 이미지 하나를 골라서 묶으면 카드가 돼요.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ① 멘트 */}
        <section aria-labelledby="compose-lines" className="min-w-0">
          <h2 id="compose-lines" className="mb-3 text-base font-bold">
            <span className="mr-1.5 text-mint-strong">①</span>멘트 고르기
          </h2>

          <NewLineForm
            situations={situations}
            locale={locale}
            defaultSituation={situationFilter === 'all' ? situations[0]?.key ?? '' : situationFilter}
            onCreated={handleCreated}
          />

          <div className="mb-3 mt-5 flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="보기" className="inline-flex rounded-lg bg-paper p-0.5">
              {(Object.keys(PAIR_FILTER_LABEL) as PairFilter[]).map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={pairFilter === f}
                  onClick={() => setPairFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-[13px] focus-visible:outline-2 focus-visible:outline-mint-strong ${
                    pairFilter === f ? 'bg-white font-semibold text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {PAIR_FILTER_LABEL[f]}
                </button>
              ))}
            </div>
            <select
              aria-label="상황"
              value={situationFilter}
              onChange={(e) => setSituationFilter(e.target.value)}
              className={`${filterClass} w-auto`}
            >
              <option value="all">모든 상황</option>
              {situations.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              aria-label="언어"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className={`${filterClass} w-auto`}
            >
              {localeOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="search"
              placeholder="멘트 찾기"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${filterClass} w-36 flex-1`}
            />
          </div>

          {visibleLines.length === 0 ? (
            <EmptyState
              text={
                pairFilter === 'unpaired'
                  ? '이미지가 필요한 멘트가 없어요. 위에서 새 멘트를 써보세요.'
                  : '조건에 맞는 멘트가 없어요.'
              }
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              {visibleLines.map((line) => {
                const pose = derived.poseOf(line);
                const selected = line.id === selectedLineId;
                return (
                  <li key={line.id} className={selected ? 'bg-mint-pale' : ''}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button
                        onClick={() => selectLine(line.id)}
                        aria-pressed={selected}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-strong"
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                            pose ? 'bg-mint-pale' : 'border-2 border-dashed border-line text-[10px] text-ink-muted'
                          }`}
                        >
                          {pose ? (
                            <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
                          ) : (
                            '없음'
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm leading-snug ${selected ? 'font-semibold' : ''}`}>
                            <RenderedLine text={line.line_text} />
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                            <span>{splitSituationLabel(derived.situationByKey.get(line.situation_key)?.label ?? line.situation_key).short}</span>
                            {line.pose_id && <StatusBadge status={line.status} />}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => onEditLine(line)}
                        className="shrink-0 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-mint-strong"
                      >
                        수정
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ② 이미지 */}
        <section aria-labelledby="compose-poses" className="min-w-0 lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="compose-poses" className="text-base font-bold">
              <span className="mr-1.5 text-mint-strong">②</span>이미지 고르기
            </h2>
            <button onClick={onCreatePose} className={secondaryButton}>
              이미지 올리기
            </button>
          </div>

          {visiblePoses.length === 0 ? (
            <EmptyState text="이미지가 없어요. AI로 만든 이미지를 올리거나 현재 앱 이미지를 가져오세요." />
          ) : (
            <div className="grid max-h-[calc(100vh-15rem)] grid-cols-3 gap-2.5 overflow-y-auto rounded-2xl bg-white p-3 ring-1 ring-line sm:grid-cols-4 2xl:grid-cols-5">
              {visiblePoses.map((pose) => {
                const selected = pose.id === selectedPoseId;
                const isCurrent = !!selectedLine && selectedLine.pose_id === pose.id;
                const count = derived.linesByPose.get(pose.id)?.length ?? 0;
                return (
                  <button
                    key={pose.id}
                    onClick={() => selectPose(pose.id)}
                    aria-pressed={selected}
                    title={pose.description ?? pose.pose_key}
                    className={`relative flex flex-col items-center rounded-xl p-1.5 pb-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-strong ${
                      selected ? 'bg-mint-pale ring-2 ring-mint-strong' : 'hover:bg-paper'
                    }`}
                  >
                    <span className="block aspect-square w-full">
                      <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
                    </span>
                    <span className="mt-1 w-full truncate text-xs font-medium">{pose.pose_key}</span>
                    <span className="text-[11px] text-ink-muted">멘트 {count}</span>
                    {pose.status !== 'active' && (
                      <span className="absolute left-1 top-1 rounded bg-caution-pale px-1 text-[10px] text-caution">
                        {STATUS_LABEL[pose.status]}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute right-1 top-1 rounded bg-ink px-1 text-[10px] text-white">지금</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 묶기 바 */}
      <div className="sticky bottom-4 z-30 mt-6">
        <div className="flex flex-col gap-3 rounded-2xl bg-ink p-3 text-white shadow-lg sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mint-pale">
              {previewPose ? (
                <PoseImage src={assetUrl(previewPose.storage_path)} alt={previewPose.pose_key} className="h-full w-full" />
              ) : (
                <span className="text-[10px] text-mint-dark">이미지</span>
              )}
            </span>
            <SpeechBubble
              text={selectedLine?.line_text ?? ''}
              className="min-w-0 flex-1 [&>span:last-child]:hidden"
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {message && (
              <span className={`text-xs ${message.tone === 'ok' ? 'text-mint' : 'text-alarm-pale'}`}>
                {message.text}
              </span>
            )}
            {selectedLine?.pose_id && !selectedPose && (
              <span className="rounded-full bg-white p-0.5">
                <StatusSwitch
                  value={selectedLine.status}
                  onChange={(next) => onLineStatus(selectedLine.id, next)}
                />
              </span>
            )}
            <button
              onClick={handleLink}
              disabled={!action.enabled || linking}
              className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink hover:bg-mint-strong hover:text-white disabled:bg-white/15 disabled:text-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {linking ? '묶는 중…' : action.label}
            </button>
          </div>
        </div>
        {selectedLine?.status === 'active' && currentPose && currentPose.status !== 'active' && !selectedPose && (
          <p className="mt-2 rounded-lg bg-caution-pale px-3 py-2 text-xs text-caution">
            이미지 &quot;{currentPose.pose_key}&quot;가 아직 {STATUS_LABEL[currentPose.status]} 상태라 앱에 안 나와요. 포즈 이미지에서 공개로 바꿔주세요.
          </p>
        )}
      </div>
    </div>
  );
}

/** 멘트 빠르게 쓰기 (이미지 없이 초안으로 저장) */
function NewLineForm({
  situations,
  locale,
  defaultSituation,
  onCreated,
}: {
  situations: Situation[];
  locale: string;
  defaultSituation: string;
  onCreated: (line: Line) => void;
}) {
  const [situationKey, setSituationKey] = useState(defaultSituation);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // 목록의 상황 필터를 바꾸면 쓰기 폼도 따라감
  const [lastDefault, setLastDefault] = useState(defaultSituation);
  if (defaultSituation !== lastDefault) {
    setLastDefault(defaultSituation);
    setSituationKey(defaultSituation);
  }

  const situation = situations.find((s) => s.key === situationKey);
  const invalidVars = useMemo(() => {
    const allowed = new Set(situation?.available_vars ?? []);
    return Array.from(text.matchAll(/\{([a-z_]+)\}/g))
      .map((m) => m[1])
      .filter((v) => !allowed.has(v));
  }, [text, situation]);

  const trimmed = text.trim();
  const canSave = !!situationKey && trimmed.length > 0 && text.length <= MAX_LENGTH && invalidVars.length === 0 && !saving;

  const insertVar = (name: string) => {
    const el = textRef.current;
    const token = `{${name}}`;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + token + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const line = await createLine({
        pose_id: null,
        situation_key: situationKey,
        locale,
        line_text: trimmed,
        weight: 10,
        status: 'draft',
        note: null,
      });
      setText('');
      onCreated(line);
      textRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-line">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="새 멘트 상황"
          value={situationKey}
          onChange={(e) => setSituationKey(e.target.value)}
          className={`${filterClass} w-auto`}
        >
          {situations.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1">
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
      </div>
      <div className="mt-2 flex items-end gap-2">
        <textarea
          ref={textRef}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // 한글 조합 중 Enter는 무시 (마지막 글자가 두 번 들어가는 문제 방지)
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="새 멘트를 쓰고 Enter (줄바꿈은 Shift+Enter)"
          aria-label="새 멘트"
          className={`${inputClass} resize-none`}
        />
        <button onClick={save} disabled={!canSave} className={`${primaryButton} shrink-0`}>
          {saving ? '추가 중…' : '추가'}
        </button>
      </div>
      <div className="mt-1.5 flex justify-between gap-2 text-xs">
        <span className="text-alarm">
          {invalidVars.length > 0 && `이 상황에서 쓸 수 없는 변수: ${invalidVars.map((v) => `{${v}}`).join(' ')}`}
          {error}
        </span>
        <span className={text.length > MAX_LENGTH ? 'text-alarm' : 'text-ink-muted'}>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
