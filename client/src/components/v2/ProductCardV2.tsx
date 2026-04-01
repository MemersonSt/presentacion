import React from "react";
import { type Product } from "@/data/mock";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface ProductCardV2Props {
  product: Product;
}

export function ProductCardV2({ product }: ProductCardV2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <Link href={`/v2/product/${product.id}`}>
        <div className="relative aspect-[2/3] overflow-hidden bg-[#F3F0EC] mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
          
          {/* Minimal Hover Overlay */}
          <div className="absolute inset-0 bg-[#2C2C2B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <button className="absolute bottom-6 right-6 w-12 h-12 bg-white text-[#2C2C2B] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-sm hover:bg-[#2C2C2B] hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
          
          {product.isBestSeller && (
            <span className="absolute top-6 left-6 text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-[#2C2C2B] text-white">
              Limited
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-[#2C2C2B] font-serif text-lg tracking-tight group-hover:text-[#A8988A] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[#A8988A] text-[11px] font-medium uppercase tracking-widest">
              {product.category}
            </span>
            <span className="text-[#2C2C2B] font-medium text-sm">
              {product.price}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
