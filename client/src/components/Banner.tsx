import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";

const slides = [
  {
    image: "/assets/banner1.png",
    title: "Hoy haces su día especial 🌸",
    subtitle: "Entrega en Guayaquil en horas",
    cta: "Comprar ahora",
    color: "pink"
  },
  {
    image: "/assets/banner2.png",
    title: "El despertar perfecto 🥐",
    subtitle: "Desayunos sorpresa que enamoran",
    cta: "Ver desayunos",
    color: "orange"
  },
  {
    image: "/assets/banner3.png",
    title: "Celebra con elegancia ✨",
    subtitle: "Arreglos exclusivos para momentos únicos",
    cta: "Más vendidos",
    color: "purple"
  }
];

export function Banner() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  return (
    <div className="overflow-hidden relative h-[80vh] md:h-screen" ref={emblaRef}>
      <div className="flex h-full">
        {slides.map((slide, index) => (
          <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
            <img 
              src={slide.image} 
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <div className="max-w-4xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl"
                >
                  {slide.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl md:text-3xl text-white/90 mb-10 font-medium tracking-wide"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col md:flex-row gap-6 justify-center items-center"
                >
                  <button className="bg-[#5A3F73] hover:bg-[#4A3362] text-[#E6E6E6] px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 border border-[#E6E6E6]/10">
                    {slide.cta} <ArrowRight className="w-5 h-5" />
                  </button>
                  <a 
                    href="https://wa.me/593987654321" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-[#E6E6E6] border border-[#E6E6E6]/20 px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-3"
                  >
                    WhatsApp directo <MessageSquare className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
