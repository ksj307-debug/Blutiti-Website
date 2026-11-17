import { RESPONSE_TYPES, type ResponseType } from "@/lib/mypage-schemas";
import { getMypageSession } from "@/lib/mypage-session";
import { MSG, fail, json } from "@/lib/mypage-http";
import { logDbError, supabaseServer } from "@/lib/supabase-server";
import { PHOTO_KEEP_DAYS } from "@/lib/mypage-config";

/**
 * GET /api/mypage/bookings
 * - 세션 쿠키의 예약번호로 예약 조회 (이용일시 최신순)
 * - 반환: booking_no, visit_at, product, options, progress, photo_url, expired + type 별 가장 최근 답변
 * - expired: 사진 보관 기간(이용일 + 30일) 지남 → photo_url 은 null 로 보냄
 * - 전화번호·이메일·결제금액·차량번호·이름은 반환하지 않음
 */
type Latest = { content: unknown; created_at: string } | null;

export async function GET() {
  const bookingNos = await getMypageSession();
  if (!bookingNos) return fail(401, MSG.unauthorized);

  const db = supabaseServer();
  const bookings = await db
    .from("bookings")
    .select("booking_no, visit_at, product, options, progress, photo_url, expires_at")
    .in("booking_no", bookingNos)
    .order("visit_at", { ascending: false, nullsFirst: false });
  if (bookings.error) {
    logDbError("bookings 조회", bookings.error);
    return fail(500, MSG.server);
  }

  // 같은 예약·같은 type 은 가장 최근 행만 (created_at 내림차순으로 받아 처음 나온 것)
  const responses = await db
    .from("responses")
    .select("booking_no, type, content, created_at")
    .in("booking_no", bookingNos)
    .order("created_at", { ascending: false });
  if (responses.error) {
    logDbError("responses 조회", responses.error);
    return fail(500, MSG.server);
  }
  const latest = new Map<string, Record<ResponseType, Latest>>();
  for (const r of responses.data ?? []) {
    const byType = latest.get(r.booking_no) ?? { select: null, order: null, inquiry: null };
    const type = r.type as ResponseType;
    if (RESPONSE_TYPES.includes(type) && !byType[type]) byType[type] = { content: r.content, created_at: r.created_at };
    latest.set(r.booking_no, byType);
  }

  const now = Date.now();
  return json({
    bookings: (bookings.data ?? []).map((b) => {
      // 사진 보관 기간(이용일 + PHOTO_KEEP_DAYS = 30일)이 지나면 사진 링크는 보내지 않음
      // 이용일시가 있으면 그것으로 계산 (DB expires_at 이 예전 3개월 값이어도 30일 기준), 없으면 expires_at
      const expiresAt = b.visit_at
        ? new Date(b.visit_at).getTime() + PHOTO_KEEP_DAYS * 86400e3
        : b.expires_at
          ? new Date(b.expires_at).getTime()
          : null;
      const expired = expiresAt !== null && expiresAt <= now;
      return {
        booking_no: b.booking_no,
        visit_at: b.visit_at,
        product: b.product,
        options: b.options,
        progress: b.progress,
        photo_url: expired ? null : b.photo_url,
        expired,
        responses: latest.get(b.booking_no) ?? { select: null, order: null, inquiry: null },
      };
    }),
  });
}
