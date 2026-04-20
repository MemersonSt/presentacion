import { Link, useRoute } from "wouter";
import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CategorySidebar } from "@/components/CategorySidebar";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { Seo } from "@/components/Seo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  BEST_SELLERS_CATEGORY_SLUG,
  findCategoryNameBySlug,
  formatCategoryDisplayName,
  getCategoryDescription,
  getCategoryPath,
} from "@shared/catalog";

export default function CategoryPage() {
  const [, params] = useRoute("/categoria/:slug");
  const slug = params?.slug || "";
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const categoryName = useMemo(() => findCategoryNameBySlug(categories, slug), [categories, slug]);
  const categoryLabel = categoryName ? formatCategoryDisplayName(categoryName) : null;
  const isBestSellers = slug === BEST_SELLERS_CATEGORY_SLUG;
  const { data: allProducts = [], isLoading: isLoadingProducts } = useProducts(
    !isBestSellers && categoryName ? categoryName : undefined,
  );

  const products = useMemo(() => {
    if (!categoryName) return [];
    if (isBestSellers) return allProducts.filter((product) => product.isBestSeller);
    return allProducts.filter((product) => product.category === categoryName);
  }, [allProducts, categoryName, isBestSellers]);

  const loading = isLoadingCategories || isLoadingProducts;
  const description = categoryName ? getCategoryDescription(categoryName) : "Colección DIFIORI";
  const categoryPath = getCategoryPath(slug);
  const schema = categoryName
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: categoryLabel,
        url: `https://difiori.com${categoryPath}`,
        description,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Inicio",
              item: "https://difiori.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Catálogo",
              item: "https://difiori.com/shop",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: categoryLabel,
              item: `https://difiori.com${categoryPath}`,
            },
          ],
        },
      }
    : undefined;

  return (
    <div className="min-h-screen pt-36 px-6 md:px-20 max-w-7xl mx-auto">
      <Seo
        title={
          categoryName
            ? `${categoryLabel} en Guayaquil | Arreglos Florales DIFIORI`
            : "Categoría no encontrada | DIFIORI"
        }
        description={categoryName ? description : "La categoría solicitada no está disponible."}
        path={categoryPath}
        robots={categoryName ? "index, follow" : "noindex, nofollow"}
        schema={schema}
      />

      <Breadcrumb className="mb-10">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/shop" className="transition-colors hover:text-foreground">
              Catálogo
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryLabel || "Categoría"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {categoryName ? (
        <>
          <div className="mb-16 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-[1px] bg-accent/30"></div>
              <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px]">Colección DIFIORI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-4 italic">{categoryLabel}</h1>
            <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-2xl">{description}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            <aside className="lg:w-72 shrink-0">
              <CategorySidebar variant="link" activeCategory={categoryName} />
            </aside>

            <section className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="h-80 bg-primary/5 animate-pulse rounded-[3rem]" />
                    ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-primary/5 rounded-[3rem] border border-primary/10">
                  <p className="text-foreground/50 font-serif italic text-2xl">
                    No encontramos productos disponibles en esta categoría.
                  </p>
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <div className="py-20 text-center bg-primary/5 rounded-[3rem] border border-primary/10">
          <h1 className="text-4xl font-serif text-foreground mb-4">Categoría no encontrada</h1>
          <p className="text-foreground/60 mb-8">
            La categoría solicitada no existe o fue retirada del catálogo público.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-accent text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest"
          >
            Volver al catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
