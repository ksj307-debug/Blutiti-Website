import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트 (마이페이지 API)
 * - SUPABASE_SECRET_KEY(service_role)로 접속. RLS 를 거치지 않으므로 반드시 서버 코드에서만 사용
 *   → 'server-only' 를 import 해서 클라이언트 코드가 이 파일을 불러오면 빌드 오류가 나게 함
 * - 키는 NEXT_PUBLIC_ 이 아닌 환경변수(.env.local, Vercel)에서만 읽음. 값은 로그에 남기지 않음
 * - DB 구조: supabase/migrations/001_init.sql (bookings · responses · login_attempts)
 */
let client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL 또는 SUPABASE_SECRET_KEY 환경변수가 없어요");
  client = createClient(url, key, {
    // 서버에서 키로만 접근: 로그인 세션 저장·토큰 갱신 끔
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

/** DB 오류를 고객 정보 없이 로그로 (오류 message·details 에는 행 값이 섞일 수 있어 code 만) */
export function logDbError(where: string, error: { code?: string } | null | undefined) {
  console.error(`[mypage] ${where} DB 오류${error?.code ? ` (${error.code})` : ""}`);
}
