export type ApiError = { status: number; detail?: string; [k: string]: any };


export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
const base = process.env.NEXT_PUBLIC_API_URL!;
const res = await fetch(`${base}${path}`,
{
...init,
headers: {
'Content-Type': 'application/json',
...(init.headers || {}),
},
credentials: 'include', // send cookies (httpOnly access/refresh)
cache: 'no-store',
}
);


// If 401: try refresh once
if (res.status === 401) {
const refresh = await fetch(`${base}/auth/refresh/`, {
method: 'POST',
credentials: 'include',
});
if (refresh.ok) {
const retry = await fetch(`${base}${path}`, { ...init, credentials: 'include' });
if (!retry.ok) throw { status: retry.status, ...(await safeJson(retry)) } satisfies ApiError;
return (await retry.json()) as T;
}
}


if (!res.ok) throw { status: res.status, ...(await safeJson(res)) } satisfies ApiError;
return (await res.json()) as T;
}


async function safeJson(r: Response) { try { return await r.json(); } catch { return {}; } }