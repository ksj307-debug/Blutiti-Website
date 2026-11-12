import "server-only";

/**
 * 예약 데이터 (미리보기용 예시). 실제 예약 저장소(DB)가 연결되면 이 파일의 조회 함수만 교체
 * - concept 은 저장 당시 값을 그대로 둠. 예전 '세이지 포레스트' 예약도 데이터는 바꾸지 않고
 *   화면에서 findConcept() 로 '베이직 컬러' 표기
 */
export type BookingStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StoredBooking = {
  id: string;
  email: string;
  /** 숫자만 */
  phone: string;
  product: string;
  /** 저장 당시 컨셉 값 (id 또는 한글명) */
  concept?: string;
  /** YYYY-MM-DD (KST) */
  date: string;
  start: string;
  end: string;
  adults: number;
  kids: number;
  paid: number;
  stage: BookingStage;
  trackingNo?: string;
  /** 차량번호 (선택, 지하 주차장 사전 등록용). 입력값 앞뒤 공백만 정리, 형식 검사 없음 */
  carNo?: string;
};

/** 미리보기 로그인 기본값 (login 폼 기본 입력값으로 사용) */
export const DEMO_LOGIN = { email: "demo@blutiti.kr", last4: "5678" };

const BOOKINGS: StoredBooking[] = [
  {
    id: "BT-1018-07",
    email: DEMO_LOGIN.email,
    phone: "01012345678",
    product: "패키지 셀프촬영",
    concept: "세이지 포레스트",
    date: "2026-10-18",
    start: "14:30",
    end: "15:50",
    adults: 2,
    kids: 1,
    paid: 89000,
    stage: 4,
    // 예시 값 (입력칸 placeholder 와 같음)
    carNo: "12가 3456",
  },
  {
    id: "BT-0823-03",
    email: DEMO_LOGIN.email,
    phone: "01012345678",
    product: "가성비 셀프촬영",
    concept: "classic-bw",
    date: "2026-08-23",
    start: "11:30",
    end: "12:50",
    adults: 2,
    kids: 0,
    paid: 59000,
    stage: 7,
  },
];

const normEmail = (email: string) => email.trim().toLowerCase();

/** 이메일 + 휴대폰 뒷 4자리로 예약 찾기. 촬영일 최신순 */
export function findBookings(email: string, last4: string): StoredBooking[] {
  const e = normEmail(email);
  return BOOKINGS.filter((b) => normEmail(b.email) === e && b.phone.endsWith(last4)).sort((a, b) =>
    (b.date + b.start).localeCompare(a.date + a.start),
  );
}
