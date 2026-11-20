"use client";

/**
 * Shared-element Gallery (원본: 21st.dev shared-element-gallery.tsx)
 * 썸네일을 누르면 같은 사진이 커지며 열리고, 위아래로 끌거나 Esc·바깥을 누르면 닫힘
 *
 * 원본 대비 수정 사항 (BLUTITI 디자인 시스템)
 * - 사진 radius 0, 그림자 없음 (원본 rounded-xl · shadow-2xl 제거)
 * - 배경은 --night 반투명, 닫기 버튼은 on-night 1px 테두리 원형 (lucide X → 1px 선 아이콘)
 * - 썸네일을 <button> 으로: 키보드로 열 수 있고, 닫으면 누른 썸네일로 포커스 복귀
 * - 열리면 닫기 버튼에 포커스, role="dialog" + aria-modal, 사진 설명(alt)을 대화상자 이름으로
 * - 스크롤 잠금 해제 시 원래 값으로 복원 (원본은 'auto' 로 덮어씀)
 * - 움직임 줄이기 설정이면 확대 애니메이션 없이 바로 열고 닫음
 * - 썸네일 아래 캡션(번호·설명)을 넣을 수 있게 children 추가
 */
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ImageData = { id: string; src: string; alt?: string };

type GalleryContextType = {
  selectedImage: ImageData | null;
  open: (image: ImageData, trigger: HTMLElement) => void;
  close: () => void;
  /** 크게 보기에서 넘길 전체 사진 (번호 순서). 없으면 화살표 없음 */
  items?: ImageData[];
  /** -1 이전 / +1 다음 (처음·끝에서는 반대쪽으로 이어짐) */
  step: (dir: -1 | 1) => void;
  /** 화살표로 넘긴 뒤에는 썸네일과 이어지는 확대 애니메이션(layoutId)을 끔 */
  navigated: boolean;
};

const GalleryContext = React.createContext<GalleryContextType | null>(null);

const spring = { type: "spring", stiffness: 350, damping: 35, mass: 1 } as const;

/**
 * 확대 상태를 관리하고 확대 화면(모달)을 그리는 루트
 * items: 크게 보기에서 왼쪽·오른쪽 화살표(또는 ←·→ 키, 좌우로 밀기)로 넘길 사진 목록 (2026-11 추가)
 */
export function Gallery({ children, items }: { children: React.ReactNode; items?: ImageData[] }) {
  const [selectedImage, setSelectedImage] = React.useState<ImageData | null>(null);
  const [navigated, setNavigated] = React.useState(false);
  const trigger = React.useRef<HTMLElement | null>(null);

  const open = React.useCallback((image: ImageData, el: HTMLElement) => {
    trigger.current = el;
    setNavigated(false);
    setSelectedImage(image);
  }, []);
  const close = React.useCallback(() => {
    setSelectedImage(null);
    trigger.current?.focus({ preventScroll: true });
  }, []);
  const step = React.useCallback(
    (dir: -1 | 1) => {
      if (!items?.length) return;
      setSelectedImage((cur) => {
        const i = cur ? items.findIndex((it) => it.id === cur.id) : -1;
        return items[(i + dir + items.length) % items.length];
      });
      setNavigated(true);
    },
    [items],
  );

  // Esc 로 닫기, ←·→ 로 이전·다음 사진
  React.useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage, close, step]);

  // 열려 있는 동안 페이지 스크롤 잠금
  React.useEffect(() => {
    if (!selectedImage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedImage]);

  return (
    <GalleryContext.Provider value={{ selectedImage, open, close, items, step, navigated }}>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  );
}

/** 화면 폭별 열 수: 모바일 2 · 태블릿(768px~) 3 · 데스크톱(1024px~) 5 */
const COLUMN_QUERIES: [string, number][] = [
  ["(min-width: 1024px)", 5],
  ["(min-width: 768px)", 3],
];
function subscribeColumns(cb: () => void) {
  const mqs = COLUMN_QUERIES.map(([q]) => window.matchMedia(q));
  mqs.forEach((m) => m.addEventListener("change", cb));
  return () => mqs.forEach((m) => m.removeEventListener("change", cb));
}
const getColumns = () => COLUMN_QUERIES.find(([q]) => window.matchMedia(q).matches)?.[1] ?? 2;

/**
 * 메이슨리 격자: 사진을 자르지 않고 원본 비율 그대로 (열 폭만 같고 높이는 사진마다 다름)
 * - 번호가 왼쪽 → 오른쪽으로 읽히게 차례대로 열에 나눠 담음 (2열: 01 왼쪽, 02 오른쪽, 03 왼쪽 …)
 * - 서버·첫 화면은 모바일 2열 기준, 브라우저에서 화면 폭에 맞춰 3·5열로
 */
export function GalleryGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const cols = React.useSyncExternalStore(subscribeColumns, getColumns, () => 2);
  const items = React.Children.toArray(children);
  const columns = Array.from({ length: cols }, (_, c) => items.filter((_, i) => i % cols === c));
  return (
    <div className={cn("gallery-masonry", className)} style={{ "--gm-cols": cols } as React.CSSProperties}>
      {columns.map((col, c) => (
        <div className="gallery-col" key={c}>
          {col}
        </div>
      ))}
    </div>
  );
}

