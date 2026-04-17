const DEFAULT_API_URL = "http://localhost:8081/api";

const LOCAL_MEDIA_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

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

function isPrivateIpv4(hostname: string) {
  return (
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export function shouldBypassImageOptimization(url?: string | null) {
  if (!url || !/^https?:\/\//i.test(url)) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, "");
    return LOCAL_MEDIA_HOSTS.has(hostname) || isPrivateIpv4(hostname);
  } catch {
    return false;
  }
}
