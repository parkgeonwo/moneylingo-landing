import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * 브라우저용 Supabase 클라이언트 (공개 anon 키)
 * 권한은 전부 DB의 RLS 정책(is_admin)으로 제어됨 — 서비스 키는 사용하지 않음
 *
 * 처음 사용할 때 생성: 환경 변수가 없어도 랜딩 페이지 빌드는 깨지지 않게 함
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.');
  }

  client = createClient(url, anonKey);
  return client;
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
}
