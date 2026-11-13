import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * 마이페이지 로그인 세션 (서버 전용)
 * - 쿠키: httpOnly · secure · sameSite=lax · 2시간. 값 = SESSION_SECRET 으로 서명한 JWT(HS256)
 * - 쿠키 안에는 예약번호(booking_no) 목록만 저장 (이름·전화번호 없음)
 * 예전 미리보기 로그인(lib/auth.ts, 쿠키 bt_session)과는 별개
 */
export const MYPAGE_COOKIE = "bt_mypage";
export const MYPAGE_SESSION_SECONDS = 2 * 60 * 60;

function secretBytes() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET 환경변수가 없거나 너무 짧아요");
  return new TextEncoder().encode(s);
}

/** 예약번호 목록으로 세션 쿠키 발급 */
export async function setMypageSession(bookingNos: string[]) {
  const token = await new SignJWT({ bn: bookingNos })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MYPAGE_SESSION_SECONDS}s`)
    .sign(secretBytes());
  (await cookies()).set({
    name: MYPAGE_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MYPAGE_SESSION_SECONDS,
  });
}

/** 세션 쿠키의 예약번호 목록. 없거나 만료·위조면 null */
export async function getMypageSession(): Promise<string[] | null> {
  const token = (await cookies()).get(MYPAGE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretBytes(), { algorithms: ["HS256"] });
    const bn = payload.bn;
    if (!Array.isArray(bn) || bn.length === 0 || !bn.every((v) => typeof v === "string")) return null;
    return bn as string[];
  } catch {
    return null;
  }
}

export async function clearMypageSession() {
  (await cookies()).set({ name: MYPAGE_COOKIE, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

/**
 * 요청한 기기의 IP → 해시 (login_attempts.ip_hash). IP 원문은 저장하지 않음
 * Vercel 은 x-forwarded-for 첫 값이 실제 접속 IP
 */
export function ipHash(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return createHmac("sha256", secretBytes()).update(ip).digest("hex");
}
