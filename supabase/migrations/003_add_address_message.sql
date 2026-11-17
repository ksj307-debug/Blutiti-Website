-- =====================================================================
-- 003: bookings 에 주소(address)·문구(message) 칸 추가 (2026-11)
-- 구글 시트에 '주소', '문구' 열이 생겨 동기화 스크립트(apps-script/sync-bookings.gs)가 함께 보냄
-- Supabase SQL Editor 에 붙여넣어 실행. 여러 번 실행해도 오류 없이 같은 결과예요.
-- 기존 데이터는 그대로 (칸만 추가, 비어 있는 상태로 시작)
-- 마이페이지 API(/api/mypage/bookings)는 이 두 칸을 고객에게 보내지 않음
-- =====================================================================

begin;

alter table public.bookings add column if not exists address text; -- 주소 (우편 발송용, 개인정보)
alter table public.bookings add column if not exists message text; -- 문구 (레터링 등 고객이 요청한 문구)

comment on column public.bookings.address is '주소 (시트 ''주소'' 열). 개인정보: 로그·고객 화면에 노출하지 않음';
comment on column public.bookings.message is '문구 (시트 ''문구'' 열)';

-- 권한: 001 과 동일하게 service_role 만 접근 (다시 실행해도 같은 상태)
alter table public.bookings enable row level security;
revoke all on table public.bookings from anon, authenticated;
grant select, insert, update, delete on table public.bookings to service_role;

commit;

-- 확인용 (실행 후 address, message 가 보이면 성공)
-- select column_name, data_type from information_schema.columns
-- where table_schema = 'public' and table_name = 'bookings' and column_name in ('address', 'message');
