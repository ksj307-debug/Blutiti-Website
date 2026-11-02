import { INSTAGRAM_URL } from "@/lib/nav";

/**
 * GALLERY. 샘플사진 폴더에서 고른 사진 (public/images/gallery, 가로 800px webp)
 * - 세이지 포레스트 폴더 사진은 베이직 컬러로 표기 (컨셉 통합)
 * - 레터링 & 드로잉, 원목 액자는 예시 사진이 폴더에 없어 레퍼런스 사진 유지 (사진이 생기면 교체)
 */
const PHOTOS = [
  { src: "/images/gallery/gallery-01-four-cut.webp", alt: "베이직 컬러 4컷 프레임 - 풍선과 함께한 아이", caption: "4컷 프레임" },
  { src: "/images/gallery/gallery-02-basic-couple.webp", alt: "베이직 컬러 - 하트 풍선을 든 커플", caption: "베이직 컬러" },
  { src: "/images/gallery/gallery-03-bw-couple.webp", alt: "클래식 흑백 - 꽃다발 앞에서 입맞추는 커플", caption: "클래식 흑백" },
  { src: "/images/gallery/gallery-04-nine-cut.webp", alt: "크리스마스 9컷 프레임 포스터", caption: "9컷 프레임" },
  { src: "/images/gallery/gallery-05-100days.webp", alt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기", caption: "100일상" },
  { src: "/images/gallery/gallery-06-basic-family.webp", alt: "베이직 컬러 - 아빠 목말을 탄 아이와 가족", caption: "베이직 컬러" },
  { src: "/images/reference/letter.jpg", alt: "만삭 커플 레터링", caption: "레터링 & 드로잉" },
  { src: "/images/gallery/gallery-08-basic-baby.webp", alt: "베이직 컬러 - 아기에게 입맞추는 부부", caption: "베이직 컬러" },
  { src: "/images/reference/frame.jpg", alt: "원목 액자 인화", caption: "원목 액자" },
];

export function Gallery() {
  return (
    <section className="band wrap" aria-labelledby="gal-h">
      <div className="section-head">
        <p className="eyebrow">GALLERY</p>
        <h2 id="gal-h" className="display">
          Real days, <em>real</em> us
        </h2>
      </div>
      <div className="gallery">
        {PHOTOS.map((p, i) => (
          <figure key={p.src + i}>
            <img src={p.src} alt={p.alt} loading="lazy" />
            <figcaption className="index">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{p.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-foot">
        <p className="muted cap" style={{ margin: 0 }}>
          SNS 활용에 동의해 주신 분들의 사진만 소개해요.
        </p>
        <a className="link" href={INSTAGRAM_URL} target="_blank" rel="noopener">
          인스타그램에서 더 보기 @blutiti_studio
        </a>
      </div>
    </section>
  );
}
