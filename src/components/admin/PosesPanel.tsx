'use client';

import { useMemo, useState } from 'react';
import { assetUrl } from '@/lib/admin/api';
import { STATUS_LABEL, type ContentStatus, type Line, type Pose } from '@/lib/admin/types';
import { PoseImage, StatusBadge, inputClass, primaryButton } from './ui';

interface PosesPanelProps {
  poses: Pose[];
  lines: Line[];
  onCreate: () => void;
  onEdit: (pose: Pose) => void;
}

export default function PosesPanel({ poses, lines, onCreate, onEdit }: PosesPanelProps) {
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const lineCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of lines) counts.set(l.pose_id, (counts.get(l.pose_id) ?? 0) + 1);
    return counts;
  }, [lines]);

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
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
          placeholder="이름·태그·설명 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} w-56`}
        />
        <button onClick={onCreate} className={`${primaryButton} ml-auto`}>
          + 포즈 올리기
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">
          {poses.length === 0 ? 'AI로 만든 캐릭터 이미지를 올려보세요.' : '조건에 맞는 포즈가 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {visible.map((pose) => (
            <button
              key={pose.id}
              onClick={() => onEdit(pose)}
              className={`rounded-xl border border-gray-200 bg-white p-2 text-left transition hover:border-gray-400 ${
                pose.status === 'archived' ? 'opacity-60' : ''
              }`}
            >
              <div className="aspect-square rounded-lg bg-gray-50">
                <PoseImage src={assetUrl(pose.storage_path)} alt={pose.pose_key} className="h-full w-full" />
              </div>
              <p className="mt-2 truncate font-mono text-xs">{pose.pose_key}</p>
              <div className="mt-1 flex items-center justify-between">
                <StatusBadge status={pose.status} />
                <span className="text-xs text-gray-500">멘트 {lineCount.get(pose.id) ?? 0}</span>
              </div>
              {pose.tags.length > 0 && (
                <p className="mt-1 truncate text-xs text-gray-400">{pose.tags.join(', ')}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
