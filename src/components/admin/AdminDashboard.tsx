'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAll, fetchLegacy, setLineStatus, setPoseStatus } from '@/lib/admin/api';
import {
  isLive,
  toCardSituationKey,
  type ContentStatus,
  type LegacyAsset,
  type LegacyMessage,
  type Line,
  type Pose,
  type Situation,
} from '@/lib/admin/types';
import OverviewView from './OverviewView';
import CardsView from './CardsView';
import ComposeView from './ComposeView';
import PosesView from './PosesView';
import LegacyView from './LegacyView';
import LineEditor, { type LineEditorTarget } from './LineEditor';
import PoseEditor from './PoseEditor';

export type View = 'overview' | 'compose' | 'cards' | 'poses' | 'legacy';

/** 여러 화면에서 같이 쓰는 계산 결과 */
export interface Derived {
  poseById: Map<string, Pose>;
  /** 멘트에 묶인 포즈 (이미지 없는 멘트면 undefined) */
  poseOf: (line: Line) => Pose | undefined;
  situationByKey: Map<string, Situation>;
  /** 상황별 앱 노출 카드 수 (ko) */
  liveBySituation: Map<string, number>;
  /** 상황별 초안 카드 수 (ko, 이미지가 묶인 것만) */
  draftBySituation: Map<string, number>;
  /** 상황별 이미지 없는 멘트 수 (ko) */
  unpairedBySituation: Map<string, number>;
  /** 상황별 기존 시스템 멘트 수 */
  legacyBySituation: Map<string, number>;
  linesByPose: Map<string, Line[]>;
  /** 기존 앱이 쓰는 이미지 경로 (포즈 삭제 시 파일 보존용) */
  legacyPaths: Set<string>;
}

const NAV: { key: View; label: string }[] = [
  { key: 'overview', label: '상황판' },
  { key: 'compose', label: '카드 만들기' },
  { key: 'cards', label: '카드 목록' },
  { key: 'poses', label: '포즈 이미지' },
  { key: 'legacy', label: '현재 앱 콘텐츠' },
];

