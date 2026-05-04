import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Banner } from "@/components/Banner";
import { Seo } from "@/components/Seo";
import { DEFAULT_COMPANY, absoluteUrl } from "@/lib/site";
import "./home-shell.css";

const HomeCatalogSection = lazy(() =>
  import("@/components/home/HomeCatalogSection").then((module) => ({ default: module.HomeCatalogSection })),
);

const HomeDeferredSections = lazy(() =>
  import("@/components/home/HomeDeferredSections").then((module) => ({ default: module.HomeDeferredSections })),
);

function CatalogFallback() {
  return (
    <section className="home-shell-catalog-fallback">
      <aside className="home-shell-catalog-fallback-sidebar">
        <div className="surface-card home-shell-catalog-fallback-desktop" />
        <div className="home-shell-catalog-fallback-mobile" />
      </aside>

      <main className="home-shell-catalog-fallback-main">
        <div id="catalogo" className="home-shell-catalog-fallback-head">
          <div className="home-shell-catalog-fallback-line" />
          <h2 className="home-shell-catalog-fallback-title">
            Catalogo de Arreglos Florales
          </h2>
          <div className="home-shell-catalog-fallback-line" />
        </div>

        <div id="product-list" className="home-shell-catalog-fallback-list">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="product-skeleton" />
            ))}
        </div>
      </main>
    </section>
  );
}

function DeferredFallback() {
  return (
    <>
      <section
        id="testimonios"
        className="deferred-section home-shell-deferred-fallback home-shell-deferred-fallback-testimonials"
      >
        <div className="home-shell-deferred-inner home-shell-deferred-inner-wide">
          <div className="home-shell-deferred-heading">
            <div className="home-shell-skeleton home-shell-skeleton-title" />
            <div className="home-shell-skeleton home-shell-skeleton-copy" />
          </div>
          <div className="home-shell-deferred-grid">
            <div className="surface-card home-shell-skeleton-card" />
            <div className="surface-card home-shell-skeleton-card" />
          </div>
        </div>
      </section>

      <section id="faq" className="deferred-section home-shell-deferred-fallback home-shell-deferred-fallback-faq">
        <div className="home-shell-deferred-inner">
          <div className="home-shell-skeleton home-shell-skeleton-title home-shell-skeleton-title-centered" />
          <div className="surface-card home-shell-skeleton-faq" />
          <div className="surface-card home-shell-skeleton-faq" />
        </div>
      </section>

      <section id="contacto" className="deferred-section home-shell-deferred-fallback home-shell-deferred-fallback-footer">
        <div className="home-shell-deferred-inner home-shell-deferred-inner-wide">
          <div className="home-shell-skeleton-footer" />
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const catalogTriggerRef = useRef<HTMLDivElement | null>(null);
  const deferredTriggerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadCatalog, setShouldLoadCatalog] = useState(false);
  const [shouldLoadDeferredSections, setShouldLoadDeferredSections] = useState(false);

  useEffect(() => {
    if (shouldLoadCatalog || typeof window === "undefined") return;
    const timer = window.setTimeout(() => setShouldLoadCatalog(true), 1000);
    return () => window.clearTimeout(timer);
  }, [shouldLoadCatalog]);

  useEffect(() => {
    if (shouldLoadDeferredSections) return;

    const target = deferredTriggerRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldLoadDeferredSections(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadDeferredSections(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadDeferredSections]);

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Florist",
        "@id": "https://difiori.com/#organization",
        name: "DIFIORI",
        url: "https://difiori.com/",
        image: absoluteUrl("/opengraph.jpg"),
        telephone: `+${DEFAULT_COMPANY.phoneDigits}`,
        email: DEFAULT_COMPANY.email,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Guayaquil",
          addressCountry: "EC",
        },
        areaServed: ["Guayaquil", "Samborondon", "Duran", "Via a la Costa"],
      },
    ],
  };

  return (
    <main className="min-h-screen overflow-clip bg-background scroll-smooth selection:bg-accent selection:text-white">
      <Seo
        title="Floristeria en Guayaquil | Arreglos Florales y Regalos a Domicilio | DIFIORI"
        description="Compra arreglos florales, ramos de flores y regalos a domicilio en Guayaquil con DIFIORI. Entregas en Guayaquil, Samborondon, Duran y Via a la Costa."
        path="/"
        schema={homeSchema}
      />
      <h1 className="sr-only">DIFIORI Floristeria Guayaquil - Arreglos Florales, Ramos de Flores y Regalos a Domicilio</h1>

      <section className="home-shell-banner-slot">
        <Banner />
      </section>

      <div className="home-shell-main">
        <div ref={catalogTriggerRef} className="sr-only" aria-hidden="true" />
        <Suspense fallback={<CatalogFallback />}>
          {shouldLoadCatalog ? <HomeCatalogSection /> : <CatalogFallback />}
        </Suspense>

        <div ref={deferredTriggerRef} className="sr-only" aria-hidden="true" />
        <Suspense fallback={<DeferredFallback />}>
          {shouldLoadDeferredSections ? <HomeDeferredSections /> : <DeferredFallback />}
        </Suspense>
      </div>
    </main>
  );
}
