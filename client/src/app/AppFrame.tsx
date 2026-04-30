import { Suspense, lazy, useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })),
);

const FACEBOOK_PIXEL_ID = "1783051885578047";

type FacebookPixel = ((action: string, eventName: string) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => number;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: typeof window.fbq;
  }
}

function initFacebookPixel() {
  if (typeof window === "undefined" || typeof document === "undefined" || typeof window.fbq === "function") {
    return;
  }

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue.push(args);
  } as FacebookPixel;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = (...args: unknown[]) => fbq.queue.push(args);

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", FACEBOOK_PIXEL_ID);
  fbq("track", "PageView");
}

function isMeaningfulInteraction(event: Event) {
  if (event.type === "scroll") {
    return typeof window !== "undefined" && window.scrollY > 24;
  }

  return true;
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

interface AppFrameProps {
  Routes: ComponentType;
  fallback?: ReactNode;
}

export function AppFrame({ Routes, fallback = <RouteFallback /> }: AppFrameProps) {
  const [location] = useLocation();
  const hasTrackedInitialPageView = useRef(false);
  const hasInitializedPixel = useRef(false);
  const hideNavbar = location === "/checkout" || location === "/payment-gateway" || location === "/payment-result";

  useEffect(() => {
    if (hasInitializedPixel.current || typeof window === "undefined") return;
    let interactionCleanup = () => {};
    let fallbackTimeout = 0;

    const bootPixel = () => {
      if (hasInitializedPixel.current) return;
      hasInitializedPixel.current = true;
      interactionCleanup();
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout);
      initFacebookPixel();
    };

    const setupDeferredBoot = () => {
      const interactionEvents: Array<keyof WindowEventMap> = [
        "pointerdown",
        "keydown",
        "touchstart",
        "scroll",
      ];

      const onInteraction = (event: Event) => {
        if (!isMeaningfulInteraction(event)) return;
        bootPixel();
      };

      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, onInteraction, {
          passive: true,
          once: true,
        });
      });

      interactionCleanup = () => {
        interactionEvents.forEach((eventName) => {
          window.removeEventListener(eventName, onInteraction);
        });
      };

      // Fallback para sesiones sin interacción.
      fallbackTimeout = window.setTimeout(bootPixel, 8000);
    };

    if (document.readyState === "complete") {
      setupDeferredBoot();
      return () => {
        interactionCleanup();
        if (fallbackTimeout) window.clearTimeout(fallbackTimeout);
      };
    }

    const onLoad = () => setupDeferredBoot();

    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      interactionCleanup();
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout);
    };
  }, []);

  useEffect(() => {
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      return;
    }

    if (typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [location]);

  return (
    <div className="relative min-h-screen text-foreground selection:bg-[#5A3F73] selection:text-white">
      <div className="relative z-10">
        {!hideNavbar && <Navbar />}
        <Suspense fallback={fallback}>
          <Routes />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </div>
  );
}
