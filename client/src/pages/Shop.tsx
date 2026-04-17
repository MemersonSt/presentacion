import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen pt-40 px-6 md:px-20 max-w-7xl mx-auto">
      <Seo
        title="Catálogo de Arreglos Florales en Guayaquil | DIFIORI"
        description="Explora el catálogo de DIFIORI con ramos de rosas, flores mixtas, desayunos sorpresa y regalos a domicilio en Guayaquil."
        path="/shop"
        schema={shopSchema}
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
            <BreadcrumbPage>Catálogo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-[1px] bg-accent/30"></div>
          <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px]">Tienda Oficial</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif text-foreground mb-4 italic">Nuestro Catálogo</h1>
        <p className="text-foreground/50 font-serif italic text-xl">Arreglos florales diseñados para trascender.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <aside className="lg:w-72 shrink-0">
          <CategorySidebar variant="link" />
        </aside>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-primary/5 animate-pulse rounded-[3rem]" />
            ))
          ) : allProducts.length > 0 ? (
            allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-40 text-center">
               <p className="text-foreground/40 font-serif italic text-2xl mb-8">No hay productos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
