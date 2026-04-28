export async function apiFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      headers.set("Cookie", `token=${token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
