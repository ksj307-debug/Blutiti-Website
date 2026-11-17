-- =====================================================================
-- 002: 사진 보관 기간 3개월 → 30일 (2026-11)
-- Supabase SQL Editor 에 붙여넣어 실행. 여러 번 실행해도 결과는 같아요.
--
-- 1) 자동 계산 함수: expires_at = visit_at + 30일
--    - 새 예약(expires_at 비어 있음) → 이용일시 + 30일
--    - 이용일시(visit_at)가 바뀐 경우 → 다시 계산 (예전 001 은 처음 한 번만 계산)
-- 2) 이미 들어 있는 예약의 expires_at 도 이용일시 + 30일로 다시 계산
--
-- 웹사이트(/api/mypage/bookings)도 이용일시 + 30일로 보관 기간을 판단하므로,
-- 이 파일을 실행하기 전에도 화면은 30일 기준으로 보여요. DB 값을 맞추기 위한 작업이에요.
-- =====================================================================

begin;

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

  -- 사진 보관 만료: 이용일시 + 30일 (예전: + 3개월)
  if new.visit_at is not null
     and (new.expires_at is null
          or (tg_op = 'UPDATE' and new.visit_at is distinct from old.visit_at)) then
    new.expires_at := new.visit_at + interval '30 days';
  end if;

  return new;
end;
$$;

-- 함수 실행 권한은 001 과 같이 일반 사용자에게 주지 않음
revoke execute on function public.bookings_fill_derived() from public, anon, authenticated;

-- 기존 예약: 이용일시 + 30일로 다시 계산
update public.bookings
set expires_at = visit_at + interval '30 days'
where visit_at is not null
  and expires_at is distinct from visit_at + interval '30 days';

commit;

-- 확인용 (실행 후 결과에서 expires_at 이 visit_at + 30일인지 보기)
-- select booking_no, visit_at, expires_at from public.bookings order by visit_at desc limit 10;
