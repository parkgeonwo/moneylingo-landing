import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** 사용자가 KR/JP 토글로 고른 언어 (Header.tsx의 LocaleToggle이 저장) */
export const LOCALE_COOKIE = 'locale';

/** Accept-Language에서 가장 선호하는 언어 (예: "ja-JP,ja;q=0.9,en;q=0.8" → "ja") */
function preferredLanguage(header: string | null): string | null {
  if (!header) return null;
  const langs = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((l) => l.lang && !Number.isNaN(l.q))
    .sort((a, b) => b.q - a.q);
  return langs[0]?.lang ?? null;
}

/**
 * 일본어 브라우저로 첫 화면(/)에 오면 /ja로 보냄
 * - 토글로 언어를 직접 고른 적이 있으면(쿠키) 그 선택을 따름
 * - 인스타·스레드 링크의 utm 등 쿼리는 그대로 유지
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(LOCALE_COOKIE)) return NextResponse.next();
  if (preferredLanguage(request.headers.get('accept-language')) !== 'ja') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/ja';
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: '/',
};
