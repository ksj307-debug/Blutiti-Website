-- =====================================================================
-- 블루티티 마이페이지 DB 초기 설정 (001_init)
--
-- 실행 방법
--   1. Supabase 대시보드 → 이 프로젝트 → 왼쪽 메뉴 SQL Editor → New query
--   2. 이 파일 전체를 복사해 붙여넣고 Run (Ctrl+Enter)
--   3. 'Success. No rows returned' 가 나오면 끝
--   여러 번 실행해도 오류가 나지 않게 만들었어요 (if not exists / create or replace / drop ... if exists).
--   단, 이미 만들어진 테이블의 칸·제약은 다시 실행해도 바뀌지 않아요 (새로 만들 때만 적용).
--
-- 테이블
--   bookings       네이버 예약 1건 = 1행
--   responses      고객 답변 (같은 예약·같은 type 은 여러 번 쌓이고 가장 최근 행이 유효)
--   login_attempts 로그인 시도 제한용 기록
--
-- 보안
--   - 3개 테이블 모두 Row Level Security(RLS) 켬. policy 는 만들지 않음
--     → anon·authenticated(브라우저용 키)로는 행을 읽거나 쓸 수 없음
--   - 서버의 secret 키(service_role 역할)로만 접근. service_role 은 RLS 를 거치지 않음
--   - 새 테이블 자동 노출이 꺼진 프로젝트라 service_role 에만 select·insert·update·delete 권한을 직접 줌
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 공통: 수정할 때 updated_at 자동 갱신
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1) bookings: 네이버 예약 1건 = 1행
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  booking_no   text primary key,                       -- 예약번호
  naver_status text,                                   -- 상태 (네이버 예약 상태)
  name         text not null,                          -- 예약자
  phone        text not null,                          -- 전화번호 (하이픈 포함 원본)
  phone_last4  text,                                   -- phone 숫자 마지막 4자리 (트리거로 자동 입력)
  email_booker text,                                   -- 이메일 (예약자 정보)
  email_files  text,                                   -- 촬영 파일 받을 이메일
  product      text,                                   -- 상품
  options      text,                                   -- 옵션
  visit_at     timestamptz,                            -- 이용일시
  pay_status   text,                                   -- 결제상태
  amount       integer,                                -- 결제금액
  applied_at   timestamptz,                            -- 신청일시
  parking_car  text,                                   -- 주차 차량번호 (비어 있을 수 있음)
  photo_url    text,                                   -- 구글 드라이브 사진 링크 (처음엔 null)
  progress     text not null default '촬영 완료'
    constraint bookings_progress_check check (
      progress in ('촬영 완료', '원본 전달', '셀렉 완료', '보정 중', '보정본 확인', '인화·발송', '완료')
    ),                                                 -- 진행 단계 7개만 허용
  expires_at   timestamptz,                            -- 사진 보관 만료 (비어 있으면 visit_at + 3개월 자동)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()      -- 수정 시 트리거로 자동 갱신
);

-- 로그인 조회용: 예약자 이름 + 전화번호 뒷 4자리
create index if not exists bookings_name_phone_last4_idx
  on public.bookings (name, phone_last4);

-- 입력·수정 시 자동 계산
--   phone_last4: phone 에서 숫자만 뽑아 마지막 4자리 (숫자가 없으면 null)
--   expires_at : 비어 있고 visit_at 이 있으면 visit_at + 3개월
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

  if new.expires_at is null and new.visit_at is not null then
    new.expires_at := new.visit_at + interval '3 months';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_fill_derived on public.bookings;
create trigger bookings_fill_derived
  before insert or update on public.bookings
  for each row execute function public.bookings_fill_derived();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2) responses: 고객 답변 (가장 최근 행이 유효한 답변)
-- ---------------------------------------------------------------------
create table if not exists public.responses (
  id         uuid primary key default gen_random_uuid(),
  booking_no text not null references public.bookings (booking_no) on delete cascade,
  type       text not null
    constraint responses_type_check check (type in ('select', 'order', 'inquiry')),
  content    jsonb not null,
  created_at timestamptz not null default now()
);

-- 예약·종류별 최신 답변 찾기용
create index if not exists responses_booking_type_created_idx
  on public.responses (booking_no, type, created_at desc);

-- ---------------------------------------------------------------------
-- 3) login_attempts: 로그인 시도 제한용
-- ---------------------------------------------------------------------
create table if not exists public.login_attempts (
  id           bigint generated always as identity primary key,
  ip_hash      text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists login_attempts_ip_hash_attempted_idx
  on public.login_attempts (ip_hash, attempted_at);

-- ---------------------------------------------------------------------
-- 보안: RLS 켜기 (policy 없음 → service_role 외에는 행 접근 불가)
-- ---------------------------------------------------------------------
alter table public.bookings       enable row level security;
alter table public.responses      enable row level security;
alter table public.login_attempts enable row level security;

-- ---------------------------------------------------------------------
-- 권한: service_role 에만 테이블·시퀀스 권한. anon·authenticated 는 없음
-- ---------------------------------------------------------------------
revoke all on table public.bookings, public.responses, public.login_attempts from anon, authenticated;
grant select, insert, update, delete on table public.bookings, public.responses, public.login_attempts to service_role;

-- login_attempts.id (identity) 시퀀스: service_role 이 새 행을 넣을 때 필요
revoke all on sequence public.login_attempts_id_seq from anon, authenticated;
grant usage, select on sequence public.login_attempts_id_seq to service_role;

-- 트리거 전용 함수: 외부(API)에서 직접 부를 일이 없으므로 실행 권한을 막음
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.bookings_fill_derived() from public, anon, authenticated;

commit;
