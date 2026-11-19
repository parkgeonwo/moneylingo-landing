'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchAll } from '@/lib/admin/api';
import type { Line, Pose, Situation } from '@/lib/admin/types';
import LinesPanel from './LinesPanel';
import PosesPanel from './PosesPanel';
import LineEditor, { type LineEditorTarget } from './LineEditor';
import PoseEditor from './PoseEditor';

type Tab = 'lines' | 'poses';

export default function AdminDashboard({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [tab, setTab] = useState<Tab>('lines');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lineTarget, setLineTarget] = useState<LineEditorTarget | null>(null);
  const [poseTarget, setPoseTarget] = useState<Pose | 'new' | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await fetchAll();
      setSituations(data.situations);
      setPoses(data.poses);
      setLines(data.lines);
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

  const afterSave = async () => {
    setLineTarget(null);
    setPoseTarget(null);
    await reload();
  };

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-bold">지갑교관 콘텐츠 관리</span>
            <nav className="flex gap-1">
              {(
                [
                  ['lines', `멘트 카드 ${lines.length}`],
                  ['poses', `포즈 이미지 ${poses.length}`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    tab === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={onSignOut} className="text-sm text-gray-500 hover:text-gray-900">
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={reload} className="font-medium underline">
              다시 시도
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">불러오는 중…</p>
        ) : tab === 'lines' ? (
          <LinesPanel
            situations={situations}
            poses={poses}
            lines={lines}
            onCreate={(preset) => setLineTarget({ mode: 'new', preset })}
            onEdit={(line) => setLineTarget({ mode: 'edit', line })}
          />
        ) : (
          <PosesPanel
            poses={poses}
            lines={lines}
            onCreate={() => setPoseTarget('new')}
            onEdit={(pose) => setPoseTarget(pose)}
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
          linkedLineCount={
            poseTarget === 'new' ? 0 : lines.filter((l) => l.pose_id === poseTarget.id).length
          }
          onClose={() => setPoseTarget(null)}
          onSaved={afterSave}
          onAddLine={(pose) => {
            setPoseTarget(null);
            setTab('lines');
            setLineTarget({ mode: 'new', preset: { pose_id: pose.id } });
          }}
        />
      )}
    </div>
  );
}
