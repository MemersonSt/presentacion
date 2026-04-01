import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Layout, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export function PresentationToggle() {
  const [location, setLocation] = useLocation();
  const isV2 = location.startsWith("/v2");

  const toggleVersion = () => {
    if (isV2) {
      setLocation("/");
    } else {
      setLocation("/v2");
    }
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.8 }}
      className="fixed bottom-10 left-10 z-[200] group"
    >
      <button
        onClick={toggleVersion}
        className={cn(
          "flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl transition-all duration-500 border border-white/10",
          isV2 
            ? "bg-[#2C2C2B] text-white hover:bg-[#A8988A]" 
            : "bg-[#5A3F73] text-[#E6E6E6] hover:bg-[#3D2852]"
        )}
      >
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
            Presentación
          </span>
          <span className="text-xs font-bold tracking-widest flex items-center gap-2">
            Ver {isV2 ? "Propuesta 1 (Dark)" : "Propuesta 2 (Light)"}
            <Palette className="w-4 h-4 ml-2" />
          </span>
        </div>
      </button>
      
      {/* Tooltip hint */}
      <div className="absolute left-0 bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 pointer-events-none">
          <div className="bg-[#2C2C2B]/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
             Cambia el diseño instantáneamente
          </div>
      </div>
    </motion.div>
  );
}
