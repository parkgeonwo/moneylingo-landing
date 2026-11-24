'use client';

import { useMemo, useState } from 'react';
import { notifySuggestionAdopted, setSuggestionStatus } from '@/lib/admin/api';
import {
  SUGGESTION_HINT_DEFAULT_SITUATION,
  SUGGESTION_HINT_LABEL,
  SUGGESTION_STATUS_LABEL,
  type Line,
  type LineSuggestion,
  type SuggestionStatus,
} from '@/lib/admin/types';
import type { Derived } from './AdminDashboard';
import { EmptyState, StatusBadge, dangerButton, primaryButton, secondaryButton } from './ui';

interface SuggestionsViewProps {
  suggestions: LineSuggestion[];
  lines: Line[];
  derived: Derived;
  /** 추천을 다듬어 채택: 멘트 추가 창을 추천 내용으로 채워서 엶 */
  onAdopt: (suggestion: LineSuggestion, situationKey: string | null) => void;
  onEditLine: (line: Line) => void;
  onChanged: (next: LineSuggestion) => void;
}

const TABS: SuggestionStatus[] = ['pending', 'adopted', 'rejected'];

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function SuggestionsView({
  suggestions,
  lines,
  derived,
  onAdopt,
  onEditLine,
  onChanged,
}: SuggestionsViewProps) {
  const [tab, setTab] = useState<SuggestionStatus>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const lineById = useMemo(() => new Map(lines.map((l) => [l.id, l])), [lines]);
  const counts = useMemo(() => {
    const c: Record<SuggestionStatus, number> = { pending: 0, adopted: 0, rejected: 0 };
    for (const s of suggestions) c[s.status] += 1;
    return c;
  }, [suggestions]);
  const visible = suggestions.filter((s) => s.status === tab);

  /** 사용자가 고른 상황 → 카드 상황 기본값 */
  const situationFor = (s: LineSuggestion) =>
    s.situation_key ?? (s.situation_hint ? SUGGESTION_HINT_DEFAULT_SITUATION[s.situation_hint] : null);

  const situationText = (s: LineSuggestion) => {
    if (s.situation_key) {
      return derived.situationByKey.get(s.situation_key)?.label ?? s.situation_key;
    }
    return `직접 고름 · ${s.situation_hint ? SUGGESTION_HINT_LABEL[s.situation_hint] : '없음'}`;
  };

  const changeStatus = async (s: LineSuggestion, status: 'pending' | 'rejected') => {
    setBusyId(s.id);
    setMessage(null);
    try {
      await setSuggestionStatus(s.id, status);
      onChanged({ ...s, status, reviewed_at: status === 'pending' ? null : new Date().toISOString() });
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusyId(null);
    }
  };

  const notify = async (s: LineSuggestion) => {
    setBusyId(s.id);
    setMessage(null);
    try {
      const result = await notifySuggestionAdopted(s.id);
      if (result === 'sent') {
        onChanged({ ...s, notified_at: new Date().toISOString() });
        setMessage({ tone: 'ok', text: `${s.nickname_at_submit ?? '추천자'}님에게 채택 알림을 보냈어요.` });
      } else {
        setMessage({ tone: 'error', text: '이 사용자는 앱 알림을 꺼둬서 보내지 않았어요.' });
      }
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">추천 멘트</h1>
        <p className="mt-1 text-sm text-ink-soft">
          사용자가 앱에서 보낸 멘트예요. 다듬어서 채택하면 카드 만들기에 이미지 없는 멘트로 들어가요.
        </p>
      </header>

      <div role="tablist" aria-label="추천 상태" className="mb-5 flex gap-2">
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
            {SUGGESTION_STATUS_LABEL[t]} <span className="ml-1 tabular-nums opacity-70">{counts[t]}</span>
          </button>
        ))}
      </div>

      {message && (
        <p
          role="status"
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.tone === 'ok' ? 'bg-mint-pale text-ink' : 'bg-alarm-pale text-alarm'
          }`}
        >
          {message.text}
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState
          text={
            tab === 'pending'
              ? '검토할 추천이 없어요. 앱의 말풍선 아래나 마이페이지에서 추천이 들어와요.'
              : `${SUGGESTION_STATUS_LABEL[tab]}한 추천이 없어요.`
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((s) => {
            const line = s.adopted_line_id ? lineById.get(s.adopted_line_id) : undefined;
            const lineLive = line ? derived.isLineLive(line) : false;
            const busy = busyId === s.id;
            return (
              <li key={s.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-ink break-keep">“{s.line_text}”</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {situationText(s)}
                      <span className="mx-1.5 text-line">|</span>
                      {s.nickname_at_submit ?? '알 수 없음'}
                      {s.show_credit ? ' (닉네임 표시 동의)' : ' (닉네임 표시 안 함)'}
                      <span className="mx-1.5 text-line">|</span>
                      {dateFormat.format(new Date(s.created_at))}
                    </p>
                    {s.shown_line_text && (
                      <p className="mt-1 text-xs text-ink-muted">그때 교관 멘트: “{s.shown_line_text}”</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => changeStatus(s, 'rejected')}
                          disabled={busy}
                          className={dangerButton}
                        >
                          반려
                        </button>
                        <button onClick={() => onAdopt(s, situationFor(s))} disabled={busy} className={primaryButton}>
                          다듬어서 채택
                        </button>
                      </>
                    )}
                    {s.status === 'rejected' && (
                      <button onClick={() => changeStatus(s, 'pending')} disabled={busy} className={secondaryButton}>
                        검토 대기로 되돌리기
                      </button>
                    )}
                  </div>
                </div>

                {s.status === 'adopted' && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper px-3 py-2">
                    {line ? (
                      <button
                        onClick={() => onEditLine(line)}
                        className="min-w-0 text-left text-sm hover:underline focus-visible:outline-2 focus-visible:outline-ink"
                      >
                        <span className="mr-2 text-ink-soft">채택 멘트</span>
                        <span className="font-medium text-ink">{line.line_text}</span>
                        <span className="ml-2 inline-block align-middle">
                          {lineLive ? (
                            <span className="text-xs font-medium text-mint-strong">앱에 나오는 중</span>
                          ) : (
                            <StatusBadge status={line.status} />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span className="text-sm text-ink-muted">연결된 멘트가 삭제됐어요.</span>
                    )}

                    {s.notified_at ? (
                      <span className="text-xs text-ink-soft">
                        알림 보냄 · {dateFormat.format(new Date(s.notified_at))}
                      </span>
                    ) : (
                      <button
                        onClick={() => notify(s)}
                        disabled={busy || !lineLive}
                        title={lineLive ? undefined : '이미지를 묶고 멘트와 이미지를 공개하면 보낼 수 있어요'}
                        className={secondaryButton}
                      >
                        {busy ? '보내는 중…' : lineLive ? '채택 알림 보내기' : '공개 후 알림 가능'}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