/** 썸네일 한 장. children 은 사진 아래 캡션 */
export function GalleryImage({
  src,
  srcSet,
  sizes,
  position,
  width,
  height,
  alt,
  id,
  className,
  children,
}: {
  src: string;
  /** 썸네일 반응형 srcset (크게 보기는 src 원본) */
  srcSet?: string;
  sizes?: string;
  /** 썸네일 기준 위치 (object-position). 지금은 자르지 않아 영향 없음, 다시 자를 때를 위해 유지 */
  position?: string;
  /** 원본 크기: 이미지가 불러와지기 전에도 비율대로 자리를 잡음 */
  width?: number;
  height?: number;
  alt?: string;
  id: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const context = React.useContext(GalleryContext);
  if (!context) throw new Error("GalleryImage must be used within a Gallery");

  return (
    <figure className={cn("m-0", className)}>
      <motion.button
        type="button"
        whileHover="hover"
        whileTap="tap"
        aria-label={`${alt ?? "사진"} 크게 보기`}
        aria-haspopup="dialog"
        className="relative block w-full cursor-zoom-in overflow-hidden border-0 bg-[var(--paper-200)] p-0"
        onClick={(e) => context.open({ id, src, alt }, e.currentTarget)}
      >
        <motion.img
          layoutId={`image-${id}`}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt ?? ""}
          loading="lazy"
          width={width}
          height={height}
          style={position ? { objectPosition: position } : undefined}
          className="block h-auto w-full"
          variants={{ hover: { scale: 0.98 }, tap: { scale: 0.95 } }}
          transition={spring}
        />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--night)_12%,transparent)]"
          initial={{ opacity: 0 }}
          variants={{ hover: { opacity: 1 }, tap: { opacity: 1 } }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
      {children}
    </figure>
  );
}

/** 확대 화면: 위아래로 끌어서 닫기 */
function GalleryModal() {
  const context = React.useContext(GalleryContext);
  const reduce = useReducedMotion();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const selected = context?.selectedImage;

  React.useEffect(() => {
    if (selected) closeRef.current?.focus({ preventScroll: true });
  }, [selected]);

  if (!context) return null;
  const { close, items, step, navigated } = context;
  const total = items?.length ?? 0;
  const index = selected && items ? items.findIndex((it) => it.id === selected.id) : -1;
  const canStep = total > 1 && index >= 0;

  return (
    <AnimatePresence>
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={selected.alt ?? "확대한 사진"}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--night)_92%,transparent)] backdrop-blur-md"
            onClick={close}
          />

          <motion.div
            className="relative z-10 flex h-full w-full cursor-zoom-out items-center justify-center"
            // 좌우로 밀면 이전·다음 사진, 위아래로 밀면 닫기 (예전: drag="y" 위아래만)
            drag={canStep ? true : "y"}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              const { x, y } = info.offset;
              if (canStep && Math.abs(x) > 80 && Math.abs(x) > Math.abs(y)) step(x < 0 ? 1 : -1);
              else if (Math.abs(y) > 100 || Math.abs(info.velocity.y) > 300) close();
            }}
            onClick={close}
          >
            <motion.img
              key={selected.id}
              layoutId={reduce || navigated ? undefined : `image-${selected.id}`}
              initial={navigated ? { opacity: 0 } : undefined}
              animate={navigated ? { opacity: 1 } : undefined}
              src={selected.src}
              alt={selected.alt ?? ""}
              className="h-auto max-h-[88vh] w-auto max-w-[94vw] object-contain will-change-transform"
              draggable={false}
              transition={spring}
            />
          </motion.div>

          <motion.button
            ref={closeRef}
            type="button"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ delay: reduce ? 0 : 0.1, duration: 0.2 }}
            className="absolute top-5 right-5 z-50 grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--on-night)] bg-transparent text-[var(--on-night)] transition-colors hover:bg-[var(--on-night)] hover:text-[var(--night)]"
            onClick={close}
            aria-label="닫기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </motion.button>
          {/* 이전·다음 화살표: 닫기 버튼과 같은 44px on-night 1px 테두리 원형, 화면 좌우 가운데 */}
          {canStep && (
            <>
              <button
                type="button"
                className="gal-nav gal-nav-prev"
                onClick={() => step(-1)}
                aria-label="이전 사진"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M11 3.5 5.5 9l5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="gal-nav gal-nav-next"
                onClick={() => step(1)}
                aria-label="다음 사진"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M7 3.5 12.5 9 7 14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
          <p className="t-caption pointer-events-none absolute bottom-6 left-0 right-0 z-50 m-0 text-center text-[var(--on-night-muted)]">
            {canStep && (
              <span className="num" aria-live="polite">
                {index + 1} / {total} ·{" "}
              </span>
            )}
            {canStep ? "좌우로 넘기고, 위아래로 밀거나 바깥을 누르면 닫혀요" : "위아래로 밀거나 바깥을 누르면 닫혀요"}
          </p>
        </div>
      )}
    </AnimatePresence>
  );
}
