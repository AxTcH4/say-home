const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

async function readError(response: Response, fallback: string) {
  const error = await readJson(response);
  return error?.message ?? error?.error ?? fallback;
}

export async function getLatestProperties() {
  const res = await fetch(buildUrl("/properties/latest"), {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 404) return null;
  return await res.json();
}

export async function searchProperties(data: {
  title?: string;
  type?: string;
  secteur?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
}) {
  const urlParams = new URLSearchParams({
    title: data.title || "",
    type: data.type || "",
    secteur: data.secteur || "",
    minPrice: String(data.minPrice ?? ""),
    maxPrice: String(data.maxPrice ?? ""),
  }).toString();

  const res = await fetch(buildUrl(`/properties/search?${urlParams}`), {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: await readError(res, "Unable to search properties"),
    };
  }

  return await res.json();
}

export async function getAllProperties(filters?: {
  minPrice?: string;
  maxPrice?: string;
}) {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  const res = await fetch(buildUrl(`/properties${params ? `?${params}` : ""}`), {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 404) return null;
  const data = await res.json();
  return data.data;
}

export async function getPropertyById(id: string) {
  const res = await fetch(buildUrl(`/properties/${id}`), {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 404) return null;
  const data = await res.json();
  return { property: data.data, similar: data.similar };
}

export async function createVisitRequest(payload: {
  propertyId: number;
  date: string;
  time: string;
  message: string;
}) {
  const res = await fetch(buildUrl("/appointments/requests"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Unable to create visit request"));
  }

  const data = await res.json();
  return data.data;
}

export async function getMyVisitRequests() {
  const res = await fetch(buildUrl("/appointments/requests/me"), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    return [];
  }

  if (!res.ok) {
    throw new Error(await readError(res, "Unable to load visit requests"));
  }

  const data = await res.json();
  return data.data ?? [];
}
