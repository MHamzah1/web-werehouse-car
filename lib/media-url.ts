const DEFAULT_API_URL = "http://localhost:8081/api";

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
}

export function getMediaBaseUrl() {
  const explicitMediaUrl = process.env.NEXT_PUBLIC_API_URL_IMAGES?.trim();
  const rawBaseUrl = (explicitMediaUrl || getApiBaseUrl()).replace(/\/+$/, "");

  return rawBaseUrl.replace(/\/api$/, "");
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return "";
  }

  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const baseUrl = getMediaBaseUrl();
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
