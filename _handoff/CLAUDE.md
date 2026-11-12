# BLUTITI 웹사이트 — 작업 기준

블루티티 셀프스튜디오(안산 초지역) 공식 웹사이트. 모든 작업은 아래 기준 파일을 먼저 읽고 따른다.

## 기준 파일 (작업 전 반드시 확인)

| 무엇 | 경로 | 쓰임 |
|---|---|---|
| 디자인 시스템 | `_handoff/design-system/README.md` | 색·서체·레이아웃·로고·톤 규칙. 화면 스타일의 최종 기준 |
| 디자인 토큰 | `_handoff/design-system/tokens.json` → `styles/blutiti-tokens.css` | 색·폰트·간격 값. 하드코딩 금지, CSS 변수 사용 |
| 로고 | `_handoff/design-system/logos/` (+ `README.md`) | 가로형·세로형 × navy/ink/ivory SVG. 텍스트로 재현 금지 |
| 레퍼런스 화면 | `_handoff/reference/index.html` | 현재 사이트 시안. 섹션 구성·문구·가격·예약 흐름의 원본 |

레퍼런스와 디자인 시스템이 다르면 디자인 시스템을 따른다. 레퍼런스와 내 지시가 다르면 내 지시를 따른다.

## 디자인 규칙 요약 (상세는 design-system/README.md)

- 화면 80% 이상 뉴트럴: `--paper-100` 배경, `--ink` 텍스트, `--night` 블랙 섹션
- `--titi-cobalt`는 예약 동작에만, 한 화면에 한 곳 (예약 버튼, 선택된 날짜·옵션)
- `--titi-navy`는 로고·헤드라인 강조·링크
- 서체: 영문 헤드라인 Cormorant Garamond(대문자, 연결어만 이탤릭) / 한글 제목 고운바탕 400 / 본문·UI Pretendard 400·600 / 라벨 IBM Plex Mono
- 텍스트 스타일은 `styles/blutiti-tokens.css`의 `.t-*` 클래스 사용 (t-display-xl, t-heading-kr-lg, t-title-kr, t-body, t-caption, t-eyebrow, t-index 등)
- 버튼: 기본 `.btn-primary`(코발트 pill), 보조 `.btn-secondary`(ink 1px 테두리)
- 사진 radius 0, 그림자 없음. 구분은 `--line` 1px 헤어라인과 여백
- 섹션 상하 여백 96px(데스크톱) / 64px(모바일), 모바일 좌우 16px
- 금지: 파랑-보라 그라데이션, 그림자 카드, 좌측 컬러 보더 카드, 이모지, 굵기 700 이상

## 모바일 우선

- 방문자의 90% 이상이 모바일. 모든 화면은 390px 폭 기준으로 먼저 설계하고, 그다음 태블릿(768px)·데스크톱(1440px)으로 넓혀.
- 터치 영역(버튼, 화살표, 링크)은 최소 44x44px.
- 본문 글자는 15px 아래로 줄이지 않기. 캡션만 13px까지 허용.
- 캐러셀을 제외하고 페이지 전체 가로 스크롤 금지.
- 사진은 화면 표시 크기의 2배 해상도까지만 제공하고, 첫 화면 아래 사진은 지연 로딩.
- 작업 완료 보고 시 390x844 화면 기준으로 확인한 결과를 먼저 알려줘.

## 콘텐츠 규칙

- 고객 문구는 친근한 존댓말(~해요, ~돼요). 과장·느낌표 남발 금지
- 영문은 헤드라인·라벨 장식용, 정보는 항상 한글
- 메뉴명 = 섹션 영문 제목 (CONCEPT, PRICE, REVIEW, GUIDE, LOCATION, BOOKING)
- 가격·이벤트·정책 수치는 레퍼런스 또는 내가 준 값만 사용. 지어내지 말고 없으면 질문

## 코드 규칙

- 컨셉 목록·가격은 `lib/concepts.ts` 하나에서만 관리 (CONCEPT·PRICE·BOOKING 공용)
- 기존 데이터와 기능은 삭제하지 말고 유지. 화면에서 빼는 것은 숨기거나 별도 페이지로 이동
- 불명확한 부분은 임의 구현 말고 먼저 질문
- 각 작업 후 바뀐 파일 목록과 확인할 화면 위치를 짧게 보고
