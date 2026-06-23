const SCRAWN_HTTP_URL = process.env.SCRAWN_HTTP_URL || "http://localhost:8070"
const SCRAWN_KEY = process.env.SCRAWN_KEY as string

export function validator<T>(): { (): T; (value: unknown): T } {
  return ((input: unknown) => input as T) as { (): T; (value: unknown): T }
}

export async function apiGet(path: string) {
  const res = await fetch(`${SCRAWN_HTTP_URL}${path}`, {
    headers: { Authorization: `Bearer ${SCRAWN_KEY}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${SCRAWN_HTTP_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SCRAWN_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiDelete(path: string) {
  const res = await fetch(`${SCRAWN_HTTP_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SCRAWN_KEY}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}
