'use client';

import { useMemo, useState } from 'react';
import { assetUrl } from '@/lib/admin/api';
import {
  HEALTHY_CARD_COUNT,
  LOCALES,
  STATUS_LABEL,
  isLive,
  splitSituationLabel,
  type ContentStatus,
  type Line,
  type LineInput,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import type { Derived } from './AdminDashboard';
import { EmptyState, PoseImage, SpeechBubble, StatusSwitch, filterClass, primaryButton } from './ui';

interface CardsViewProps {
  situations: Situation[];
  poses: Pose[];
  lines: Line[];
  derived: Derived;
  situationFilter: string | 'all';
  onSituationFilter: (key: string | 'all') => void;
  onCreate: (preset: Partial<LineInput>) => void;
  onEdit: (line: Line) => void;
  onStatus: (id: string, status: ContentStatus) => Promise<void>;
}

export default function CardsView({
  situations,
  poses,
  lines,
  derived,
  situationFilter,
  onSituationFilter,
  onCreate,
  onEdit,
  onStatus,
}: CardsViewProps) {
  const [locale, setLocale] = useState('ko');
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const map = new Map<string, Situation[]>();
    for (const s of situations) {
      const { group } = splitSituationLabel(s.label);
      map.set(group, [...(map.get(group) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [situations]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return lines.filter(
      (l) =>
        l.locale === locale &&
        (status === 'all' || l.status === status) &&
        (!q || l.line_text.includes(q) || l.note?.includes(q))
    );
  }, [lines, locale, status, query]);

  const shownSituations =
    situationFilter === 'all' ? situations : situations.filter((s) => s.key === situationFilter);

  const localeOptions = Array.from(new Set([...LOCALES, ...lines.map((l) => l.locale)]));
  const isFiltering = status !== 'all' || query.trim() !== '';

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">멘트 카드</h1>
          <p className="mt-1 text-sm text-ink-soft">카드 하나는 포즈 이미지 한 장과 멘트 한 줄이에요.</p>
        </div>
        <button
          onClick={() =>
            onCreate({ locale, ...(situationFilter !== 'all' && { situation_key: situationFilter }) })
          }
          disabled={poses.length === 0}
          title={poses.length === 0 ? '포즈 이미지를 먼저 올려주세요' : undefined}
          className={primaryButton}
        >
          카드 만들기
        </button>
      </header>

      {/* 상황 선택 */}
      <div className="mb-4 space-y-2 rounded-2xl bg-white p-3 ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={situationFilter === 'all'} onClick={() => onSituationFilter('all')}>
            전체 상황
          </Chip>
          <span className="mx-1 h-5 w-px bg-line" />
          {groups.map(([group, items]) => (
            <div key={group} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-muted">{group}</span>
              {items.map((s) => {
                const live = derived.liveBySituation.get(s.key) ?? 0;
                return (
                  <Chip key={s.key} active={situationFilter === s.key} onClick={() => onSituationFilter(s.key)}>
                    {splitSituationLabel(s.label).short}
                    <span
                      className={`ml-1.5 tabular-nums ${
                        live === 0 ? 'text-alarm' : live < HEALTHY_CARD_COUNT ? 'text-caution' : 'opacity-60'
                      }`}
                    >
                      {live}
                    </span>
                  </Chip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
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
        <select
          aria-label="상태"
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus | 'all')}
          className={`${filterClass} w-auto`}
        >
          <option value="all">모든 상태</option>
          {(Object.keys(STATUS_LABEL) as ContentStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}만
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="멘트나 메모로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${filterClass} w-56`}
        />
      </div>

      {poses.length === 0 ? (
        <EmptyState text="포즈 이미지가 아직 없어요. 카드를 만들려면 이미지부터 올려주세요." />
      ) : (
        <div className="space-y-10">
          {shownSituations.map((s) => {
            const items = filtered.filter((l) => l.situation_key === s.key);
            // 전체 보기에서 필터에 걸린 게 없는 상황은 숨김
            if (situationFilter === 'all' && isFiltering && items.length === 0) return null;
            const live = derived.liveBySituation.get(s.key) ?? 0;
            return (
              <section key={s.key} aria-labelledby={`sit-${s.key}`}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 id={`sit-${s.key}`} className="text-base font-bold">
                    {s.label}
                  </h2>
                  <span className="text-sm text-ink-muted">앱에 나가는 카드 {live}장</span>
                  {s.available_vars.length > 0 && (
                    <span className="text-xs text-ink-muted">
                      변수 {s.available_vars.map((v) => `{${v}}`).join(' ')}
                    </span>
                  )}
                </div>
                {s.description && situationFilter !== 'all' && (
                  <p className="-mt-2 mb-3 text-sm text-ink-soft">{s.description}</p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {items.map((line) => (
                    <CardTile
                      key={line.id}
                      line={line}
                      pose={derived.poseById.get(line.pose_id)}
                      onEdit={() => onEdit(line)}
                      onStatus={(next) => onStatus(line.id, next)}
                    />
                  ))}
                  <button
                    onClick={() => onCreate({ locale, situation_key: s.key })}
                    className="flex min-h-40 items-center justify-center rounded-2xl border-2 border-dashed border-line text-sm font-medium text-ink-muted hover:border-mint-strong hover:text-mint-strong focus-visible:outline-2 focus-visible:outline-mint-strong"
                  >
                    이 상황에 카드 추가
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mint-strong ${
        active ? 'bg-ink font-semibold text-white' : 'bg-paper text-ink-soft hover:bg-line'
      }`}
    >
      {children}
    </button>
  );
}

function CardTile({
  line,
  pose,
  onEdit,
  onStatus,
}: {
  line: Line;
  pose: Pose | undefined;
  onEdit: () => void;
  onStatus: (next: ContentStatus) => Promise<void>;
}) {
  const blockedByPose = line.status === 'active' && !isLive(line, pose);
  return (
    <div
      className={`group overflow-hidden rounded-2xl bg-white ring-1 transition-shadow hover:ring-ink-muted ${
        blockedByPose ? 'ring-caution' : 'ring-line'
      } ${line.status === 'archived' ? 'opacity-55' : ''}`}
    >
      <button
        onClick={onEdit}
        aria-label="카드 수정"
        className="flex w-full flex-col items-center gap-3 bg-mint-pale px-4 pb-3 pt-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mint-strong"
      >
        <SpeechBubble text={line.line_text} className="w-full text-center" />
        <div className="h-28 w-28">
          {pose && <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />}
        </div>
      </button>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <StatusSwitch value={line.status} onChange={onStatus} />
        <span className="text-xs text-ink-muted" title="클수록 자주 나와요">
          가중치 {line.weight}
        </span>
      </div>
      {blockedByPose && (
        <p className="border-t border-caution-pale bg-caution-pale/50 px-3 py-2 text-xs text-caution">
          포즈가 공개 상태가 아니라서 앱에 안 나와요
        </p>
      )}
      {line.note && <p className="border-t border-line px-3 py-2 text-xs text-ink-muted">{line.note}</p>}
    </div>
  );
}
