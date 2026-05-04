import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { DEFAULT_COMPANY } from "@/lib/site";
import "./banner.css";

const FIXED_BANNER = {
  mobileImage: "/assets/banner_collage_mobile.webp",
  desktopImage: "/assets/banner_collage_desktop.webp",
  title: "Sorprende hoy. Nosotros lo entregamos por ti.",
  subtitle: "Historias reales de alegria en Guayaquil",
  cta: "Ver testimonios",
  href: "/#testimonios",
};

export function Banner() {
  return (
    <section className="hero-banner">
      <div className="hero-banner-stage">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={FIXED_BANNER.desktopImage}
            type="image/webp"
            sizes="100vw"
          />
          <source
            srcSet={FIXED_BANNER.mobileImage}
            type="image/webp"
            sizes="100vw"
          />
          <img
            src={FIXED_BANNER.mobileImage}
            alt={`Floreria DIFIORI - ${FIXED_BANNER.title}`}
            width={1024}
            height={571}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            className="hero-banner-image"
          />
        </picture>

        <div className="hero-banner-overlay hero-banner-overlay-soft" />
        <div className="hero-banner-overlay hero-banner-overlay-gradient" />
        <div className="hero-banner-overlay hero-banner-overlay-desktop" />

        <div className="hero-banner-content-wrap">
          <div className="hero-banner-content-padding">
            <div className="hero-banner-content">
              <div className="hero-banner-kicker">
                DIFIORI Guayaquil
              </div>
              <h2 className="hero-banner-title">
                {FIXED_BANNER.title}
              </h2>
              <p className="hero-banner-subtitle">
                {FIXED_BANNER.subtitle}
              </p>

              <div className="hero-banner-actions">
                <Link
                  href={FIXED_BANNER.href}
                  className="hero-banner-btn hero-banner-btn-primary"
                >
                  {FIXED_BANNER.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-banner-btn hero-banner-btn-whatsapp"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
