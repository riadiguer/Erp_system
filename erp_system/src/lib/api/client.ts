// lib/api/client.ts
export type ApiError = { 
  status: number
  statusText?: string
  detail?: string
  url?: string
  method?: string
  [key: string]: unknown
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
if (typeof window !== "undefined") console.log("API Base URL:", BASE);

// -----------------------------
// Helpers
// -----------------------------
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// If you also use header JWTs, implement this to read from storage
function getAccessToken(): string | null {
  return null; // placeholder
}

function buildHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers || {});
  const method = (init.method ?? "GET").toUpperCase();

  // Only set JSON content-type when not sending FormData and method is unsafe
  const isFormData = init.body instanceof FormData;
  if (!isFormData && method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Optional bearer
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // CSRF for unsafe methods (cookie-based auth)
  if (method !== "GET" && method !== "HEAD") {
    const csrf =
      getCookie("csrftoken") ||
      getCookie("XSRF-TOKEN") ||
      getCookie("access_csrf");
    if (csrf && !headers.has("X-CSRFToken")) {
      headers.set("X-CSRFToken", csrf); // rename if your backend expects a different header
    }
  }

  return headers;
}

async function safeJsonParse<T>(res: Response): Promise<T> {
  const txt = await res.text();
  if (!txt || res.status === 204) return {} as T;
  try {
    return JSON.parse(txt) as T;
  } catch {
    return {} as T;
  }
}

async function extractError(res: Response): Promise<Record<string, unknown>> {
  try {
    const clone = res.clone();
    return await clone.json();
  } catch {
    // fall back to raw text (e.g., HTML error pages)
    try {
      const raw = await res.text();
      return { raw };
    } catch {
      return {};
    }
  }
}

// -----------------------------
// Core fetch
// -----------------------------
async function doFetch<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init),
    credentials: "include",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const payload = await extractError(res);
    // Useful console so errors aren't silent `{}` anymore
    console.error("API Error:", {
      url,
      method: (init.method ?? "GET").toUpperCase(),
      status: res.status,
      statusText: res.statusText,
      ...payload,
    });
    throw {
      status: res.status,
      statusText: res.statusText,
      url,
      method: (init.method ?? "GET").toUpperCase(),
      ...payload,
    } as ApiError;
  }

  return await safeJsonParse<T>(res);
}

// -----------------------------
// Public API
// -----------------------------
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await doFetch<T>(path, init);
  } catch (err) {
    const error = err as ApiError
    // One-time refresh & retry on 401
    if (error?.status === 401) {
      console.warn("Got 401 → attempting refresh…");

      const csrf =
        getCookie("csrftoken") ||
        getCookie("XSRF-TOKEN") ||
        getCookie("access_csrf");

      const refreshRes = await fetch(`${BASE}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: csrf ? { "X-CSRFToken": csrf } : undefined, // change header name if needed
        // body usually not required for cookie-based refresh
      });

      if (refreshRes.ok) {
        console.info("Refresh OK → retrying original request");
        return await doFetch<T>(path, init);
      } else {
        const info = await extractError(refreshRes);
        console.error("Refresh failed:", { status: refreshRes.status, ...info });
      }
    }
    throw err;
  }
}