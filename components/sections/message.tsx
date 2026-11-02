import { Fragment } from "react";

/** 서비스 소개 (브랜드 메시지). 촬영 대상 키워드를 가장 먼저 보이게 */
const KEYWORDS = [
  { en: "FAMILY", kr: "가족" },
  { en: "MATERNITY", kr: "만삭" },
  { en: "WITH DOG", kr: "반려견" },
  { en: "PRE-WEDDING", kr: "웨딩 전 커플" },
];

export function Message() {
  return (
    <section className="band wrap message" aria-labelledby="message-h">
      <ul className="keywords" aria-label="이런 분들이 찍어요">
        {KEYWORDS.map((k, i) => (
          <Fragment key={k.en}>
            {i > 0 && (
              <li className="kw-dot t-display-md" aria-hidden="true">
                ·
              </li>
            )}
            <li className="kw">
              <span className="t-display-md">{k.en}</span>
              <span className="t-caption">{k.kr}</span>
            </li>
          </Fragment>
        ))}
      </ul>
      <img src="/images/reference/four-bw.jpg" alt="흑백 배경에서 인형을 들고 춤추는 아이의 4컷 사진" />
      <h2 id="message-h" className="h-kr">
        찍는 시간까지 추억이 되는 곳
      </h2>
      <p className="muted">
        블루티티는 안산 초지역의 무인 셀프 사진관이에요. 조명도, 배경도, 소품도 미리 준비해 두었어요. 방해받지
        않는 우리끼리의 시간 동안 마음껏 찍고, 고르는 건 집에서 천천히 하세요.
      </p>
    </section>
  );
}
