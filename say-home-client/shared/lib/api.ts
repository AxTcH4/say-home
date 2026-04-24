import { ok } from "assert";
import { error } from "console";
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

//TODO: fix NEXT_PUBLIC_API_URL

// Récupérer les derniers biens - Home Page
export const getLatestProperties = async () => {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/properties/latest`, {  method: "GET", credentials: "include",
  });
  console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data;
};



export const searchProperties = async (data: any) => {


    const urlParams = new URLSearchParams({
    title: data.title || "",
    type: data.type || "",
    secteur: data.secteur || "",
    minPrice: String(data.minPrice),
    maxPrice: String(data.maxPrice),
  }).toString();

  console.log("urlParams", urlParams);

  const url = `${NEXT_PUBLIC_API_URL}/properties/search?${urlParams}`;
  const res = await fetch(url,  {  method: "GET", credentials: "include",
  });

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: await res.text(),
    }
  }

  const result = await res.json();
  return result;
  
};

export const getAllProperties = async (filters?: {
  minPrice?: string;
  maxPrice?: string;
}) => {
  const params = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/properties?${params}`, {  method: "GET", credentials: "include",
  });
  console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data.data;
  return [];
};

// Récupérer un bien par ID - Détail
export const getPropertyById = async (id: string) => {
  const res = await fetch(`${NEXT_PUBLIC_API_URL}/properties/${id}`,  {  method: "GET", credentials: "include",
  });
    console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return { property: data.data, similar: data.similar };
};