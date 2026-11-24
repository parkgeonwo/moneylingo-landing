'use client';

import { useMemo, useState } from 'react';
import { updateFeedback } from '@/lib/admin/api';
import { FEEDBACK_STATUS_LABEL, type FeedbackStatus, type UserFeedback } from '@/lib/admin/types';
import { EmptyState, filterClass, inputClass, secondaryButton } from './ui';

interface FeedbackViewProps {
  feedbacks: UserFeedback[];
  onChanged: (next: UserFeedback) => void;
}

type Tab = FeedbackStatus | 'all';
const TABS: Tab[] = ['new', 'checked', 'done', 'wont_fix', 'all'];
const STATUSES: FeedbackStatus[] = ['new', 'checked', 'done', 'wont_fix'];

/** 상태 버튼 색: 선택됐을 때 */
const STATUS_ACTIVE: Record<FeedbackStatus, string> = {
  new: 'bg-alarm text-white',
  checked: 'bg-caution-pale text-caution',
  done: 'bg-mint-strong text-white',
  wont_fix: 'bg-line text-ink-soft',
};

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function deviceText(f: UserFeedback): string {
  const os = f.platform === 'ios' ? 'iOS' : f.platform === 'android' ? 'Android' : null;
  const version = f.app_version ? `v${f.app_version}` : null;
  return [os, version].filter(Boolean).join(' ') || '버전 정보 없음';
}

export default function FeedbackView({ feedbacks, onChanged }: FeedbackViewProps) {
  const [tab, setTab] = useState<Tab>('new');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { new: 0, checked: 0, done: 0, wont_fix: 0, all: feedbacks.length };
    for (const f of feedbacks) c[f.status] += 1;
    return c;
  }, [feedbacks]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedbacks.filter(
      (f) =>
        (tab === 'all' || f.status === tab) &&
        (!q ||
          f.content.toLowerCase().includes(q) ||
          f.nickname_at_submit?.toLowerCase().includes(q) ||
          f.admin_note?.toLowerCase().includes(q))
    );
  }, [feedbacks, tab, query]);

  const save = async (f: UserFeedback, patch: { status: FeedbackStatus; admin_note: string | null }) => {
    setError(null);
    try {
      const { resolved_at } = await updateFeedback(f.id, patch);
      onChanged({ ...f, ...patch, resolved_at });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">고객 문의</h1>
        <p className="mt-1 text-sm text-ink-soft">
          앱 마이페이지 &quot;의견 남기기&quot;로 들어온 문의예요. 새 문의는 슬랙으로도 알림이 가요.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="처리 상태" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                tab === t ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
              }`}
            >
              {t === 'all' ? '전체' : FEEDBACK_STATUS_LABEL[t]}
              <span className="ml-1 tabular-nums opacity-70">{counts[t]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="내용·닉네임·메모 검색"
          aria-label="문의 검색"
          className={`${filterClass} w-full sm:w-64`}
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-alarm-pale p-3 text-sm text-alarm">{error}</p>}

      {visible.length === 0 ? (
        <EmptyState text={tab === 'new' ? '새 문의가 없어요.' : '해당하는 문의가 없어요.'} />
      ) : (
        <ul className="space-y-3">
          {visible.map((f) => (
            <FeedbackItem key={f.id} feedback={f} onSave={(patch) => save(f, patch)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedbackItem({
  feedback: f,
  onSave,
}: {
  feedback: UserFeedback;
  onSave: (patch: { status: FeedbackStatus; admin_note: string | null }) => Promise<void>;
}) {
  const [note, setNote] = useState(f.admin_note ?? '');
  const [saving, setSaving] = useState(false);
  const noteChanged = (note.trim() || null) !== (f.admin_note ?? null);

  const run = async (patch: { status: FeedbackStatus; admin_note: string | null }) => {
    setSaving(true);
    await onSave(patch);
    setSaving(false);
  };

  return (
    <li className="rounded-xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>
          <span className="font-semibold text-ink">{f.nickname_at_submit ?? '알 수 없음'}</span>
          <span className="mx-1.5 text-line">|</span>
          {deviceText(f)}
          <span className="mx-1.5 text-line">|</span>
          {dateFormat.format(new Date(f.created_at))}
        </span>
        {f.resolved_at && <span>처리 {dateFormat.format(new Date(f.resolved_at))}</span>}
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{f.content}</p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="처리 상태">
        {STATUSES.map((s) => {
          const selected = f.status === s;
          return (
            <button
              key={s}
              role="radio"
              aria-checked={selected}
              disabled={saving}
              onClick={() => !selected && run({ status: s, admin_note: f.admin_note })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                selected ? STATUS_ACTIVE[s] : 'bg-paper text-ink-soft hover:text-ink'
              }`}
            >
              {FEEDBACK_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-2">
        <textarea
          rows={1}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="처리 메모 (예: 1.2.1에서 수정, 답장 보냄)"
          aria-label="처리 메모"
          className={`${inputClass} min-h-[38px] resize-y`}
        />
        <button
          onClick={() => run({ status: f.status, admin_note: note.trim() || null })}
          disabled={!noteChanged || saving}
          className={`${secondaryButton} shrink-0`}
        >
          메모 저장
        </button>
      </div>
    </li>
  );
}
