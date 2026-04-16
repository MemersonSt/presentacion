import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useLocation } from "wouter";
import { getProductPath } from "@shared/catalog";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const { data: allProducts = [] } = useProducts();
  const [, setLocation] = useLocation();

  // Filtrado de productos en tiempo real
  const filteredProducts = query.trim() === "" 
    ? [] 
    : allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);

  const handleSelectProduct = (productPath: string) => {
    onClose();
    setLocation(productPath);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#111111]/90 backdrop-blur-2xl flex flex-col items-center pt-32 px-6"
        >
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 p-4 text-white/40 hover:text-white transition-colors group"
          >
            <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          </button>

          <div className="w-full max-w-4xl">
            {/* Input Area */}
            <div className="relative mb-20">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="absolute -bottom-4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5A3F73] to-transparent"
              />
              <div className="flex items-center gap-6">
                <Search className="w-10 h-10 text-[#5A3F73]" strokeWidth={2.5} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="¿Qué arreglo buscas hoy?..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-4xl md:text-6xl font-serif text-white outline-none placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleSelectProduct(getProductPath(product))}
                    className="flex gap-6 items-center p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-[#5A3F73]/40 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="w-24 h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#5A3F73] font-black text-[9px] uppercase tracking-widest mb-1">{product.category}</p>
                      <h4 className="text-white font-bold text-lg leading-tight mb-2">{product.name}</h4>
                      <p className="text-white/40 font-bold text-sm">{product.price}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-[#5A3F73] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {query.trim() !== "" && filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <p className="text-white/20 text-2xl font-serif italic">No hemos encontrado resultados para "{query}"</p>
                </div>
              )}

              {query.trim() === "" && (
                 <div className="col-span-full py-10 flex flex-col items-center">
                   <Sparkles className="w-12 h-12 text-[#5A3F73]/30 mb-6 animate-pulse" />
                   <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">Explora nuestra colección exclusiva</p>
                 </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
