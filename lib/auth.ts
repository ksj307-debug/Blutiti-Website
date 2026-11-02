import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * 회원가입 없는 예약 조회 로그인 (이메일 + 휴대폰 뒷 4자리)
 * - 같은 이메일 5회 연속 실패 → 10분 조회 제한
 * - 로그인 상태 30분 유지
 * 주의: 세션·실패 횟수를 서버 메모리에 보관하는 미리보기 구현. 서버 재시작 시 초기화되고
 *       서버가 여러 대면 공유되지 않으므로, 운영 배포 전 DB·Redis 등 공유 저장소로 교체
 */
export const SESSION_COOKIE = "bt_session";
export const SESSION_MS = 30 * 60 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

type Session = { email: string; last4: string; expiresAt: number };
type Attempt = { fails: number; lockedUntil: number };

const sessions = new Map<string, Session>();
const attempts = new Map<string, Attempt>();

const key = (email: string) => email.trim().toLowerCase();

/** 남은 잠금 시간(ms). 잠기지 않았으면 0 */
export function lockRemaining(email: string, now = Date.now()) {
  const a = attempts.get(key(email));
  return a && a.lockedUntil > now ? a.lockedUntil - now : 0;
}

/** 실패 1회 기록. 5회째면 10분 잠금 */
export function recordFailure(email: string, now = Date.now()) {
  const a = attempts.get(key(email)) ?? { fails: 0, lockedUntil: 0 };
  a.fails += 1;
  if (a.fails >= MAX_FAILS) {
    a.fails = 0;
    a.lockedUntil = now + LOCK_MS;
  }
  attempts.set(key(email), a);
}

export function clearFailures(email: string) {
  attempts.delete(key(email));
}

export async function startSession(email: string, last4: string) {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + SESSION_MS;
  sessions.set(token, { email: key(email), last4, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

/** 유효한 세션. 없거나 만료면 null */
export async function getSession(): Promise<Session | null> {
  // 만료 판단(Date.now)은 요청 시점에만 → 프리렌더 대상에서 제외
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return s;
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) sessions.delete(token);
  store.delete(SESSION_COOKIE);
}
