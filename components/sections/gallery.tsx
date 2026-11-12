import { Gallery as SharedGallery, GalleryGrid, GalleryImage } from "@/components/ui/shared-element-gallery";
import { INSTAGRAM_URL } from "@/lib/nav";
import { SIZES, srcSet } from "@/lib/img";

/** 인스타그램 글리프 (단색 1.5px 선, 브랜드 색 대신 currentColor) */
function InstagramGlyph() {
  return (
    <svg className="ig-glyph" width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

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
      {/* 사진을 누르면 크게 보기 (shared-element-gallery), 원본 비율 그대로 메이슨리 배치 */}
      <SharedGallery>
        <GalleryGrid>
          {PHOTOS.map((p, i) => (
            <GalleryImage
              key={p.src + i}
              id={`gallery-${i}`}
              src={p.src}
              // 레퍼런스 jpg(사본 없음)는 srcset 없이 원본
              srcSet={p.src.endsWith(".webp") ? srcSet(p.src, [360, 480, 560], 800) : undefined}
              sizes={SIZES.gallery}
              alt={p.alt}
            >
              <figcaption className="index gallery-cap">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{p.caption}</span>
              </figcaption>
            </GalleryImage>
          ))}
        </GalleryGrid>
      </SharedGallery>

      {/* 인스타그램 더 보기: 갤러리 마지막에 크게 */}
      <a className="ig-cta" href={INSTAGRAM_URL} target="_blank" rel="noopener">
        <InstagramGlyph />
        <span className="ig-cta-text">
          <span className="eyebrow">INSTAGRAM</span>
          <span className="t-title-kr">인스타그램에서 더 보기</span>
          <span className="cap">@blutiti_studio</span>
        </span>
        <span className="ig-cta-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <p className="muted cap gallery-note">SNS 활용에 동의해 주신 분들의 사진만 소개해요.</p>
    </section>
  );
}
