-- =====================================================================
-- 006: My Page 로그인을 '이메일 + 휴대폰 뒷 4자리'로 (2026-11-28)
-- 네이버 예약 정책 변경으로 예약자 이름을 받을 수 없게 됨
--   1) bookings.name(예약자)을 비워도 저장되게 (NOT NULL 해제). 이미 있는 이름은 그대로
--   2) 로그인 조회용 인덱스: 휴대폰 뒷 4자리 (이메일은 대소문자·공백을 맞춰 서버에서 비교)
-- Supabase SQL Editor 에 붙여넣어 실행. 여러 번 실행해도 결과는 같아요.
-- 이 파일을 먼저 실행한 뒤 Apps Script 코드를 다시 붙여넣어 주세요 (순서가 바뀌면 이름 없는 예약이 저장 실패)
-- =====================================================================

begin;

alter table public.bookings alter column name drop not null;
comment on column public.bookings.name is '예약자 (2026-11 이후 네이버 예약에서 받지 못해 비어 있을 수 있음). My Page 로그인에는 쓰지 않음';

-- 로그인: email_files(시트 F열 '촬영파일 이메일(입력)') + phone_last4(D열 전화번호 뒷 4자리)
create index if not exists bookings_phone_last4_idx on public.bookings (phone_last4);
create index if not exists bookings_email_files_lower_idx on public.bookings (lower(btrim(email_files)));

commit;

-- 확인용 (is_nullable 이 YES 면 성공)
-- select is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'bookings' and column_name = 'name';
