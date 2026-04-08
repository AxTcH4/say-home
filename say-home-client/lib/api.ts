
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Récupérer les derniers biens - Home Page
export const getLatestProperties = async () => {
  const res = await fetch(`${API_URL}/api/properties/latest`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data.data;
};

// Récupérer tous les biens - Liste des biens
export const getAllProperties = async (filters?: {
  minPrice?: string;
  maxPrice?: string;
}) => {
  const params = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${API_URL}/api/properties?${params}`);
  console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return data.data;
};

// Récupérer un bien par ID - Détail
export const getPropertyById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/properties/${id}`);
    console.log(`RESPONSE STATUS CODE: ${res.status}`);
  if (res.status === 404) return null;
  const data = await res.json();
  return { property: data.data, similar: data.similar };
};