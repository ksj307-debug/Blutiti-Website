"use client";

/**
 * BLUTITI CONCEPT 캐러셀 (원본: 21st.dev SqueezeCarousel 보완판)
 * 디자인 기준: _handoff/design-system (BLUTITI 디자인 시스템) — styles/blutiti-tokens.css 필요
 *
 * 디자인 시스템 반영
 * - 사진 radius-0 (기본 radius 0), 그림자 없음
 * - '이걸로 예약하기' = 코발트 pill(btn-primary). 예약 동작이라 코발트 사용 규칙에 부합
 * - 화살표 = 보조 버튼 톤(ink 1px 테두리) — 코발트는 한 화면 한 곳 규칙
 * - 문구: 컨셉명 title-kr(고운바탕) + 설명 body(Pretendard) ink-muted, 오버레이 라벨 eyebrow(IBM Plex Mono)
 *
 * 원본 대비 수정 사항
 * - Geist 웹폰트 주입 제거: Geist 는 한글 글리프가 없어 한글이 대체 폰트로 깨져 보임 → 사이트 폰트 상속
 * - 모바일 전용 레이아웃 추가(md 미만): 원본은 폭이 좁으면 패널 너비 계산이 음수가 되어 깨짐
 *   → 모바일은 가로 스와이프 카드(scroll-snap)로 대체, 카드마다 설명 + '이걸로 예약하기' 버튼
 * - imagePosition 추가: 세로 인물 사진이 16:9 로 잘릴 때 얼굴 위치 보정 (예: "center 30%")
 * - 화살표 aria-label 한국어화 (prevLabel / nextLabel)
 * - 사용하지 않는 go() 함수 제거 (noUnusedLocals 빌드 에러 방지)
 * - @lg / @xl 컨테이너 쿼리 클래스 사용: Tailwind v4 는 기본 지원,
 *   v3 는 @tailwindcss/container-queries 플러그인 필요
 */

import {
    type ComponentProps,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   slides                                   */
/* -------------------------------------------------------------------------- */

export type SqueezeSlide = {
    /** 고유 key (컨셉 id 권장) */
    id?: string | number;
    /** 패널 아래 진한 글씨 첫 문장 (컨셉명 + 한 줄 소개) */
    title: string;
    /** 이어지는 회색 설명 */
    description?: string;
    /** 패널 사진 (public/ 기준 경로) */
    image?: string;
    /** 사진 설명 */
    imageAlt?: string;
    /** 사진 크롭 기준점 (CSS object-position). 기본 "center" */
    imagePosition?: string;
    /** 사진이 없을 때 배경 */
    background?: string;
    /** 열린 패널 좌하단 표시 (컨셉 영문명 등) */
    overlay?: ReactNode;
    /** 버튼 문구. 없으면 버튼 숨김 */
    action?: string;
    /** 버튼 이동 경로 */
    href?: string;
    target?: string;
    onAction?: () => void;
};

/* -------------------------------------------------------------------------- */
/*                                  geometry                                  */
/* -------------------------------------------------------------------------- */

type Size = number | string;

const size = (value: Size) => (typeof value === "number" ? `${value}px` : value);

const clamp = (value: number, low: number, high: number) =>
    Math.max(low, Math.min(high, value));

const SHARES = [-0.06, 0.61, 0.3, 0.15];
const STRETCHED = [0, 0.71, 0.4, 0.25];
const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];

type Card = { key: number; slide: number };

/** SSR(Next.js)에서 useLayoutEffect 경고가 나지 않도록 서버에서는 useEffect 사용 */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------- */
/*                                    hooks                                   */
/* -------------------------------------------------------------------------- */

function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const read = () => setReduced(query.matches);
        read();
        query.addEventListener("change", read);
        return () => query.removeEventListener("change", read);
    }, []);

    return reduced;
}

/* -------------------------------------------------------------------------- */
/*                                 component                                  */
/* -------------------------------------------------------------------------- */

export type SqueezeCarouselProps = {
    slides: SqueezeSlide[];
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    height?: Size;
    slatWidth?: Size;
    slatGap?: Size;
    gap?: Size;
    radius?: Size;
    duration?: number;
    hoverGrow?: boolean;
    autoplay?: boolean;
    interval?: number;
    controls?: boolean;
    accent?: string;
    accentForeground?: string;
    label?: string;
    prevLabel?: string;
    nextLabel?: string;
    panelClassName?: string;
} & Omit<ComponentProps<"div">, "onSelect">;

