'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/admin/api';

type GateState = 'loading' | 'signedOut' | 'notAdmin' | 'admin';

interface AuthGateProps {
  children: (signOut: () => Promise<void>) => React.ReactNode;
}

/**
 * 관리자 로그인 게이트
 * 화면 차단은 편의용이고, 실제 데이터 보호는 DB의 RLS(is_admin)가 담당
 */
export default function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<GateState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolveSession = useCallback(async (hasSession: boolean) => {
    if (!hasSession) {
      setState('signedOut');
      return;
    }
    try {
      setState((await checkIsAdmin()) ? 'admin' : 'notAdmin');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('signedOut');
    }
  }, []);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => resolveSession(!!data.session));
    const { data: sub } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') setState('signedOut');
      if (event === 'SIGNED_IN') resolveSession(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, [resolveSession]);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setState('signedOut');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: loginError } = await getSupabase().auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (loginError) setError(`로그인 실패: ${loginError.message}`);
  };

  if (state === 'admin') return <>{children(signOut)}</>;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold">지갑교관 콘텐츠 관리</h1>
        <p className="mt-1 text-sm text-gray-500">관리자 전용 페이지입니다.</p>

        {state === 'loading' && <p className="mt-6 text-sm text-gray-500">확인 중…</p>}

        {state === 'notAdmin' && (
          <div className="mt-6 space-y-3">
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              이 계정은 관리자로 등록되어 있지 않습니다.
            </p>
            <button
              onClick={signOut}
              className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        )}

        {state === 'signedOut' && (
          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? '로그인 중…' : '로그인'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
