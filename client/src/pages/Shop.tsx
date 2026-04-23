import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { CategorySidebar } from "@/components/CategorySidebar";
import { Seo } from "@/components/Seo";
import { absoluteUrl } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "wouter";

export default function Shop() {
  const { data: allProducts = [], isLoading } = useProducts();
  const shopSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catálogo DIFIORI",
    url: "https://difiori.com/shop",
    description: "Catálogo de arreglos florales, ramos de rosas y regalos a domicilio en Guayaquil.",
    image: absoluteUrl("/opengraph.jpg"),
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
      ],
    },
  };

  return (
    <div className="page-shell">
      <Seo
        title="Catálogo de Arreglos Florales en Guayaquil | DIFIORI"
        description="Explora el catálogo de DIFIORI con ramos de rosas, flores mixtas, desayunos sorpresa y regalos a domicilio en Guayaquil."
        path="/shop"
        schema={shopSchema}
      />
      <div className="page-container">
        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/" className="transition-colors hover:text-foreground">
                Inicio
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Catálogo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="page-header">
          <div className="page-kicker">Tienda oficial</div>
          <h1 className="page-title">Nuestro Catálogo</h1>
          <p className="page-copy">Arreglos florales diseñados para trascender.</p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-14">
          <aside className="shrink-0 lg:w-72">
            <CategorySidebar variant="link" />
          </aside>

          <section className="flex-1">
            {isLoading ? (
              <div className="product-grid">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="product-skeleton" />
                ))}
              </div>
            ) : allProducts.length > 0 ? (
              <div className="product-grid">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">No hay productos disponibles en este momento.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
