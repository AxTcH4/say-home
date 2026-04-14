import { ok } from "assert";
import { error } from "console";
const API_URL = process.env.API_URL || "http://localhost:8080";

//TODO: fix API_URL

// Récupérer les derniers biens - Home Page
export const getLatestProperties = async () => {
  const res = await fetch(`${API_URL}/api/properties`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data.data;
};


export const searchProperties = async (data: any) => {


    const urlParams = new URLSearchParams({
    title: data.title || "",
    type: data.type || "",
    secteur: data.secteur || "",
    minPrice: String(data.minPrice),
    maxPrice: String(data.maxPrice),
  }).toString();
  const url = `${API_URL}/api/properties/search?${urlParams}`;

  const res = await fetch(url);


  console.log(`RESPONSE STATUS CODE: ${res.status}`);

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: await res.text(),
    }
  }

  const result = await res.json();
  console.log(`RESULT: ${JSON.stringify(result)}`);
  return result;
  
};


// Récupérer tous les biens - Liste des biens
export const getAllProperties = async (filters?: {
  minPrice?: string;
  maxPrice?: string;
}) => {
  const params = new URLSearchParams(filters as any).toString();
  // const res = await fetch(`${API_URL}/api/properties?${params}`);
  // console.log(`RESPONSE STATUS CODE: ${res.status}`);
  // if (res.status === 404) return null;
  // const data = await res.json();
  // return data.data;
  return [];
};

// Récupérer un bien par ID - Détail
export const getPropertyById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/properties/${id}`);
    console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return { property: data.data, similar: data.similar };
};