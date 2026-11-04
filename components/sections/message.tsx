import { Fragment } from "react";
import { Sentences } from "@/components/site/sentences";

/** 서비스 소개: 촬영 종류 키워드 한 줄 (데스크톱 가로 나열, 모바일 2열 x 3줄) */
const KEYWORDS = ["가족", "만삭", "셀프웨딩", "아이생일", "100일상", "증명사진"];
/** 예전 영문 키워드 (FAMILY 가족 · MATERNITY 만삭 · WITH DOG 반려견 · PRE-WEDDING 웨딩 전 커플). 화면에서는 뺌 */
export const LEGACY_KEYWORDS = [
  { en: "FAMILY", kr: "가족" },
  { en: "MATERNITY", kr: "만삭" },
  { en: "WITH DOG", kr: "반려견" },
  { en: "PRE-WEDDING", kr: "웨딩 전 커플" },
];

/** 원형 사진·소개 문구: 화면에서 숨김 (true 로 바꾸면 다시 보임. 사진 파일은 public/images/reference/four-bw.jpg 유지) */
const SHOW_INTRO = false;

export function Message() {
  return (
    <section className="wrap message" aria-label="촬영 종류">
      <ul className="keywords">
        {KEYWORDS.map((k, i) => (
          <Fragment key={k}>
            {i > 0 && (
              <li className="kw-dot t-heading-kr" aria-hidden="true">
                ·
              </li>
            )}
            <li className="kw t-heading-kr">{k}</li>
          </Fragment>
        ))}
      </ul>
      {SHOW_INTRO && (
        <>
          <img src="/images/reference/four-bw.jpg" alt="흑백 배경에서 인형을 들고 춤추는 아이의 4컷 사진" />
          <h2 className="h-kr">찍는 시간까지 추억이 되는 곳</h2>
          <p className="muted">
            <Sentences text="블루티티는 안산 초지역의 무인 셀프 사진관이에요. 조명도, 배경도, 소품도 미리 준비해 두었어요. 방해받지 않는 우리끼리의 시간 동안 마음껏 찍고, 고르는 건 집에서 천천히 하세요." />
          </p>
        </>
      )}
    </section>
  );
}
