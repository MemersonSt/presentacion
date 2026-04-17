const VITE_SITE_URL = import.meta?.env?.VITE_SITE_URL;

export const SITE_URL = (VITE_SITE_URL || "https://difiori.com").replace(/\/$/, "");

export const DEFAULT_COMPANY = {
  name: "DIFIORI",
  email: "ventas@difiori.com.ec",
  phoneDisplay: "+593 99 798 4583",
  phoneDigits: "593997984583",
  city: "Guayaquil",
  country: "Ecuador",
};

export const DEFAULT_SEO_IMAGE = `${SITE_URL}/opengraph.jpg`;

export function absoluteUrl(path?: string | null): string {
  if (!path || path.startsWith("data:")) {
    return DEFAULT_SEO_IMAGE;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