export function SqueezeCarousel(props: SqueezeCarouselProps) {
    const { className, ...rest } = props;
    return (
        <div className={cn("w-full", className)}>
            {/* 모바일: 가로 스와이프 카드 */}
            <div className="md:hidden">
                <MobileList slides={props.slides} radius={props.radius} />
            </div>
            {/* 태블릿·데스크톱: 스퀴즈 캐러셀 */}
            <div className="hidden md:block">
                <DesktopCarousel {...rest} />
            </div>
        </div>
    );
}

function DesktopCarousel({
    slides,
    defaultIndex = 0,
    onIndexChange,
    height = "clamp(220px, 34cqi, 420px)",
    slatWidth = 8,
    slatGap = 8,
    gap = 16,
    radius = 0,
    duration = 1000,
    hoverGrow = true,
    autoplay = false,
    interval = 6000,
    controls = true,
    accent = "var(--titi-cobalt)",
    accentForeground = "var(--on-cobalt)",
    label = "CONCEPT",
    prevLabel = "이전 컨셉",
    nextLabel = "다음 컨셉",
    panelClassName,
    style,
    ...props
}: Omit<SqueezeCarouselProps, "className">) {
    const count = slides.length;
    const wrap = (i: number) => ((i % count) + count) % count;

    const slats = clamp(count - 4, 1, 3);
    const visible = 4 + slats;

    const reduced = useReducedMotion();
    const ms = reduced ? 0 : duration;

    const ids = useId();
    const seed = useRef(0);

    const window0 = () =>
        Array.from({ length: visible }, (_, p) => ({
            key: seed.current++,
            slide: wrap(defaultIndex + p),
        }));

    const [cards, setCards] = useState<Card[]>(window0);
    const [column, setColumn] = useState(0);
    const columnRef = useRef(0);
    const forward = useRef(true);
    const [slid, setSlid] = useState(0);
    const [still, setStill] = useState(false);
    const [hover, setHover] = useState(-1);

    const open = cards[-column]?.slide ?? defaultIndex;
    const timers = useRef<number[]>([]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const settle = useCallback(() => {
        setCards((strip) =>
            forward.current ? strip.slice(-visible) : strip.slice(0, visible),
        );
        columnRef.current = 0;
        setColumn(0);
        setSlid(0);
        setStill(true);
    }, [visible]);

    useIsoLayoutEffect(() => {
        if (!still) return;
        const id = requestAnimationFrame(() => setStill(false));
        return () => cancelAnimationFrame(id);
    }, [still]);

    const step = useCallback(
        (by: number) => {
            if (count < 2 || by === 0) return;

            timers.current.forEach(clearTimeout);
            timers.current = [];
            forward.current = by > 0;

            if (by > 0) {
                setCards((strip) => [
                    ...strip,
                    ...Array.from({ length: by }, (_, k) => ({
                        key: seed.current++,
                        slide: wrap(strip[strip.length - 1].slide + 1 + k),
                    })),
                ]);
                columnRef.current -= by;
                setColumn(columnRef.current);
                setSlid((s) => s - by);
            } else {
                setCards((strip) => [
                    ...Array.from({ length: -by }, (_, k) => ({
                        key: seed.current++,
                        slide: wrap(strip[0].slide - (-by - k)),
                    })),
                    ...strip,
                ]);
                setSlid((s) => s + by);
                setStill(true);
                timers.current.push(window.setTimeout(() => setSlid(0), 0));
            }

            timers.current.push(window.setTimeout(settle, ms + 20));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [count, ms, settle],
    );

    useEffect(() => {
        onIndexChange?.(open);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    /* --- autoplay --------------------------------------------------------- */

    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!autoplay || paused || reduced || count < 2) return;
        const timer = window.setTimeout(() => step(1), interval);
        return () => clearTimeout(timer);
    }, [autoplay, paused, reduced, count, open, interval, step]);

    /* --- keyboard --------------------------------------------------------- */

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const moves: Record<string, number | undefined> = { ArrowRight: 1, ArrowLeft: -1 };
        const by = moves[event.key];
        if (by === undefined) return;
        event.preventDefault();
        step(by);
    };

    if (!count) return null;

    /* --- render ----------------------------------------------------------- */

    const slat = size(slatWidth);
    const shares = hoverGrow && hover >= 0 && hover <= 3 && !reduced ? null : SHARES;

    const shareOf = (col: number) => {
        if (shares) return SHARES[col];
        return hover === col ? STRETCHED[col] : SQUEEZED[col];
    };

    const widthOf = (col: number) => {
        if (col < 0 || col > 3) return slat;
        if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
        return `calc(var(--sq-room) * ${shareOf(col)})`;
    };

    const vars = {
        "--sq-h": size(height),
        "--sq-gap": size(gap),
        "--sq-slat-gap": size(slatGap),
        "--sq-radius": size(radius),
        "--sq-ms": `${ms}ms`,
        "--sq-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
        "--sq-fill": accent,
        "--sq-on-fill": accentForeground,
        "--sq-hero": "calc(var(--sq-h) * 16 / 9)",
        "--sq-room": `calc(100cqi - var(--sq-hero) - ${slats} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${slats} * ${slat})`,
    } as CSSProperties;

    const move = `translateX(calc(${slid} * (${slat} + var(--sq-gap))))`;

    return (
        <div
            className="flex w-full flex-col"
            style={{ containerType: "inline-size", ...vars, ...style }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
                setPaused(false);
                setHover(-1);
            }}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            {...props}
        >
            {controls && count > 1 && (
                <div className="mb-4 flex justify-end gap-2">
                    <Arrow back label={prevLabel} onClick={() => step(-1)} />
                    <Arrow label={nextLabel} onClick={() => step(1)} />
                </div>
            )}

            <div className="w-full overflow-hidden" style={{ height: "var(--sq-h)" }}>
                <div
                    role="tablist"
                    aria-label={label}
                    aria-orientation="horizontal"
                    onKeyDown={onKeyDown}
                    className="flex h-full w-max"
                    style={{
                        transform: move,
                        transition: still ? "none" : `transform var(--sq-ms) var(--sq-ease)`,
                    }}
                >
                    {cards.map((card, place) => {
                        const col = place + column;
                        const slide = slides[card.slide];
                        const front = col === 0;

                        return (
                            <button
                                key={card.key}
                                type="button"
                                role="tab"
                                id={`${ids}-tab-${card.key}`}
                                aria-selected={front}
                                aria-controls={`${ids}-panel`}
                                aria-label={slide.title}
                                tabIndex={front ? 0 : -1}
                                onMouseMove={() => hoverGrow && setHover(col)}
                                onClick={() => col > 0 && step(col)}
                                className={cn(
                                    "relative isolate h-full shrink-0 cursor-pointer overflow-hidden border-0 bg-[var(--paper-200)] p-0",
                                    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                    "focus-visible:ring-[var(--sq-fill)] focus-visible:ring-offset-[var(--paper-100)]",
                                    panelClassName,
                                )}
                                style={{
                                    width: widthOf(col),
                                    marginLeft:
                                        place === 0
                                            ? 0
                                            : col < 4
                                              ? "var(--sq-gap)"
                                              : "var(--sq-slat-gap)",
                                    borderRadius: `min(var(--sq-radius), calc(${widthOf(col)} / 2))`,
                                    transitionProperty: "width, margin-left",
                                    transitionDuration: still ? "0s" : "var(--sq-ms)",
                                    transitionTimingFunction: "var(--sq-ease)",
                                }}
                            >
                                <Picture slide={slide} />

                                {slide.overlay && (
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 pt-16 @lg:p-6 @lg:pt-20"
                                        style={{
                                            opacity: front ? 1 : 0,
                                            transition: `opacity var(--sq-ms) var(--sq-ease)`,
                                            backgroundImage:
                                                "linear-gradient(to top, rgb(0 0 0 / 0.55), transparent)",
                                        }}
                                    >
                                        {slide.overlay}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div id={`${ids}-panel`} role="tabpanel" aria-live="polite" className="mt-6 grid @xl:mt-7">
                {slides.map((slide, i) => {
                    const shown = i === open;

                    return (
                        <div
                            key={slide.id ?? i}
                            aria-hidden={!shown}
                            className={cn(
                                "col-start-1 row-start-1 flex flex-col gap-4",
                                "@xl:flex-row @xl:items-start @xl:justify-between @xl:gap-10",
                            )}
                            style={{
                                opacity: shown ? 1 : 0,
                                visibility: shown ? "visible" : "hidden",
                                pointerEvents: shown ? "auto" : "none",
                                transition: `opacity var(--sq-ms) var(--sq-ease), visibility var(--sq-ms)`,
                            }}
                        >
                            <div className="max-w-[46rem] break-keep">
                                <h3 className="t-title-kr m-0 text-[var(--ink)]">{slide.title}</h3>
                                {slide.description && (
                                    <p className="t-body mt-2 mb-0 text-[var(--ink-muted)]">{slide.description}</p>
                                )}
                            </div>

                            {slide.action && <Action slide={slide} shown={shown} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                mobile list                                 */
/* -------------------------------------------------------------------------- */

function MobileList({ slides, radius = 0 }: { slides: SqueezeSlide[]; radius?: Size }) {
    return (
        <div
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={
                {
                    "--sq-fill": "var(--titi-cobalt)",
                    "--sq-on-fill": "var(--on-cobalt)",
                } as CSSProperties
            }
        >
            {slides.map((slide, i) => (
                <article key={slide.id ?? i} className="w-[82%] shrink-0 snap-center">
                    <div
                        className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--paper-200)]"
                        style={{ borderRadius: size(radius) }}
                    >
                        {slide.image ? (
                            <img
                                src={slide.image}
                                alt={slide.imageAlt ?? ""}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover"
                                style={{ objectPosition: slide.imagePosition ?? "center" }}
                            />
                        ) : (
                            <span aria-hidden="true" className="absolute inset-0" style={{ background: slide.background }} />
                        )}
                        {slide.overlay && (
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 pt-16"
                                style={{ backgroundImage: "linear-gradient(to top, rgb(0 0 0 / 0.55), transparent)" }}
                            >
                                {slide.overlay}
                            </span>
                        )}
                    </div>
                    <h3 className="t-title-kr mt-4 mb-0 break-keep text-[var(--ink)]">{slide.title}</h3>
                    {slide.description && (
                        <p className="t-body mt-2 mb-0 break-keep text-[var(--ink-muted)]">{slide.description}</p>
                    )}
                    {slide.action && (
                        <div className="mt-4">
                            <Action slide={slide} shown />
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   pieces                                   */
/* -------------------------------------------------------------------------- */

function Picture({ slide }: { slide: SqueezeSlide }) {
    const box = { width: "var(--sq-hero)", minWidth: "100%" } as const;

    if (slide.image) {
        return (
            <img
                src={slide.image}
                alt={slide.imageAlt ?? ""}
                draggable={false}
                loading="lazy"
                className="absolute inset-y-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover"
                style={{ ...box, objectPosition: slide.imagePosition ?? "center" }}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{ background: slide.background, ...box }}
        />
    );
}

function Arrow({ back = false, label, onClick }: { back?: boolean; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
                "grid size-10 cursor-pointer place-items-center rounded-full",
                "border border-[var(--ink)] bg-transparent text-[var(--ink)]",
                "transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper-100)] outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--sq-fill)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper-100)]",
            )}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                    d={
                        back
                            ? "M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z"
                            : "M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z"
                    }
                />
            </svg>
        </button>
    );
}

function Action({ slide, shown }: { slide: SqueezeSlide; shown: boolean }) {
    const inside = (
        <>
            {slide.action}
            <svg
                width="6"
                height="9"
                viewBox="0 0 6 9"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover/sq-action:translate-x-0.5"
            >
                <path d="M1.2 1 4.7 4.5 1.2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </>
    );

    const dress = cn(
        "btn-primary group/sq-action shrink-0 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--sq-fill)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper-100)]",
    );

    if (slide.href) {
        return (
            <a
                href={slide.href}
                target={slide.target}
                rel={slide.target === "_blank" ? "noreferrer" : undefined}
                tabIndex={shown ? 0 : -1}
                onClick={slide.onAction}
                className={dress}
            >
                {inside}
            </a>
        );
    }

    return (
        <button type="button" tabIndex={shown ? 0 : -1} onClick={slide.onAction} className={dress}>
            {inside}
        </button>
    );
}

export default SqueezeCarousel;
