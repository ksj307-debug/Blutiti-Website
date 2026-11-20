import { RESPONSE_MAX_CHARS, REVIEW_STAGE, REVISION_LIMIT, responseSchema, totalChars } from "@/lib/mypage-schemas";
import { getMypageSession } from "@/lib/mypage-session";
import { MSG, fail, json, readJson } from "@/lib/mypage-http";
import { logDbError, supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/mypage/responses  { booking_no, type, content }
 * - type: select { retouch_files, … } / order { items[], memo? } / inquiry { message }
 *         approve {} (보정본 이상 없음) / revision { message } (보정본 수정 요청)
 * - 세션에 없는 예약번호면 403, 글자 수 합계 2,000자 초과면 400
 * - approve·revision: 진행상태가 '보정본 확인'일 때만 (아니면 409)
 *   revision 은 예약당 REVISION_LIMIT(1)회까지, 완료(approve) 뒤에는 수정 요청·중복 완료 불가 (409)
 * - 기존 답변을 덮어쓰지 않고 새 행으로 추가 (가장 최근 행이 유효한 답변)
 */
export async function POST(request: Request) {
  const bookingNos = await getMypageSession();
  if (!bookingNos) return fail(401, MSG.unauthorized);

  const parsed = responseSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(400, MSG.badRequest);
  const { booking_no, type, content } = parsed.data;

  if (!bookingNos.includes(booking_no)) return fail(403, MSG.forbidden);
  if (totalChars(content) > RESPONSE_MAX_CHARS) return fail(400, MSG.tooLong);

  const db = supabaseServer();

  if (type === "approve" || type === "revision") {
    const booking = await db.from("bookings").select("progress").eq("booking_no", booking_no).maybeSingle();
    if (booking.error) {
      logDbError("bookings 진행상태 조회", booking.error);
      return fail(500, MSG.server);
    }
    if (booking.data?.progress !== REVIEW_STAGE) return fail(409, MSG.notReviewStage);

    const done = await db
      .from("responses")
      .select("type")
      .eq("booking_no", booking_no)
      .in("type", ["approve", "revision"]);
    if (done.error) {
      logDbError("보정본 확인 기록 조회", done.error);
      return fail(500, MSG.server);
    }
    const rows = done.data ?? [];
    if (rows.some((r) => r.type === "approve")) return fail(409, MSG.reviewDone);
    if (type === "revision" && rows.filter((r) => r.type === "revision").length >= REVISION_LIMIT) {
      return fail(409, MSG.revisionLimit);
    }
  }

  const inserted = await db.from("responses").insert({ booking_no, type, content }).select("created_at").single();
  if (inserted.error) {
    logDbError("responses 추가", inserted.error);
    return fail(500, MSG.server);
  }
  return json({ ok: true, created_at: inserted.data.created_at }, 201);
}
