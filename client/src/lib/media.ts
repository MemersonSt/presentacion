import { getPublicAppConfig } from "@/lib/runtime-config";

function normalizeUrl(value?: string | null) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.replace(/\/$/, "") : "";
}

function getKnownOrigins() {
  const { siteUrl, assetBaseUrl } = getPublicAppConfig();
  return [siteUrl, assetBaseUrl]
    .map((value) => normalizeUrl(value))
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

export function toPublicImageUrl(source?: string | null) {
  const value = String(source || "").trim();
  if (!value) return "";
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("/image-proxy?")) return value;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const target = new URL(value);
      if (getKnownOrigins().includes(target.origin)) {
        return value;
      }
    } catch {
      return value;
    }

    return `/image-proxy?url=${encodeURIComponent(value)}`;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  const { assetBaseUrl } = getPublicAppConfig();
  return assetBaseUrl ? `${assetBaseUrl}${normalizedPath}` : normalizedPath;
}
