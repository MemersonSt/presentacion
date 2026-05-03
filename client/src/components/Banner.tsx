import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCMS } from "@/hooks/useCMS";
import { DEFAULT_COMPANY } from "@/lib/site";
import { toPublicImageUrl } from "@/lib/media";

const DEFAULT_SLIDES = [
  {
    image: "/assets/banner_collage.jpg",
    fallbackImage: "/assets/banner_collage.jpg",
    title: "Sorprende hoy. Nosotros lo entregamos por ti.",
    subtitle: "Historias reales de alegria en Guayaquil",
    cta: "Ver testimonios",
    href: "/#testimonios",
  },
  {
    image: "/assets/banner_collage.jpg",
    fallbackImage: "/assets/banner_collage.jpg",
    title: "Entregas reales personas reales.",
    subtitle: "Entrega en Guayaquil en horas",
    cta: "Comprar ahora",
    href: "/shop",
  },
];

function normalizeHeroImage(image: unknown) {
  const rawUrl =
    typeof image === "string"
      ? image
      : image && typeof image === "object" && "url" in image
        ? String((image as { url?: unknown }).url || "")
        : "";
  const url = rawUrl.trim();

  if (!url) return null;

  return {
    image: toPublicImageUrl(url),
    fallbackImage: url,
  };
}

type HeroImage = NonNullable<ReturnType<typeof normalizeHeroImage>>;

function isHeroImage(image: ReturnType<typeof normalizeHeroImage>): image is HeroImage {
  return Boolean(image);
}

export function Banner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: cms } = useCMS();

  const slides = useMemo(() => {
    if (!cms) return DEFAULT_SLIDES;

    const imageUrls = Array.isArray(cms.images)
      ? cms.images.map(normalizeHeroImage).filter(isHeroImage)
      : [];

    if (imageUrls.length === 0) return DEFAULT_SLIDES;

    return imageUrls.map((img) => ({
      image: img.image,
      fallbackImage: img.fallbackImage,
      title: cms.title || "DIFIORI",
      subtitle: cms.description || "Floristeria en Guayaquil",
      cta: "Comprar ahora",
      href: "/shop",
    }));
  }, [cms]);

  const activeSlide = slides[selectedIndex] || DEFAULT_SLIDES[0];
  const shouldAutoplay = Boolean(cms && slides.length > 1);

  useEffect(() => {
    setSelectedIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!shouldAutoplay) return;

    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % slides.length);
    }, 12000);

    return () => window.clearInterval(timer);
  }, [shouldAutoplay, slides.length]);

  return (
    <section className="relative overflow-hidden bg-[#111]">
      <div className="relative h-[calc(100svh-76px)] min-h-[440px] max-h-[620px] md:h-[82vh] md:min-h-[560px] md:max-h-none">
        <img
          src={activeSlide.image}
          alt={`Floreria DIFIORI - ${activeSlide.title}`}
          width={1024}
          height={571}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          onError={(event) => {
            const target = event.currentTarget;
            if (activeSlide.fallbackImage && target.src !== activeSlide.fallbackImage) {
              target.src = activeSlide.fallbackImage;
              return;
            }

            if (target.src !== window.location.origin + DEFAULT_SLIDES[0].image) {
              target.src = DEFAULT_SLIDES[0].image;
            }
          }}
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.86]"
        />

        <div className="absolute inset-0 bg-black/32" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/34 to-transparent" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),linear-gradient(135deg,rgba(17,17,17,0.08),rgba(17,17,17,0.42))] md:block" />

        <div className="relative z-10 flex h-full items-end pb-8 md:pb-14">
          <div className="w-full px-5 sm:px-8 md:px-16 lg:px-28 xl:px-36">
            <div className="mx-auto max-w-[25rem] text-center md:mx-0 md:max-w-3xl md:text-left">
              <div className="mb-4 inline-flex min-h-8 items-center rounded-full border border-white/16 bg-white/8 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm md:mb-5 md:px-4 md:py-2 md:text-[10px] md:tracking-[0.28em]">
                DIFIORI Guayaquil
              </div>
              <h2 className="min-h-[6.9rem] text-[2.45rem] font-semibold leading-[0.94] tracking-normal text-white md:min-h-[10.8rem] md:text-6xl lg:text-7xl">
                {activeSlide.title}
              </h2>
              <p className="mx-auto mt-4 min-h-[3.5rem] max-w-[22rem] text-base italic leading-snug text-white/72 md:mx-0 md:mt-5 md:min-h-[4.5rem] md:max-w-2xl md:text-2xl md:leading-relaxed">
                {activeSlide.subtitle}
              </p>

              <div className="mt-6 flex min-h-[128px] flex-col items-center gap-3 sm:min-h-[56px] sm:flex-row md:mt-8 md:items-start md:gap-4">
                <Link
                  href={activeSlide.href}
                  className="inline-flex min-h-[54px] w-full max-w-[230px] items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-[#3D2852]/30 transition-colors hover:bg-[#4A3362] md:min-h-[56px] md:max-w-none md:min-w-[220px] md:gap-3 md:px-8 md:py-4 md:text-sm md:tracking-[0.2em]"
                >
                  {activeSlide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[54px] w-full max-w-[230px] items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.28)] transition-colors hover:bg-[#1ebe5d] md:min-h-[56px] md:max-w-none md:gap-3 md:px-8 md:py-4 md:text-sm md:tracking-[0.2em]"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="mt-6 flex min-h-[3px] justify-center gap-3 opacity-80 md:mt-8 md:justify-start">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ver banner ${index + 1}`}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "h-[3px] rounded-full transition-all duration-300",
                      selectedIndex === index ? "w-12 bg-white" : "w-5 bg-white/35",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
