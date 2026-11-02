/**
 * 부가서비스·혜택 단일 소스 (PRICE · BOOKING 공용)
 * 금액 = 레퍼런스(_handoff/reference/index.html) '이용 요금' 값
 */

/** 인원 추가 1인 금액. 1~2인 기준 + 만 7세 이하 1명 무료 */
export const EXTRA_PERSON_PRICE = 15000;

export type AddOn = {
  id: string;
  name: string;
  price: number;
  /** PRICE 섹션 설명 */
  desc?: string;
  /** BOOKING 옵션 설명 (없으면 desc) */
  bookingDesc?: string;
  /** BOOKING 요약 패널 표기 (없으면 name) */
  shortName?: string;
};

/** 촬영 전 추가 */
export const PRE_ADD_ONS: AddOn[] = [
  { id: "person", name: "인원 추가 (1인)", price: EXTRA_PERSON_PRICE },
  {
    id: "ext",
    name: "시간 추가 (30분)",
    price: 15000,
    desc: "다음 시간이 비어 있을 때만 선택할 수 있어요",
    bookingDesc: "다음 시간이 비어 있을 때만 선택할 수 있어요.",
  },
  {
    id: "help",
    name: "촬영 도움 서비스",
    price: 29000,
    desc: "첫 20분 동안 직원이 포즈·소품·촬영 방법을 알려드려요",
    bookingDesc: "첫 20분 동안 직원이 포즈·소품·촬영 방법을 알려드려요.",
  },
  {
    id: "half",
    name: "반반 옵션 (클래식 흑백 추가)",
    shortName: "반반 옵션",
    price: 29000,
    desc: "촬영 중간에 컨셉 전환, 총 촬영 시간은 그대로",
    bookingDesc: "촬영 중간에 컨셉을 바꿔요. 총 촬영 시간은 그대로예요.",
  },
];

/** 촬영 후 추가 (3개월 안에 주문 가능) */
export const POST_ADD_ONS: { name: string; price: string }[] = [
  { name: "보정 추가 (1컷)", price: "15,000원" },
  { name: "고화질 원본 구매", price: "20,000원" },
  { name: "4컷 프레임 제작·인화", price: "15,000원" },
  { name: "9컷 프레임 제작·인화", price: "25,000원" },
  { name: "인화 추가 4x6 / 5x7 (1장)", price: "각 5,000원" },
  { name: "원목액자 (5x7)", price: "5,000원" },
  { name: "레터링 & 드로잉", price: "5,000원" },
  { name: "증명·프로필 사진용 보정", price: "15,000원" },
];

/** 무료 혜택 (이벤트) */
export const FREE_BENEFITS: { name: string; benefit: string }[] = [
  { name: "SNS 활용 동의", benefit: "고화질 원본 무료" },
  { name: "네이버 리뷰·블로그 작성", benefit: "보정 1컷 무료" },
  { name: "재방문 고객", benefit: "4컷 프레임 파일 무료" },
];

/** BOOKING 전용: 재방문 이벤트 (무료) */
export const REVISIT_OPTION: AddOn = {
  id: "revisit",
  name: "재방문 이벤트 · 4컷 프레임 파일",
  shortName: "재방문 이벤트",
  price: 0,
  bookingDesc: "방문 이력이 있는 분만 선택해 주세요.",
};

/** 모든 촬영에 기본 제공 */
export const BASIC_INCLUDES = [
  "촬영 1시간 20분 보장",
  "모든 촬영 원본 당일 제공 (웹사이즈)",
  "무선 리모콘",
  "성인·아동 드레스, 구두 등 소품 무료 대여",
  "무료 주차 (지하 주차장, 엘리베이터 연결)",
  "무인 운영, 방해받지 않는 촬영",
];
