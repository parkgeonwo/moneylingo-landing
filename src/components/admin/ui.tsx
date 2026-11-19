'use client';

import { useEffect } from 'react';
import { SAMPLE_VARS, STATUS_LABEL, type ContentStatus } from '@/lib/admin/types';

const STATUS_STYLE: Record<ContentStatus, string> = {
  draft: 'bg-amber-100 text-amber-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** {변수}를 샘플 값으로 바꿔 보여줌 (치환된 부분은 강조) */
export function RenderedLine({ text }: { text: string }) {
  const parts = text.split(/(\{[a-z_]+\})/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{([a-z_]+)\}$/);
        if (!match) return <span key={i}>{part}</span>;
        const value = SAMPLE_VARS[match[1]];
        return (
          <mark key={i} className="rounded bg-emerald-100 px-0.5 text-emerald-900">
            {value ?? part}
          </mark>
        );
      })}
    </>
  );
}

export function PoseImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // 외부(Supabase Storage) 이미지라 next/image 최적화 대신 일반 img 사용
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`object-contain ${className ?? ''}`} />
  );
}

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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative w-full rounded-2xl bg-white shadow-xl ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="닫기">
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
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="ml-2 text-xs text-gray-400">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500';

export const primaryButton =
  'rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50';

export const secondaryButton =
  'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50';

export const dangerButton =
  'rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50';

/** 앱 화면 느낌의 간단한 미리보기 (실제 앱 레이아웃과 다를 수 있음) */
export function PhonePreview({ imageUrl, text }: { imageUrl?: string; text: string }) {
  return (
    <div className="mx-auto w-[220px]">
      <div className="aspect-[9/19] overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-gradient-to-b from-emerald-200 to-emerald-50">
        <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
          <div className="w-full rounded-xl bg-white/95 px-3 py-2.5 text-center text-[13px] leading-snug text-gray-900 shadow-sm">
            {text ? <RenderedLine text={text} /> : <span className="text-gray-400">멘트를 입력하세요</span>}
          </div>
          {imageUrl ? (
            <PoseImage src={imageUrl} alt="포즈 미리보기" className="h-36 w-36" />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 text-xs text-emerald-700">
              포즈 선택
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">미리보기 · 실제 앱과 다를 수 있음</p>
    </div>
  );
}
