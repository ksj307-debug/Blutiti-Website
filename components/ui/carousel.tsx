"use client";

/**
 * Carousel (원본: shadcn carousel · embla-carousel-react)
 * 원본 대비 수정 사항
 * - shadcn Button·lucide 대신 사이트 1px 원형 화살표(CarouselPrevious/Next, 위치는 사용하는 쪽에서 지정)
 * - 처음 상태 계산을 다음 프레임으로 (effect 안에서 바로 setState 하지 않음)
 * - reInit 구독 해제 누락 수정, 화살표 aria-label 한국어
 */
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    const frame = requestAnimationFrame(() => onSelect(api));
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      cancelAnimationFrame(frame);
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props}
    />
  );
}

/** 1px 테두리 원형 화살표 (사이트 보조 버튼 톤) */
function ArrowButton({ back, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { back?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-10 cursor-pointer place-items-center rounded-full border border-[var(--ink)] bg-transparent text-[var(--ink)] transition-colors",
        "hover:bg-[var(--ink)] hover:text-[var(--paper-100)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--stone)] disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={back ? "M13 8H3m4-4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function CarouselPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return <ArrowButton back aria-label="이전" className={className} disabled={!canScrollPrev} onClick={scrollPrev} {...props} />;
}

function CarouselNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollNext, canScrollNext } = useCarousel();
  return <ArrowButton aria-label="다음" className={className} disabled={!canScrollNext} onClick={scrollNext} {...props} />;
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
