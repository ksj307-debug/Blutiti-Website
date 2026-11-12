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
};

const GalleryContext = React.createContext<GalleryContextType | null>(null);

const spring = { type: "spring", stiffness: 350, damping: 35, mass: 1 } as const;

/** 확대 상태를 관리하고 확대 화면(모달)을 그리는 루트 */
export function Gallery({ children }: { children: React.ReactNode }) {
  const [selectedImage, setSelectedImage] = React.useState<ImageData | null>(null);
  const trigger = React.useRef<HTMLElement | null>(null);

  const open = React.useCallback((image: ImageData, el: HTMLElement) => {
    trigger.current = el;
    setSelectedImage(image);
  }, []);
  const close = React.useCallback(() => {
    setSelectedImage(null);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  // Esc 로 닫기
  React.useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage, close]);

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
    <GalleryContext.Provider value={{ selectedImage, open, close }}>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  );
}

/** 반응형 메이슨리 격자 (모바일 2열 · 데스크톱 3열) */
export function GalleryGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5", className)}>{children}</div>;
}

/** 썸네일 한 장. children 은 사진 아래 캡션 */
export function GalleryImage({
  src,
  srcSet,
  sizes,
  alt,
  id,
  className,
  children,
}: {
  src: string;
  /** 썸네일 반응형 srcset (크게 보기는 src 원본) */
  srcSet?: string;
  sizes?: string;
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
          className="block aspect-square h-auto w-full object-cover"
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
  const { close } = context;

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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 300) close();
            }}
            onClick={close}
          >
            <motion.img
              layoutId={reduce ? undefined : `image-${selected.id}`}
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
          <p className="t-caption pointer-events-none absolute bottom-6 left-0 right-0 z-50 m-0 text-center text-[var(--on-night-muted)]">
            위아래로 밀거나 바깥을 누르면 닫혀요
          </p>
        </div>
      )}
    </AnimatePresence>
  );
}
