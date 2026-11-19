'use client';

import { useMemo, useState } from 'react';
import { assetUrl } from '@/lib/admin/api';
import { STATUS_LABEL, type ContentStatus, type Pose } from '@/lib/admin/types';
import type { Derived, View } from './AdminDashboard';
import { EmptyState, PoseImage, StatusSwitch, filterClass, primaryButton, secondaryButton } from './ui';

interface PosesViewProps {
  poses: Pose[];
  derived: Derived;
  onCreate: () => void;
  onEdit: (pose: Pose) => void;
  onStatus: (id: string, status: ContentStatus) => Promise<void>;
  onNavigate: (view: View) => void;
}

export default function PosesView({ poses, derived, onCreate, onEdit, onStatus, onNavigate }: PosesViewProps) {
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poses.filter(
      (p) =>
        (status === 'all' || p.status === status) &&
        (!q ||
          p.pose_key.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.description?.toLowerCase().includes(q))
    );
  }, [poses, status, query]);

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">포즈 이미지</h1>
          <p className="mt-1 text-sm text-ink-soft">AI로 만든 캐릭터 이미지예요. 한 장에 여러 멘트를 연결할 수 있어요.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('legacy')} className={secondaryButton}>
            기존 이미지 가져오기
          </button>
          <button onClick={onCreate} className={primaryButton}>
            포즈 올리기
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
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
          placeholder="이름, 태그, 설명으로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${filterClass} w-60`}
        />
        <span className="ml-auto text-sm text-ink-muted">{visible.length}장</span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          text={poses.length === 0 ? 'AI로 만든 캐릭터 이미지를 올리거나, 현재 앱 이미지를 가져와서 시작하세요.' : '조건에 맞는 포즈가 없어요.'}
          action={
            poses.length === 0 && (
              <button onClick={() => onNavigate('legacy')} className={secondaryButton}>
                현재 앱 이미지 보기
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {visible.map((pose) => {
            const linked = derived.linesByPose.get(pose.id) ?? [];
            const live = linked.filter((l) => l.status === 'active').length;
            return (
              <div
                key={pose.id}
                className={`overflow-hidden rounded-2xl bg-white ring-1 ring-line hover:ring-ink-muted ${
                  pose.status === 'archived' ? 'opacity-55' : ''
                }`}
              >
                <button
                  onClick={() => onEdit(pose)}
                  aria-label={`${pose.pose_key} 수정`}
                  className="block aspect-square w-full bg-mint-pale p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mint-strong"
                >
                  <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
                </button>
                <div className="space-y-2 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold" title={pose.pose_key}>
                      {pose.pose_key}
                    </p>
                    <span
                      className={`shrink-0 text-xs ${linked.length === 0 ? 'text-caution' : 'text-ink-muted'}`}
                      title={`공개 멘트 ${live}개`}
                    >
                      멘트 {linked.length}
                    </span>
                  </div>
                  {pose.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pose.tags.slice(0, 3).map((t) => (
                        <span key={t} className="rounded bg-paper px-1.5 py-0.5 text-[11px] text-ink-soft">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <StatusSwitch value={pose.status} onChange={(next) => onStatus(pose.id, next)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