export default function AdminDashboard({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [view, setView] = useState<View>('overview');
  const [cardsSituation, setCardsSituation] = useState<string | 'all'>('all');

  const [situations, setSituations] = useState<Situation[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [legacyAssets, setLegacyAssets] = useState<LegacyAsset[]>([]);
  const [legacyMessages, setLegacyMessages] = useState<LegacyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lineTarget, setLineTarget] = useState<LineEditorTarget | null>(null);
  const [poseTarget, setPoseTarget] = useState<Pose | 'new' | null>(null);

  const reload = useCallback(async () => {
    try {
      const [data, legacy] = await Promise.all([fetchAll(), fetchLegacy()]);
      setSituations(data.situations);
      setPoses(data.poses);
      setLines(data.lines);
      setLegacyAssets(legacy.assets);
      setLegacyMessages(legacy.messages);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const derived = useMemo<Derived>(() => {
    const poseById = new Map(poses.map((p) => [p.id, p]));
    const poseOf = (line: Line) => (line.pose_id ? poseById.get(line.pose_id) : undefined);
    const situationByKey = new Map(situations.map((s) => [s.key, s]));
    const liveBySituation = new Map<string, number>();
    const draftBySituation = new Map<string, number>();
    const unpairedBySituation = new Map<string, number>();
    const linesByPose = new Map<string, Line[]>();
    const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);

    for (const l of lines) {
      if (l.pose_id) linesByPose.set(l.pose_id, [...(linesByPose.get(l.pose_id) ?? []), l]);
      if (l.locale !== 'ko') continue;
      if (!l.pose_id) {
        if (l.status !== 'archived') bump(unpairedBySituation, l.situation_key);
        continue;
      }
      if (isLive(l, poseOf(l))) bump(liveBySituation, l.situation_key);
      if (l.status === 'draft') bump(draftBySituation, l.situation_key);
    }

    // 기존 앱은 기록 완료 화면을 18시 전/후로 나눔 → 카드 상황 기준으로 합쳐서 셈
    const legacyBySituation = new Map<string, number>();
    for (const m of legacyMessages) bump(legacyBySituation, toCardSituationKey(`${m.screen}.${m.state_id}`));

    return {
      poseById,
      poseOf,
      unpairedBySituation,
      situationByKey,
      liveBySituation,
      draftBySituation,
      legacyBySituation,
      linesByPose,
      legacyPaths: new Set(legacyAssets.map((a) => a.storage_path)),
    };
  }, [poses, situations, lines, legacyMessages, legacyAssets]);

  /** 목록에서 바로 상태 변경 후 해당 행만 갱신 (전체 재조회 없이) */
  const changeLineStatus = useCallback(async (id: string, status: ContentStatus) => {
    try {
      await setLineStatus(id, status);
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const changePoseStatus = useCallback(async (id: string, status: ContentStatus) => {
    try {
      await setPoseStatus(id, status);
      setPoses((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const openSituation = (key: string | 'all') => {
    setCardsSituation(key);
    setView('cards');
  };

  const afterSave = async () => {
    setLineTarget(null);
    setPoseTarget(null);
    await reload();
  };

  return (
    <div className="lg:flex">
      {/* 사이드바 (모바일에서는 상단 바) */}
      <aside className="sticky top-0 z-40 bg-ink text-white lg:h-screen lg:w-56 lg:shrink-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:block lg:px-5 lg:py-6">
          <div className="lg:mb-8">
            <p className="text-[15px] font-bold">지갑교관</p>
            <p className="font-[family-name:var(--font-akira)] text-[10px] text-mint">STUDIO</p>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs text-white/60 hover:text-white lg:hidden"
          >
            로그아웃
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              aria-current={view === item.key ? 'page' : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-mint ${
                view === item.key
                  ? 'bg-white/10 font-semibold text-white shadow-[inset_3px_0_0_var(--color-mint)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onSignOut}
          className="absolute bottom-6 left-5 hidden text-xs text-white/50 hover:text-white lg:block"
        >
          로그아웃
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl bg-alarm-pale px-4 py-3 text-sm text-alarm">
            <span>{error}</span>
            <button onClick={reload} className="shrink-0 font-semibold underline">
              다시 불러오기
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중…</p>
        ) : view === 'overview' ? (
          <OverviewView
            situations={situations}
            poses={poses}
            lines={lines}
            derived={derived}
            onOpenSituation={openSituation}
            onEditLine={(line) => setLineTarget({ mode: 'edit', line })}
            onEditPose={setPoseTarget}
            onNavigate={setView}
          />
        ) : view === 'compose' ? (
          <ComposeView
            situations={situations}
            poses={poses}
            lines={lines}
            derived={derived}
            onLinesChanged={setLines}
            onEditLine={(line) => setLineTarget({ mode: 'edit', line })}
            onCreatePose={() => setPoseTarget('new')}
            onLineStatus={changeLineStatus}
          />
        ) : view === 'cards' ? (
          <CardsView
            situations={situations}
            poses={poses}
            lines={lines}
            derived={derived}
            situationFilter={cardsSituation}
            onSituationFilter={setCardsSituation}
            onCreate={(preset) => setLineTarget({ mode: 'new', preset })}
            onEdit={(line) => setLineTarget({ mode: 'edit', line })}
            onStatus={changeLineStatus}
            onCompose={() => setView('compose')}
          />
        ) : view === 'poses' ? (
          <PosesView
            poses={poses}
            derived={derived}
            onCreate={() => setPoseTarget('new')}
            onEdit={setPoseTarget}
            onStatus={changePoseStatus}
            onNavigate={setView}
          />
        ) : (
          <LegacyView
            assets={legacyAssets}
            messages={legacyMessages}
            poses={poses}
            derived={derived}
            onImported={reload}
          />
        )}
      </main>

      {lineTarget && (
        <LineEditor
          target={lineTarget}
          situations={situations}
          poses={poses}
          onClose={() => setLineTarget(null)}
          onSaved={afterSave}
        />
      )}

      {poseTarget && (
        <PoseEditor
          pose={poseTarget === 'new' ? null : poseTarget}
          linkedLines={poseTarget === 'new' ? [] : derived.linesByPose.get(poseTarget.id) ?? []}
          situationByKey={derived.situationByKey}
          legacyPaths={derived.legacyPaths}
          onClose={() => setPoseTarget(null)}
          onSaved={afterSave}
          onAddLine={(pose) => {
            setPoseTarget(null);
            setView('cards');
            setLineTarget({ mode: 'new', preset: { pose_id: pose.id } });
          }}
        />
      )}
    </div>
  );
}
