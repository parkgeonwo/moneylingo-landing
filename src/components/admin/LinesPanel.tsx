'use client';

import { useMemo, useState } from 'react';
import { assetUrl } from '@/lib/admin/api';
import {
  LOCALES,
  STATUS_LABEL,
  type ContentStatus,
  type Line,
  type LineInput,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import { PoseImage, RenderedLine, StatusBadge, inputClass, primaryButton } from './ui';

interface LinesPanelProps {
  situations: Situation[];
  poses: Pose[];
  lines: Line[];
  onCreate: (preset: Partial<LineInput>) => void;
  onEdit: (line: Line) => void;
}

export default function LinesPanel({ situations, poses, lines, onCreate, onEdit }: LinesPanelProps) {
  const [situationKey, setSituationKey] = useState<string | 'all'>('all');
  const [locale, setLocale] = useState<string>('ko');
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const poseById = useMemo(() => new Map(poses.map((p) => [p.id, p])), [poses]);
  const situationByKey = useMemo(() => new Map(situations.map((s) => [s.key, s])), [situations]);

  const localeLines = useMemo(() => lines.filter((l) => l.locale === locale), [lines, locale]);

  /** 상황별 앱에 실제로 나오는 카드 수 (멘트·포즈 모두 공개) */
  const liveCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of localeLines) {
      if (l.status === 'active' && poseById.get(l.pose_id)?.status === 'active') {
        counts.set(l.situation_key, (counts.get(l.situation_key) ?? 0) + 1);
      }
    }
    return counts;
  }, [localeLines, poseById]);

  const visible = useMemo(() => {
    const q = query.trim();
    return localeLines.filter(
      (l) =>
        (situationKey === 'all' || l.situation_key === situationKey) &&
        (status === 'all' || l.status === status) &&
        (!q || l.line_text.includes(q) || l.note?.includes(q))
    );
  }, [localeLines, situationKey, status, query]);

  const localeOptions = useMemo(
    () => Array.from(new Set([...LOCALES, ...lines.map((l) => l.locale)])),
    [lines]
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* 상황 목록 */}
      <aside className="lg:w-64 lg:shrink-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          상황 · 앱 노출 카드 수
        </p>
        <ul className="space-y-0.5">
          <li>
            <SituationButton
              active={situationKey === 'all'}
              label="전체"
              count={localeLines.length}
              onClick={() => setSituationKey('all')}
            />
          </li>
          {situations.map((s) => (
            <li key={s.key}>
              <SituationButton
                active={situationKey === s.key}
                label={s.label}
                count={liveCount.get(s.key) ?? 0}
                warn={(liveCount.get(s.key) ?? 0) === 0}
                onClick={() => setSituationKey(s.key)}
              />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-400">
          빨간 숫자 = 앱에 나올 카드가 없음 (기존 콘텐츠로 대체됨)
        </p>
      </aside>

      {/* 카드 목록 */}
      <section className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select value={locale} onChange={(e) => setLocale(e.target.value)} className={`${inputClass} w-auto`}>
            {localeOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus | 'all')}
            className={`${inputClass} w-auto`}
          >
            <option value="all">모든 상태</option>
            {(Object.keys(STATUS_LABEL) as ContentStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <input
            placeholder="멘트·메모 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass} w-48`}
          />
          <button
            onClick={() =>
              onCreate({ locale, ...(situationKey !== 'all' && { situation_key: situationKey }) })
            }
            disabled={poses.length === 0}
            title={poses.length === 0 ? '포즈 이미지를 먼저 올려주세요' : undefined}
            className={`${primaryButton} ml-auto`}
          >
            + 카드 추가
          </button>
        </div>

        {situationKey !== 'all' && situationByKey.get(situationKey) && (
          <SituationInfo situation={situationByKey.get(situationKey)!} />
        )}

        {poses.length === 0 ? (
          <EmptyState text="아직 포즈 이미지가 없습니다. '포즈 이미지' 탭에서 먼저 이미지를 올려주세요." />
        ) : visible.length === 0 ? (
          <EmptyState text="조건에 맞는 카드가 없습니다." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((line) => {
              const pose = poseById.get(line.pose_id);
              const hiddenByPose = line.status === 'active' && pose?.status !== 'active';
              return (
                <button
                  key={line.id}
                  onClick={() => onEdit(line)}
                  className={`flex gap-3 rounded-xl border bg-white p-3 text-left transition hover:border-gray-400 ${
                    line.status === 'archived' ? 'opacity-60' : ''
                  } ${hiddenByPose ? 'border-amber-300' : 'border-gray-200'}`}
                >
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-gray-50">
                    {pose && (
                      <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <RenderedLine text={line.line_text} />
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                      <StatusBadge status={line.status} />
                      <span>가중치 {line.weight}</span>
                      {situationKey === 'all' && (
                        <span className="truncate">· {situationByKey.get(line.situation_key)?.label}</span>
                      )}
                    </div>
                    {hiddenByPose && (
                      <p className="mt-1 text-xs text-amber-700">포즈가 공개 상태가 아니라 앱에 안 나옴</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SituationButton({
  active,
  label,
  count,
  warn,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  warn?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
        active ? 'bg-white font-medium shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-white'
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`ml-2 text-xs ${warn ? 'font-bold text-red-500' : 'text-gray-400'}`}>{count}</span>
    </button>
  );
}

function SituationInfo({ situation }: { situation: Situation }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
      <span className="font-mono text-xs text-gray-400">{situation.key}</span>
      {situation.description && <p className="mt-0.5 text-gray-700">{situation.description}</p>}
      <p className="mt-1 text-xs text-gray-500">
        쓸 수 있는 변수:{' '}
        {situation.available_vars.length
          ? situation.available_vars.map((v) => `{${v}}`).join(' ')
          : '없음'}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
