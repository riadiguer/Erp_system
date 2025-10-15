export type ApiError = { status: number; detail?: string; [k: string]: any };

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    credentials: 'include', // send cookies (httpOnly access/refresh)
    cache: 'no-store',
  });

  // If 401: try refresh once
  if (res.status === 401) {
    const refresh = await fetch(`${base}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refresh.ok) {
      const retry = await fetch(`${base}${path}`, { ...init, credentials: 'include' });
      if (!retry.ok) {
        throw { status: retry.status, ...(await safeJson(retry)) } satisfies ApiError;
      }
      // ✅ Handle empty response on retry
      return await safeJsonParse<T>(retry);
    }
  }

  if (!res.ok) {
    throw { status: res.status, ...(await safeJson(res)) } satisfies ApiError;
  }

  // ✅ Handle empty response (for DELETE, etc.)
  return await safeJsonParse<T>(res);
}

async function safeJson(r: Response) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

// ✅ NEW: Parse JSON safely, return empty object if no content
async function safeJsonParse<T>(r: Response): Promise<T> {
  // Check if response has content
  const text = await r.text();
  
  // If empty or 204 No Content, return empty object
  if (!text || text.trim() === '' || r.status === 204) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    return {} as T;
  }
}