"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importamos el router
import { Search, Menu, X, Play, Bell, User, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirigir al home con la búsqueda (ya que tu home es el buscador)
      // O podrías crear una página /search. Por ahora usaremos el comportamiento del home.
      window.location.href = `/?q=${encodeURIComponent(query)}`; 
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div
          className={cn(
            "backdrop-blur-xl bg-black/60 border border-white/10",
            "rounded-2xl px-6 py-4 transition-all duration-300"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Icono del Play */}
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-orange-900/20">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>

              {/* Contenedor de Texto Vertical */}
              <div className="hidden sm:flex flex-col justify-center">
                {/* Título Principal */}
                <span className="text-xl font-black text-white tracking-tight leading-none">
                  Ani<span className="text-orange-500">Stream</span>
                </span>
                {/* Tu Firma */}
                <span className="text-[0.65rem] font-bold text-neutral-500 tracking-widest uppercase leading-tight pl-[1px] group-hover:text-orange-400 transition-colors">
                  byJaredOrtiz
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-white hover:text-orange-500 transition-colors font-medium"
              >
                Inicio
              </Link>
              
              <Link 
                href="/browse" 
                className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Filter size={14} /> Explorar
              </Link>

              <Link 
                href="#trending" 
                className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1"
              >
                🔥 Tendencias
              </Link>
              
              <Link 
                href="#new" 
                className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1"
              >
                ✨ Recientes
              </Link>
              
              <Link 
                href="#classics" 
                className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1"
              >
                🏆 Top Valorados
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-200">
                    <input
                      type="text"
                      placeholder="Buscar anime..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-neutral-900/80 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-48"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-400" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Search className="w-5 h-5 text-neutral-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}