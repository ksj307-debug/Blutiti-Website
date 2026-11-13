import { Gallery as SharedGallery, GalleryGrid, GalleryImage } from "@/components/ui/shared-element-gallery";
import { INSTAGRAM_URL } from "@/lib/nav";
import { SIZES, srcSet } from "@/lib/img";

/** 인스타그램 글리프 (단색 1.5px 선, 브랜드 색 대신 currentColor) */
function InstagramGlyph() {
  return (
    <svg className="ig-glyph" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

/**
 * GALLERY 10장 (public/images/gallery, 가로 800px 이하 webp). 자르지 않고 원본 비율 그대로 메이슨리 배치 (예전: 정사각형 크롭)
 * - 라벨은 사진 내용(만삭·셀프웨딩 등)이 아니라 컨셉명. 셀프웨딩 사진은 원본이 흑백(클래식흑백4)이라 클래식 흑백
 * - 08~10 은 구글 드라이브 폴더 사진 중 FOR YOU 와 다른 사진
 *   만삭 '지보미48376.jpg' / 셀프웨딩 'blutiti_상품사진템플렛_클래식흑백4.jpg' / 아이 '이슬기.jpg' (템플릿 테두리 잘라냄)
 * - 시즌 컨셉: 샘플사진 'So This Is Christmas' 폴더 '지안_크리스마스5.jpg' (히어로·CONCEPTS 와 다른 사진)
 * - 원목 액자는 레퍼런스 사진(292px)뿐이라 작은 그대로 webp 변환 (큰 사진이 생기면 교체)
 * 화면에서 뺀 예전 사진(파일은 그대로): gallery-06-basic-family, gallery-08-basic-baby, reference/letter.jpg(레터링 & 드로잉)
 */
/** width·height: 원본 크기 (자르지 않고 이 비율 그대로). position: 예전 정사각형 크롭 기준 (지금은 미사용) */
type Photo = { src: string; alt: string; caption: string; width: number; height: number; position?: string };
const PHOTOS: Photo[] = [
  { src: "/images/gallery/gallery-02-basic-couple.webp", alt: "베이직 컬러 - 하트 풍선을 든 커플", caption: "베이직 컬러", width: 800, height: 1039 },
  // 02 레터링: 샘플사진 '레터링/happy1000days.jpg' (자르지 않음, 테두리 없음)
  // 예전 02 사진(gallery-lettering.webp '임상헌_4CUT_lettering.jpg', 그 전 만삭 gallery-maternity.webp)은 화면에서만 뺌
  {
    src: "/images/gallery/gallery-lettering-1000days.webp",
    alt: "레터링 - Happy 1000 Days 손글씨 아래에서 케이크 촛불을 부는 아이",
    caption: "레터링",
    width: 800,
    height: 1120,
  },
  // 03 베이직 컬러: 샘플사진 '베이직 칼라/insta_blutiti_황유정5.jpg' (템플릿 테두리 잘라냄). 예전 gallery-kids-family.webp 는 화면에서만 뺌
  { src: "/images/gallery/gallery-basic-balloon-100.webp", alt: "베이직 컬러 - 100 숫자 풍선 앞에서 꽃다발을 든 아이", caption: "베이직 컬러", width: 800, height: 1040 },
  { src: "/images/gallery/gallery-self-wedding.webp", alt: "클래식 흑백 - 스툴에 앉은 신부와 옆에 선 신랑", caption: "클래식 흑백", width: 800, height: 1000 },
  // 05 생일 패치워크: 샘플사진 '생일 패치워크/insta_blutiti_상품사진템플렛 복사2.jpg' (템플릿 테두리 잘라냄)
  // 예전 05 클래식 흑백 '꽃다발 앞에서 입맞추는 커플'(gallery-03-bw-couple.webp)은 화면에서만 뺌
  {
    src: "/images/gallery/gallery-birthday-patchwork.webp",
    alt: "생일 패치워크 - HAPPY BIRTHDAY 패치워크 배경 앞에 앉아 웃는 아기",
    caption: "생일 패치워크",
    width: 800,
    height: 1040,
  },
  { src: "/images/gallery/gallery-season.webp", alt: "시즌 컨셉 크리스마스 - 트리 옆에 모인 가족", caption: "시즌 컨셉", width: 756, height: 1000 },
  { src: "/images/gallery/gallery-01-four-cut.webp", alt: "베이직 컬러 4컷 프레임 - 풍선과 함께한 아이", caption: "4컷 프레임", width: 800, height: 1000 },
  { src: "/images/gallery/gallery-04-nine-cut.webp", alt: "크리스마스 9컷 프레임 포스터", caption: "9컷 프레임", width: 800, height: 1132 },
  { src: "/images/gallery/gallery-05-100days.webp", alt: "100일상 - 한복을 입고 백일상 뒤에 앉은 아기", caption: "100일상", width: 800, height: 1040 },
  // 10 졸업 사진: 샘플사진 'Graduation Snap/GraduationPackage_C.jpg' (졸업 패키지 포스터 디자인 그대로, 자르지 않음)
  // 예전 10 100일상 백일상 가족(gallery-100days-family.webp), 그 전 원목 액자(gallery-frame.webp)는 화면에서만 뺌
  {
    src: "/images/gallery/gallery-graduation.webp",
    alt: "졸업 사진 - 학사모를 쓰고 활짝 웃는 아이의 졸업 포스터",
    caption: "졸업 사진",
    width: 800,
    height: 1120,
  },
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
      {/* 사진을 누르면 크게 보기 (shared-element-gallery). 모바일 2열 · 태블릿 3열 · 데스크톱 5열, 자르지 않고 원본 비율 그대로 */}
      <SharedGallery>
        <GalleryGrid>
          {PHOTOS.map((p, i) => (
            <GalleryImage
              key={p.src}
              id={`gallery-${i}`}
              src={p.src}
              // 작은 사본이 있는 사진만 srcset (원목 액자 292px 는 원본만)
              srcSet={p.width > 360 ? srcSet(p.src, [360, 480, 560], p.width) : undefined}
              sizes={SIZES.gallery}
              position={p.position}
              width={p.width}
              height={p.height}
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

      {/* 인스타그램 유도: 안내 문장 → 버튼(모바일 가로 전체) → SNS 동의 캡션 */}
      <div className="ig-more">
        <p className="t-body">더 많은 촬영 사진은 인스타그램에서 볼 수 있어요.</p>
        <a className="btn-secondary ig-more-btn" href={INSTAGRAM_URL} target="_blank" rel="noopener">
          <InstagramGlyph />
          인스타그램에서 더 보기 @blutiti_studio
        </a>
        <p className="t-caption muted">SNS 활용에 동의해 주신 분들의 사진만 소개해요.</p>
      </div>
    </section>
  );
}
