export interface ProductLike {
  id: string | number;
  name: string;
  category?: string;
  isBestSeller?: boolean;
}

export const BEST_SELLERS_CATEGORY_NAME = "Más Vendidos";
export const BEST_SELLERS_CATEGORY_SLUG = "mas-vendidos";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "ramos-de-rosas": "Ramos de rosas frescas con entrega a domicilio en Guayaquil para aniversarios, cumpleaños y ocasiones especiales.",
  "flores-mixtas": "Arreglos de flores mixtas con diseños elegantes y entrega a domicilio en Guayaquil.",
  "desayunos-sorpresa": "Desayunos sorpresa y regalos a domicilio en Guayaquil para cumpleaños, aniversarios y momentos especiales.",
  "regalos-con-vino": "Regalos con vino y arreglos florales para sorprender en Guayaquil con entrega a domicilio.",
  cumpleanos: "Arreglos florales y regalos de cumpleaños en Guayaquil con entrega rápida.",
  "amor-y-aniversario": "Flores y regalos para aniversarios y ocasiones románticas con entrega a domicilio en Guayaquil.",
  [BEST_SELLERS_CATEGORY_SLUG]: "Selección de arreglos florales y regalos más vendidos en Guayaquil.",
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategorySlug(name: string) {
  if (name === BEST_SELLERS_CATEGORY_NAME) return BEST_SELLERS_CATEGORY_SLUG;
  return slugify(name);
}

export function getCategoryPath(nameOrSlug: string) {
  const slug = nameOrSlug.includes("/") ? nameOrSlug.split("/").pop() || nameOrSlug : nameOrSlug;
  const normalized = slug === BEST_SELLERS_CATEGORY_NAME ? BEST_SELLERS_CATEGORY_SLUG : slugify(slug);
  return `/categoria/${normalized}`;
}

export function getCategoryDescription(name: string) {
  const slug = getCategorySlug(name);
  return CATEGORY_DESCRIPTIONS[slug] || `Colección de ${name.toLowerCase()} con entrega a domicilio en Guayaquil.`;
}

export function findCategoryNameBySlug(categories: string[], slug: string) {
  if (slug === BEST_SELLERS_CATEGORY_SLUG) return BEST_SELLERS_CATEGORY_NAME;
  return categories.find((category) => getCategorySlug(category) === slug) || null;
}

export function getProductSlug(product: ProductLike) {
  return `${slugify(product.name)}-${product.id}`;
}

export function getProductPath(product: ProductLike) {
  return `/producto/${getProductSlug(product)}`;
}

export function getProductIdFromSlug(slug: string) {
  const segments = slug.split("-");
  return segments[segments.length - 1] || "";
}
