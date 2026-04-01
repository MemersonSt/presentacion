import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";

export function NavbarV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-[#E5DACD]/50"
          : "bg-white/60 backdrop-blur-md"
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 h-20 flex items-center justify-between gap-8">

        {/* ── LEFT NAV ── */}
        <ul className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-[#2C2C2B]">
          <li>
            <Link
              href="/v2"
              className="hover:text-[#A8988A] transition-colors duration-300 relative group"
            >
              Colecciones
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
            </Link>
          </li>
          <li>
            <Link
              href="/v2"
              className="hover:text-[#A8988A] transition-colors duration-300 relative group"
            >
              La Maison
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
            </Link>
          </li>
          <li>
            <Link
              href="/v2"
              className="hover:text-[#A8988A] transition-colors duration-300 relative group"
            >
              Novedades
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
            </Link>
          </li>
        </ul>

        {/* ── CENTER LOGO ── */}
        <Link href="/v2" className="flex-shrink-0 mx-auto lg:mx-0">
          <Logo
            variant="dark"
            size="md"
            className={cn(
              "transition-all duration-500",
              scrolled ? "scale-90" : "scale-100"
            )}
          />
        </Link>

        {/* ── RIGHT NAV + TOOLS ── */}
        <div className="flex items-center gap-6 lg:gap-8">
          <ul className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-[#2C2C2B]">
            <li>
              <Link href="/v2" className="hover:text-[#A8988A] transition-colors duration-300 relative group">
                Ramos
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
            <li>
              <Link href="/v2" className="hover:text-[#A8988A] transition-colors duration-300 relative group">
                Desayunos
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
            <li>
              <Link href="/v2" className="hover:text-[#A8988A] transition-colors duration-300 relative group">
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A8988A] group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
          </ul>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] h-5 bg-[#E5DACD]" />

          {/* Search */}
          <button className="hidden lg:flex items-center gap-1.5 text-[#2C2C2B] hover:text-[#A8988A] transition-colors duration-300">
            <Search className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Buscar</span>
          </button>

          {/* Cart */}
          <Link href="/v2" className="relative text-[#2C2C2B] hover:text-[#A8988A] transition-colors duration-300">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#2C2C2B] text-white text-[8px] font-black rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-[#2C2C2B]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5DACD] shadow-2xl px-8 py-10 flex flex-col gap-6">
          {["Colecciones", "La Maison", "Novedades", "Ramos", "Desayunos", "Contacto"].map((item) => (
            <Link
              key={item}
              href="/v2"
              onClick={() => setIsOpen(false)}
              className="text-base font-serif text-[#2C2C2B] border-b border-[#E5DACD]/50 pb-4 hover:text-[#A8988A] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
