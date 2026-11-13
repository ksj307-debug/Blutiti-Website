import { loginSchema } from "@/lib/mypage-schemas";
import { ipHash, setMypageSession } from "@/lib/mypage-session";
import { MSG, fail, json, readJson } from "@/lib/mypage-http";
import { logDbError, supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/mypage/login  { name, phone4 }
 * - 이름(앞뒤 공백 제거) + 전화번호 뒷 4자리가 같고, 보관 기간(expires_at)이 남았고, 취소되지 않은 예약
 * - 찾으면 세션 쿠키(예약번호 목록, 2시간) 발급
 * - 못 찾으면 무엇이 틀렸는지 구분하지 않고 한 가지 메시지
 * - 시도 제한: IP 해시 기준 10분 안에 5회 실패하면 429. 하루 지난 기록은 정리
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 5;
const KEEP_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(400, "이름과 휴대폰 번호 뒷 4자리를 확인해 주세요");
  const { name, phone4 } = parsed.data;

  const db = supabaseServer();
  const now = Date.now();
  const hash = ipHash(request);

  // 하루 지난 시도 기록 정리 → 최근 10분 실패 횟수 확인
  const cleanup = await db.from("login_attempts").delete().lt("attempted_at", new Date(now - KEEP_MS).toISOString());
  if (cleanup.error) logDbError("login_attempts 정리", cleanup.error);

  const recent = await db
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", hash)
    .gte("attempted_at", new Date(now - WINDOW_MS).toISOString());
  if (recent.error) {
    logDbError("login_attempts 조회", recent.error);
    return fail(500, MSG.server);
  }
  if ((recent.count ?? 0) >= MAX_FAILS) return fail(429, MSG.tooMany);

  const found = await db.from("bookings").select("booking_no, naver_status, expires_at").eq("name", name).eq("phone_last4", phone4);
  if (found.error) {
    logDbError("bookings 조회", found.error);
    return fail(500, MSG.server);
  }

  // 보관 기간이 지났거나(expires_at 이 지금보다 이전) 취소된 예약은 제외. expires_at 이 비어 있으면 아직 유효로 봄
  const bookingNos = (found.data ?? [])
    .filter((b) => !b.expires_at || new Date(b.expires_at).getTime() > now)
    .filter((b) => !(b.naver_status ?? "").includes("취소"))
    .map((b) => b.booking_no as string);

  if (bookingNos.length === 0) {
    const logged = await db.from("login_attempts").insert({ ip_hash: hash });
    if (logged.error) logDbError("login_attempts 기록", logged.error);
    return fail(401, MSG.notFound);
  }

  await setMypageSession(bookingNos);
  return json({ ok: true, count: bookingNos.length });
}
