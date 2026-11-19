'use client';

import { useMemo } from 'react';
import { assetUrl } from '@/lib/admin/api';
import {
  HEALTHY_CARD_COUNT,
  splitSituationLabel,
  type Line,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import type { Derived, View } from './AdminDashboard';
import { Figure, PoseImage, RenderedLine } from './ui';

interface OverviewViewProps {
  situations: Situation[];
  poses: Pose[];
  lines: Line[];
  derived: Derived;
  onOpenSituation: (key: string) => void;
  onEditLine: (line: Line) => void;
  onEditPose: (pose: Pose) => void;
  onNavigate: (view: View) => void;
}

type Health = 'empty' | 'thin' | 'healthy';

function healthOf(live: number): Health {
  if (live === 0) return 'empty';
  return live < HEALTHY_CARD_COUNT ? 'thin' : 'healthy';
}

const TILE_STYLE: Record<Health, string> = {
  empty: 'bg-alarm-pale text-alarm',
  thin: 'bg-caution-pale text-caution',
  healthy: 'bg-mint-faint text-mint-dark',
};

export default function OverviewView({
  situations,
  poses,
  lines,
  derived,
  onOpenSituation,
  onEditLine,
  onEditPose,
  onNavigate,
}: OverviewViewProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Situation[]>();
    for (const s of situations) {
      const { group } = splitSituationLabel(s.label);
      map.set(group, [...(map.get(group) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [situations]);

  const liveTotal = Array.from(derived.liveBySituation.values()).reduce((a, b) => a + b, 0);
  const emptySituations = situations.filter((s) => !derived.liveBySituation.get(s.key)).length;
  const draftLines = lines.filter((l) => l.status === 'draft');
  const draftPoses = poses.filter((p) => p.status === 'draft');
  const orphanPoses = poses.filter((p) => p.status !== 'archived' && !derived.linesByPose.has(p.id));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold">상황판</h1>
        <p className="mt-1 text-sm text-ink-soft">
          앱에 나가는 카드는 지금 <strong className="text-ink">{liveTotal}장</strong>이에요.
          {emptySituations > 0 && (
            <> 카드가 하나도 없는 상황이 {emptySituations}곳 있어서, 그곳은 기존 멘트가 대신 나가요.</>
          )}
        </p>
      </header>

      {/* 상황별 커버리지 */}
      <section aria-labelledby="coverage-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 id="coverage-title" className="text-lg font-bold">
            상황별 카드
          </h2>
          <Legend />
        </div>

        <div className="space-y-5 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-6">
          {groups.map(([group, items]) => (
            <div key={group} className="grid gap-3 md:grid-cols-[7rem_1fr]">
              <h3 className="pt-2 text-sm font-semibold text-ink-soft">{group}</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {items.map((s) => {
                  const live = derived.liveBySituation.get(s.key) ?? 0;
                  const draft = derived.draftBySituation.get(s.key) ?? 0;
                  const legacy = derived.legacyBySituation.get(s.key) ?? 0;
                  const health = healthOf(live);
                  return (
                    <button
                      key={s.key}
                      onClick={() => onOpenSituation(s.key)}
                      title={s.description ?? undefined}
                      className={`flex flex-col justify-between gap-3 rounded-xl p-3 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${TILE_STYLE[health]}`}
                    >
                      <span className="text-[13px] font-semibold leading-tight text-ink">
                        {splitSituationLabel(s.label).short}
                      </span>
                      <Figure value={live} className="text-3xl" />
                      <span className="text-[11px] leading-tight text-ink-soft">
                        {draft > 0 && <span className="mr-2">초안 {draft}</span>}
                        {legacy > 0 && <span>기존 멘트 {legacy}</span>}
                        {draft === 0 && legacy === 0 && <span>&nbsp;</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 할 일 */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">검토 기다리는 초안 카드</h2>
            <span className="text-sm text-ink-muted">{draftLines.length}개</span>
          </div>
          {draftLines.length === 0 ? (
            <p className="rounded-xl bg-white p-5 text-sm text-ink-soft ring-1 ring-line">
              검토할 초안이 없어요.{' '}
              <button onClick={() => onNavigate('cards')} className="font-semibold text-mint-strong underline">
                새 카드 만들기
              </button>
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-xl bg-white ring-1 ring-line">
              {draftLines.slice(0, 8).map((line) => {
                const pose = derived.poseById.get(line.pose_id);
                return (
                  <li key={line.id}>
                    <button
                      onClick={() => onEditLine(line)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
                    >
                      <div className="h-11 w-11 shrink-0 rounded-lg bg-mint-pale">
                        {pose && (
                          <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          <RenderedLine text={line.line_text} />
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {derived.situationByKey.get(line.situation_key)?.label}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {draftLines.length > 8 && (
            <button onClick={() => onNavigate('cards')} className="mt-2 text-sm font-semibold text-mint-strong">
              초안 {draftLines.length - 8}개 더 보기
            </button>
          )}
        </div>

        <div className="space-y-6">
          <PoseShelf
            title="멘트가 없는 포즈"
            empty={
              poses.length === 0 ? '포즈가 아직 없어요. 포즈 이미지 탭에서 올리거나 현재 앱 이미지를 가져오세요.' : '모든 포즈에 멘트가 연결돼 있어요.'
            }
            poses={orphanPoses}
            onEditPose={onEditPose}
          />
          <PoseShelf
            title="공개 전 포즈"
            empty="초안 상태인 포즈가 없어요."
            hint="포즈가 초안이면 연결된 카드도 앱에 나오지 않아요."
            poses={draftPoses}
            onEditPose={onEditPose}
          />
        </div>
      </section>
    </div>
  );
}

function Legend() {
  const items: [Health, string][] = [
    ['empty', '없음'],
    ['thin', `${HEALTHY_CARD_COUNT}장 미만`],
    ['healthy', `${HEALTHY_CARD_COUNT}장 이상`],
  ];
  return (
    <div className="flex items-center gap-3 text-xs text-ink-soft">
      <span>앱에 나가는 카드 수</span>
      {items.map(([h, label]) => (
        <span key={h} className="inline-flex items-center gap-1">
          <span className={`h-3 w-3 rounded ${TILE_STYLE[h].split(' ')[0]}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function PoseShelf({
  title,
  empty,
  hint,
  poses,
  onEditPose,
}: {
  title: string;
  empty: string;
  hint?: string;
  poses: Pose[];
  onEditPose: (pose: Pose) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-sm text-ink-muted">{poses.length}개</span>
      </div>
      {hint && poses.length > 0 && <p className="-mt-2 mb-3 text-xs text-ink-muted">{hint}</p>}
      {poses.length === 0 ? (
        <p className="rounded-xl bg-white p-5 text-sm text-ink-soft ring-1 ring-line">{empty}</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-3 ring-1 ring-line">
          {poses.map((p) => (
            <button
              key={p.id}
              onClick={() => onEditPose(p)}
              title={p.pose_key}
              className="h-20 w-20 shrink-0 rounded-lg bg-mint-pale p-1 hover:ring-2 hover:ring-mint-strong focus-visible:outline-2 focus-visible:outline-ink"
            >
              <PoseImage src={assetUrl(p.storage_path)} alt={p.pose_key} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
