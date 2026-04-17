import { useQuery } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/api";
import { CATEGORIES, INITIAL_PRODUCTS } from "@/data/mock";

const API_URL = "/api/external/products/categories";
export const categoriesQueryKey = ["categories"] as const;
const FALLBACK_CATEGORIES = Array.from(
  new Set([...CATEGORIES.map((category) => category.name), ...INITIAL_PRODUCTS.map((product) => product.category)]),
);

export async function fetchCategories(baseUrl?: string): Promise<string[]> {
  try {
    const res = await fetch(resolveApiUrl(API_URL, baseUrl));
    if (!res.ok) throw new Error("Error al cargar categorías");

    const json = await res.json();
    if (json.status !== "success") throw new Error("Respuesta inválida del servidor");

    return json.data;
  } catch (error) {
    console.warn("Error fetching categories from API, using fallback data:", error);
    return FALLBACK_CATEGORIES;
  }
}

export function useCategories() {
  return useQuery<string[], Error>({
    queryKey: categoriesQueryKey,
    queryFn: () => fetchCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutos (las categorías no cambian muy seguido)
  });
}
