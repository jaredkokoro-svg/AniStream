'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Play, Bell, User, Filter, Flame, Sparkles, Trophy } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil
  const router = useRouter();

  // Detectar scroll para oscurecer el navbar
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
      setIsMobileMenuOpen(false); // Cerrar menú al buscar
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
      (isScrolled || isMobileMenuOpen) ? "bg-[#0a0a0a]/95 backdrop-blur-md border-white/10" : "bg-gradient-to-b from-black/80 to-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-orange-900/20">
            <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-current" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-lg md:text-xl font-black text-white tracking-tight leading-none">
              Ani<span className="text-orange-500">Stream</span>
            </span>
            <span className="text-[0.6rem] font-bold text-neutral-500 tracking-widest uppercase leading-tight pl-[1px] group-hover:text-orange-400 transition-colors hidden sm:block">
              byJaredOrtiz
            </span>
          </div>
        </Link>

        {/* 2. MENÚ DE ESCRITORIO (Se oculta en móvil: hidden md:flex) */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white hover:text-orange-500 transition-colors font-medium text-sm">Inicio</Link>
          <Link href="/browse" className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1"><Filter size={14} /> Explorar</Link>
          <Link href="/#trending" className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1">🔥 Tendencias</Link>
          <Link href="/#new" className="text-neutral-300 hover:text-orange-500 transition-colors text-sm font-medium flex items-center gap-1">✨ Recientes</Link>
        </div>

        {/* 3. BARRA DE BÚSQUEDA (Escritorio) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar anime..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-600"
            />
          </form>
        </div>

        {/* 4. ICONOS Y BOTÓN MÓVIL */}
        <div className="flex items-center gap-2 md:gap-4">
           {/* Botón Buscar Móvil (Solo visible en móvil si el menú está cerrado) */}
           {!isMobileMenuOpen && (
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white p-2">
               <Search size={20} />
             </button>
           )}

           <button className="text-neutral-300 hover:text-white transition-colors relative hidden sm:block">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 p-[2px] cursor-pointer hidden sm:block">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
               <User size={16} className="text-neutral-400" />
            </div>
          </div>

          {/* BOTÓN HAMBURGUESA (MÓVIL) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 5. MENÚ DESPLEGABLE MÓVIL (Overlay) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-200">
          <div className="p-4 space-y-4">
            
            {/* Buscador Móvil */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar anime..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </form>

            {/* Links Móviles */}
            <div className="grid gap-2">
              <MobileLink href="/" onClick={() => setIsMobileMenuOpen(false)} icon={<Play size={16}/>}>Inicio</MobileLink>
              <MobileLink href="/browse" onClick={() => setIsMobileMenuOpen(false)} icon={<Filter size={16}/>}>Explorar Géneros</MobileLink>
              <MobileLink href="/#trending" onClick={() => setIsMobileMenuOpen(false)} icon={<Flame size={16} className="text-orange-500"/>}>Tendencias</MobileLink>
              <MobileLink href="/#new" onClick={() => setIsMobileMenuOpen(false)} icon={<Sparkles size={16} className="text-yellow-500"/>}>Recién Agregados</MobileLink>
              <MobileLink href="/#classics" onClick={() => setIsMobileMenuOpen(false)} icon={<Trophy size={16} className="text-purple-500"/>}>Mejores Valorados</MobileLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Componente auxiliar para los links del menú móvil
function MobileLink({ href, onClick, children, icon }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 p-3 text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium active:scale-95"
    >
      {icon}
      {children}
    </Link>
  );
}