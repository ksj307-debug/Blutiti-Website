import { INSTAGRAM_URL } from "@/lib/nav";

/** GALLERY. 세이지 포레스트 사진은 베이직 컬러로 표기 (컨셉 통합) */
const PHOTOS = [
  { src: "four-color.jpg", alt: "베이직 컬러 4컷 프레임", caption: "4컷 프레임" },
  { src: "b2.jpg", alt: "베이직 컬러 4컷 구성", caption: "베이직 컬러" },
  { src: "c-classic.jpg", alt: "클래식 흑백 커플", caption: "클래식 흑백" },
  { src: "nine.jpg", alt: "크리스마스 9컷 프레임", caption: "9컷 프레임" },
  { src: "c-100days.jpg", alt: "100일상 아기", caption: "100일상" },
  { src: "b3.jpg", alt: "베이직 컬러에서 뛰는 아이", caption: "베이직 컬러" },
  { src: "letter.jpg", alt: "만삭 커플 레터링", caption: "레터링 & 드로잉" },
  { src: "c-basic-2.jpg", alt: "베이직 컬러 모녀", caption: "베이직 컬러" },
  { src: "frame.jpg", alt: "원목 액자 인화", caption: "원목 액자" },
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
            <img src={`/images/reference/${p.src}`} alt={p.alt} />
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
