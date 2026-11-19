'use client';

import { useEffect, useState } from 'react';
import { SAMPLE_VARS, STATUS_LABEL, type ContentStatus } from '@/lib/admin/types';

// ---------- 버튼/입력 스타일 ----------

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-strong';

/** 필터용 (너비는 쓰는 곳에서 지정) */
export const filterClass = `rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-mint-strong`;

/** 폼 입력용 (가로 꽉 채움) */
export const inputClass = `w-full ${filterClass}`;

export const primaryButton = `rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-40 ${focusRing}`;

export const secondaryButton = `rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink-muted disabled:opacity-40 ${focusRing}`;

export const dangerButton = `rounded-lg px-4 py-2 text-sm font-medium text-alarm hover:bg-alarm-pale disabled:opacity-40 ${focusRing}`;

// ---------- 상태 ----------

const STATUS_DOT: Record<ContentStatus, string> = {
  draft: 'bg-caution',
  active: 'bg-mint-strong',
  archived: 'bg-ink-muted',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const SWITCH_ACTIVE: Record<ContentStatus, string> = {
  draft: 'bg-caution-pale text-caution',
  active: 'bg-mint-strong text-white',
  archived: 'bg-line text-ink-soft',
};

/** 목록에서 바로 상태를 바꾸는 3단 스위치 */
export function StatusSwitch({
  value,
  onChange,
  size = 'sm',
}: {
  value: ContentStatus;
  onChange: (next: ContentStatus) => Promise<void>;
  size?: 'sm' | 'md';
}) {
  const [pending, setPending] = useState<ContentStatus | null>(null);
  const shown = pending ?? value;

  const pick = async (next: ContentStatus) => {
    if (next === value || pending) return;
    setPending(next);
    try {
      await onChange(next);
    } finally {
      setPending(null);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="상태"
      className={`inline-flex rounded-full border border-line bg-white p-0.5 ${pending ? 'opacity-60' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {(Object.keys(STATUS_LABEL) as ContentStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={shown === s}
          onClick={() => pick(s)}
          className={`rounded-full font-medium transition-colors ${focusRing} ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
          } ${shown === s ? SWITCH_ACTIVE[s] : 'text-ink-muted hover:text-ink'}`}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

// ---------- 멘트/이미지 ----------

/** {변수}를 샘플 값으로 바꿔 보여줌 (치환된 부분은 밑줄로 표시) */
export function RenderedLine({ text }: { text: string }) {
  const parts = text.split(/(\{[a-z_]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{([a-z_]+)\}$/);
        if (!match) return <span key={i}>{part}</span>;
        return (
          <span
            key={i}
            title={part}
            className="underline decoration-mint-strong decoration-2 underline-offset-[3px]"
          >
            {SAMPLE_VARS[match[1]] ?? part}
          </span>
        );
      })}
    </>
  );
}

/** 앱 화면처럼 말풍선 (아래쪽 꼬리) */
export function SpeechBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`relative rounded-2xl bg-white px-3.5 py-2.5 text-[13px] leading-snug text-ink ${className ?? ''}`}>
      {text ? <RenderedLine text={text} /> : <span className="text-ink-muted">멘트를 입력하세요</span>}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
    </div>
  );
}

export function PoseImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // 외부(Supabase Storage) 이미지라 next/image 최적화 대신 일반 img 사용
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`object-contain ${className ?? ''}`} />
  );
}

/** 멘트만 쓰는 상황 표시 (앱은 고정 얼굴 아이콘을 씀) */
export function TextOnlyMark({ compact }: { compact?: boolean }) {
  return compact ? (
    <span className="flex h-full w-full items-center justify-center rounded-lg bg-paper text-[10px] leading-tight text-ink-muted">
      멘트만
    </span>
  ) : (
    <span className="flex h-28 w-full flex-col items-center justify-center gap-1 text-center text-xs text-ink-muted">
      <span className="font-semibold text-ink-soft">멘트만 쓰는 상황</span>
      <span>앱은 고정 얼굴 아이콘을 보여줘요</span>
    </span>
  );
}

/** 큰 숫자 */
export function Figure({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`font-extrabold tabular-nums leading-none tracking-tight ${className ?? ''}`}>
      {value}
    </span>
  );
}

// ---------- 레이아웃 ----------

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full rounded-2xl bg-white ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`rounded-md px-2 text-ink-muted hover:text-ink ${focusRing}`}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center text-sm text-ink-soft">
      <p>{text}</p>
      {action}
    </div>
  );
}

/** 앱 화면 느낌의 미리보기 (실제 앱 레이아웃과 다를 수 있음) */
export function PhonePreview({ imageUrl, text, textOnly }: { imageUrl?: string; text: string; textOnly?: boolean }) {
  return (
    <div className="mx-auto w-[220px]">
      <div className="aspect-[9/19] overflow-hidden rounded-[2rem] border-[6px] border-ink bg-mint-pale">
        <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
          <SpeechBubble text={text} className="w-full text-center" />
          {textOnly ? (
            <TextOnlyMark />
          ) : imageUrl ? (
            <PoseImage src={imageUrl} alt="포즈 미리보기" className="h-36 w-36" />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-mint text-xs text-mint-dark">
              포즈를 고르세요
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-ink-muted">실제 앱 화면과 조금 다를 수 있어요</p>
    </div>
  );
}
