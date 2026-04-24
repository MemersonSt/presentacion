import React, { useState } from "react";
import { Link } from "wouter";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { ChevronDown, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BEST_SELLERS_CATEGORY_NAME,
  formatCategoryDisplayName,
  getCategoryPath,
} from "@shared/catalog";

interface CategorySidebarProps {
  activeCategory?: string | null;
  setActiveCategory?: (cat: string | null) => void;
  variant?: "filter" | "link";
}

export function CategorySidebar({
  activeCategory = null,
  setActiveCategory,
  variant = "filter",
}: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="w-full lg:w-72 flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const allCategories = categories || [];
  const isFilter = variant === "filter";
  const activeCategoryLabel = activeCategory ? formatCategoryDisplayName(activeCategory) : "Todas";
  const mobileOptions = [
    { label: "Todas las Colecciones", href: "/shop", value: null },
    {
      label: BEST_SELLERS_CATEGORY_NAME,
      href: getCategoryPath(BEST_SELLERS_CATEGORY_NAME),
      value: BEST_SELLERS_CATEGORY_NAME,
    },
    ...allCategories.map((name) => ({
      label: formatCategoryDisplayName(name),
      href: getCategoryPath(name),
      value: name,
    })),
  ];

  const handleFilterSelection = (value: string | null) => {
    setActiveCategory?.(value);
    setIsOpen(false);
  };

  return (
    <div className="w-full lg:w-72 flex flex-col gap-6">
      <div className="lg:hidden w-full relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-4 bg-white border border-primary/20 p-5 rounded-2xl shadow-lg text-foreground transition-all active:scale-95"
        >
          <div className="min-w-0 flex items-center gap-3 text-left">
            <Filter className="w-4 h-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-[0.32em] text-foreground/45">
                Categorías
              </span>
              <span className="block text-sm font-semibold text-accent truncate">{activeCategoryLabel}</span>
            </div>
          </div>
          <ChevronDown className={cn("w-5 h-5 shrink-0 transition-transform duration-500", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-white shadow-2xl border border-primary/20 rounded-2xl mt-3 z-40 overflow-hidden"
            >
              {mobileOptions.map((option, index) =>
                isFilter ? (
                  <button
                    key={option.label}
                    className={cn(
                      "w-full text-left p-5 hover:bg-primary/10 transition-colors font-semibold text-sm leading-snug border-b border-primary/5",
                      index === mobileOptions.length - 1 && "last:border-0",
                      activeCategory === option.value ? "text-accent bg-primary/5" : "text-foreground/70",
                    )}
                    onClick={() => handleFilterSelection(option.value)}
                  >
                    {option.label}
                  </button>
                ) : (
                  <Link
                    key={option.label}
                    href={option.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block w-full text-left p-5 hover:bg-primary/10 transition-colors font-semibold text-sm leading-snug border-b border-primary/5",
                      index === mobileOptions.length - 1 && "last:border-0",
                      activeCategory === option.value ? "text-accent bg-primary/5" : "text-foreground/70",
                    )}
                  >
                    {option.label}
                  </Link>
                ),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="surface-card sticky top-32 hidden max-h-[calc(100vh-10rem)] flex-col gap-4 overflow-hidden p-6 lg:flex">
        <h3 className="mb-6 flex items-center gap-3 px-2 font-serif text-3xl font-bold text-foreground">
          Colecciones
        </h3>
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
          {mobileOptions.map((option) =>
            isFilter ? (
              <button
                key={option.label}
                className={cn(
                  "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl px-5 py-4 text-left text-[1.02rem] font-semibold leading-snug transition-all duration-300",
                  activeCategory === option.value
                    ? "bg-primary/20 text-accent shadow-sm"
                    : "text-foreground/72 hover:bg-primary/10 hover:text-foreground border border-transparent",
                )}
                onClick={() => setActiveCategory?.(option.value)}
              >
                <span className="relative z-10">{option.label}</span>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500 relative z-10 shrink-0",
                    activeCategory === option.value ? "bg-accent scale-125" : "bg-primary/45 group-hover:bg-accent/70 group-hover:scale-110",
                  )}
                ></div>
              </button>
            ) : (
              <Link
                key={option.label}
                href={option.href}
                className={cn(
                  "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl px-5 py-4 text-left text-[1.02rem] font-semibold leading-snug transition-all duration-300",
                  activeCategory === option.value
                    ? "bg-primary/20 text-accent shadow-sm"
                    : "text-foreground/72 hover:bg-primary/10 hover:text-foreground border border-transparent",
                )}
              >
                <span className="relative z-10">{option.label}</span>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500 relative z-10 shrink-0",
                    activeCategory === option.value ? "bg-accent scale-125" : "bg-primary/45 group-hover:bg-accent/70 group-hover:scale-110",
                  )}
                ></div>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
