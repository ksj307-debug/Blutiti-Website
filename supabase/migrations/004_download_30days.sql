-- =====================================================================
-- 004: expires_at = '사진 다운로드 마감일' (2026-11)
-- Supabase SQL Editor 에 붙여넣어 실행. 여러 번 실행해도 결과는 같아요.
--
-- 규칙
-- - My Page 로그인·지난 촬영 조회는 기간 제한 없음 (예약 정보는 계속 보임)
-- - 사진 다운로드만 마감일(expires_at)까지. 지나면 웹사이트가 사진 링크를 보내지 않음
-- - 비어 있으면 자동 입력: 이용일시(visit_at) + 30일 (예전 001: + 3개월)
-- - 직접 넣은 날짜는 그대로 둠
--
-- 참고: 002_photo_keep_30days.sql 을 이미 실행했다면 기존 행은 이미 + 30일이에요.
--       이 파일의 일괄 수정은 '+ 3개월 자동 값'으로 남아 있는 행만 고치므로, 그 경우 바뀌는 행이 없어요.
-- 파일 이름: 003 번은 003_add_address_message.sql 이 쓰고 있어 004 로 만듦
-- =====================================================================

begin;

comment on column public.bookings.expires_at is
  '사진 다운로드 마감일. 비어 있으면 visit_at + 30일 자동 입력. 직접 넣은 날짜는 유지. My Page 접속·조회는 이 날짜와 상관없음';

create or replace function public.bookings_fill_derived()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');
  new.phone_last4 := nullif(right(digits, 4), '');

  if new.visit_at is not null then
    if new.expires_at is null then
      -- 비어 있으면 자동 입력: 이용일시 + 30일 (예전: + 3개월)
      new.expires_at := new.visit_at + interval '30 days';
    elsif tg_op = 'UPDATE'
          and new.visit_at is distinct from old.visit_at
          and old.visit_at is not null
          and new.expires_at = old.visit_at + interval '30 days' then
      -- 이용일시가 바뀌었고 마감일이 자동 값 그대로였을 때만 다시 계산 (직접 넣은 날짜는 그대로)
      new.expires_at := new.visit_at + interval '30 days';
    end if;
  end if;

  return new;
end;
$$;

-- 함수 실행 권한은 001 과 같이 일반 사용자에게 주지 않음
revoke execute on function public.bookings_fill_derived() from public, anon, authenticated;

-- 자동 값(이용일시 + 3개월)과 같은 행만 이용일시 + 30일로. 직접 넣은 날짜는 그대로
update public.bookings
set expires_at = visit_at + interval '30 days'
where visit_at is not null
  and expires_at = visit_at + interval '3 months';

commit;

-- 확인용
-- select booking_no, visit_at, expires_at, expires_at - visit_at as 기간 from public.bookings order by visit_at desc limit 20;
