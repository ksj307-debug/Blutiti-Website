# BLUTITI

블루티티 셀프스튜디오(안산)의 웹사이트·SNS용 디자인 시스템. 에디토리얼 포토그래피 톤(아이보리 종이, 블랙 섹션, 넉넉한 여백) 위에 로고의 네이비와 코발트 포인트를 얹는 구성.

> 초안(v1). 공식 로고·아이덴티티 작업이 끝나면 색상·서체를 그 기준으로 다시 맞춘다.

## 레퍼런스와 반영 내용

| 출처 | 가져온 것 | 토큰 |
|---|---|---|
| 블루티티 로고 (가로형·세로형) | 워드마크 네이비 | `titi-navy` |
| Vivian 템플릿 (첨부 1) | 아이보리 배경, 대문자 세리프 + 이탤릭 혼용 헤드라인, 블랙 스토리 섹션 | `paper-100`, `night`, `display-xl` + `display-italic` |
| Portent Research 시트 (첨부 2) | 번호 붙은 3열 그리드, 모노 라벨, 헤어라인 | `eyebrow`, `index`, `line` |
| Latexx (첨부 3) | 흑백 사진 + 단일 코발트 포인트, 원형 크롭 | `titi-cobalt`, `titi-sky`, `radius-round` |
| Frida / Ouu i love (링크) | 뉴트럴 톤, 클래식 세리프의 미니멀·로맨틱 무드 | `paper-200`, `stone`, `display` 계열 |

Frida·Ouu i love 페이지에는 실제 폰트명·HEX 값이 공개돼 있지 않아 무드 설명(neutral tones, classic type, editorial/modern/minimal)만 반영했다. 정확한 서체를 알게 되면 `type.families`만 교체하면 된다.

## 콘텐츠 원칙

- 톤: 친근한 존댓말. "~해요", "~하세요". 과장·느낌표 남발 금지
- 대상: 아이 있는 가족, 만삭 가족, 반려견과 함께하는 커플, 웨딩 준비 커플
- 영문은 헤드라인·라벨 장식용, 정보는 항상 한글로
- 문장은 짧게, 한 문단 2~3줄
- 예시
  - 헤드라인: `CAPTURE our LITTLE DAYS` + 한글 서브 `우리 가족의 가장 예쁜 하루`
  - 본문: `90분 동안 온전히 우리 가족만의 공간에서 편하게 촬영하세요.`
  - 안내: `예약은 시작 6시간 전까지 가능해요.`

## 컬러

- 화면의 80% 이상은 `paper-100`·`paper-200`·`night`·`ink` (뉴트럴)
- 브랜드색 `titi-navy`는 로고·헤드라인 강조·링크
- `titi-cobalt`는 한 화면에 한 곳: 예약 버튼, 활성 탭, 선택된 날짜
- 사진은 컬러/흑백 혼용 가능. 흑백 사진 위 강조는 코발트 하나만 (Latexx 방식)
- `stone`, `line`은 장식·구분선 전용. 텍스트에 쓰지 않음
- 다크(Night) 테마는 같은 이름의 토큰이 자동 반전

## 타이포그래피

| 역할 | 서체 | 사용 |
|---|---|---|
| Display (영문) | Cormorant Garamond 300 / Italic | 히어로 대문자 헤드라인. 이탤릭은 for·the·with 같은 연결어 1~2개에만 |
| Heading (한글) | 고운바탕 Gowun Batang 400 | 한글 히어로 카피, 섹션·카드 제목 |
| Text (한글) | Pretendard Variable 400/600 | 본문, 버튼, 폼, 가격, 예약 UI |
| Label | IBM Plex Mono | 카테고리 라벨, 갤러리 번호, 날짜 |

### 한글 폰트 선정 근거

| 역할 | 선택 | 후보 비교 | 이유 |
|---|---|---|---|
| 제목 | 고운바탕 | 나눔명조(가늘고 차가움), 함렡 Hahmlet(각지고 모던) | 붓 끝이 살아 있는 둥근 명조라 Cormorant의 로맨틱한 세리프와 결이 맞고, 친근한 존댓말 톤에 딱딱하지 않음 |
| 본문 | Pretendard | Noto Sans KR(무난하나 글자폭 넓음), 나눔고딕(구형) | 작은 크기 가독성, 굵기 9단계 가변, 국내 웹 표준급으로 예약·결제 UI 숫자 표기가 깔끔함 |

규칙
- 영문 대문자 헤드라인(Cormorant) 바로 아래 한글 카피는 고운바탕 `heading-kr-lg`
- 고운바탕은 본문에 쓰지 않음 (긴 문단에서 가독성 저하)
- Pretendard 본문 자간 -0.01em, 줄간 26px(1.7)
- 굵기는 400·600 두 가지만. 700 이상은 쓰지 않음

### 로드 방법
- Pretendard: `fonts/PretendardVariable.woff2` (OFL, 이 시스템에 파일로 포함)
- 나머지는 Google Fonts:
`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Gowun+Batang&family=IBM+Plex+Mono&display=swap`

## 레이아웃

- 여백이 디자인. 섹션 상하 `space-24`(데스크톱) / `space-16`(모바일), 모바일 좌우 `space-4`
- 사진은 `radius-0`. 인물 포인트 컷에만 `radius-round`
- 갤러리: 3열 그리드, 간격 `space-6`, 각 사진 위 `index` 라벨(01, 02…)
- 섹션 구분은 그림자 대신 `line` 헤어라인(`hairline` 1px)
- 헤더: 좌측 메뉴(`eyebrow`), 중앙 로고, 우측 `예약하기` 텍스트 링크 — Vivian 구조
- 버튼: 기본 `radius-pill` + `titi-cobalt` 면 + `on-cobalt` 텍스트, 보조는 `ink` 1px 테두리

## 로고 (Logos)

| 상황 | 형태 | 색 |
|---|---|---|
| 웹 데스크톱 헤더·푸터 | 가로형 | navy (푸터가 `night`면 ivory) |
| 웹 모바일 헤더 | 세로형 | navy |
| 히어로 사진 위 | 세로형 | ivory (밝은 사진이면 ink) |
| 예약 확인·카카오 알림·이메일 상단 | 가로형 | navy |
| 인스타그램 프로필·게시물 워터마크 | 세로형 | navy / 사진 위 ivory |
| 네이버 블로그·플레이스 배너, 현수막 | 가로형 | navy |
| 명함·포토카드·인화 봉투 | 세로형 | navy 또는 ink(1도) |

- 원본 두 색(가로형 네이비, 세로형 블랙)을 navy·ink·ivory 3색으로 통일
- 파일·규격·금지 사항은 Logos 그룹 README 참고
- 로고를 텍스트로 재현하지 않는다

## 아이코노그래피

- 아이콘 최소화. 필요한 경우 1px 라인 아이콘, `ink` 또는 `titi-navy`
- 이모지·일러스트 스티커 사용하지 않음

## 사용하지 않는 것

- 파랑-보라 그라데이션, 그림자 카드, 좌측 컬러 보더 카드
- 코발트를 넓은 배경 면으로 쓰기
