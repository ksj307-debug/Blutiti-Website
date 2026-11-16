import { timingSafeEqual } from "node:crypto";
import { logDbError, supabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/cron/keepalive
 * - Supabase 무료 플랜이 오래 안 쓰여 일시 중지되지 않게 하루 1번 가벼운 조회 (vercel.json crons)
 * - 평소엔 구글 시트 동기화가 DB 를 쓰지만, 동기화가 멈췄을 때를 대비한 안전장치
 * - Authorization: Bearer ${CRON_SECRET} 가 아니면 401 (Vercel Cron 이 이 헤더를 자동으로 붙임)
 * - bookings 에서 booking_no 1건만 읽고 { ok: true } 만 반환 (개인정보 반환 없음)
 */
const NO_STORE = { "Cache-Control": "no-store" };

function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ ok: false }, { status: 401, headers: NO_STORE });
  }
  const { error } = await supabaseServer().from("bookings").select("booking_no").limit(1);
  if (error) {
    logDbError("keepalive 조회", error);
    return Response.json({ ok: false }, { status: 500, headers: NO_STORE });
  }
  return Response.json({ ok: true }, { headers: NO_STORE });
}
