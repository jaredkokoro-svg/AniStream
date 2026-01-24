'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Importamos los iconos necesarios
import { Search, Menu, X, Play, Bell, User, Filter, Flame, Sparkles, Trophy, Crown, LogOut } from 'lucide-react';
// Importamos supabase (asegúrate de que lib/supabase.ts exista y exporte 'supabase')
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  user?: any;
  isGuest?: boolean;
}

export const Navbar = ({ user, isGuest }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userMode');
    localStorage.removeItem('userData');
    router.push('/');
  };

  // Clases dinámicas: SIEMPRE VIDRIO
  const navClasses = `fixed top-0 w-full z-50 transition-all duration-500 border-b ${
    (isScrolled || isMobileMenuOpen) 
      ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-lg" // Scroll: Vidrio más oscuro y sólido
      : "bg-black/30 backdrop-blur-md border-white/5"            // Top: Vidrio más suave pero VISIBLE siempre
  }`;

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 md:px-6 h-24 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <Link href="/home" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 md:w-14 md:h-14 rounded-xl bg-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-orange-900/20">
            <Play className="w-4 h-8 md:w-8 md:h-8 text-white fill-current" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-lg md:text-4xl font-black text-white tracking-tight leading-none">
              Ani<span className="text-orange-500">Stream</span>
            </span>
            <span className="text-[0.55rem] md:text-xs font-bold text-neutral-500 tracking-widest uppercase leading-tight pl-[8px] group-hover:text-orange-400 transition-colors block">
              byJaredOrtiz
            </span>
          </div>
        </Link>

        {/* MENÚ ESCRITORIO */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/home" className="text-white hover:text-orange-500 transition-colors font-medium text-lg">Inicio</Link>
          <Link href="/browse" className="text-neutral-300 hover:text-orange-500 transition-colors text-lg font-medium flex items-center gap-1"><Filter size={14} /> Explorar</Link>
          {!isGuest && (
             <Link href="/favorites" className="text-neutral-300 hover:text-orange-500 transition-colors text-lg font-medium flex items-center gap-1">Mi Lista</Link>
          )}
        </div>

        {/* BUSCADOR */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar anime..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900/50 border border-white/10 rounded-full py-4 pl-10 pr-5 text-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-600"
            />
          </form>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2 md:gap-4">
           {!isMobileMenuOpen && (
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white p-2">
               <Search size={20} />
             </button>
           )}

           {/* LÓGICA INVITADO vs USUARIO */}
           {isGuest ? (
             <div className="flex items-center gap-3">
                <Link href="/" className="hidden lg:block text-xs font-bold text-neutral-300 hover:text-white uppercase tracking-wide">
                  Acceder
                </Link>
                <Link href="/" className="flex items-center gap-2 bg-[#f47521] hover:bg-[#ff8f45] text-black px-3 py-1.5 md:px-4 md:py-1.5 rounded-sm transition-transform active:scale-95 group">
                  <Crown size={16} className="fill-black group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col leading-none hidden sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Prueba Gratis</span>
                    <span className="text-[10px] font-medium opacity-80">Premium</span>
                  </div>
                  <span className="sm:hidden text-xs font-bold">PREMIUM</span>
                </Link>
             </div>
           ) : (
             <>
                <button className="text-neutral-300 hover:text-white transition-colors relative hidden sm:block">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                </button>
                
                <div className="group relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 p-[2px] cursor-pointer">
                    <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden font-bold text-white select-none">
                       {user?.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : <User size={16} />)}
                    </div>
                  </div>

                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-white font-bold truncate">{user?.user_metadata?.full_name || user?.name || "Usuario"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || "Miembro"}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors first-letter:rounded-b-xl"
                      >
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                  </div>
                </div>
             </>
           )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors ml-1"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-white/10 shadow-2xl h-[calc(100vh-4rem)] bg-opacity-95 backdrop-blur-xl overflow-y-auto">
          <div className="p-4 space-y-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input 
                type="text" 
                placeholder="¿Qué quieres ver hoy?" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full bg-neutral-800/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-500"
              />
            </form>

            <div className="grid gap-2">
              <MobileLink href="/home" onClick={() => setIsMobileMenuOpen(false)} icon={<Play size={20}/>}>Inicio</MobileLink>
              <MobileLink href="/browse" onClick={() => setIsMobileMenuOpen(false)} icon={<Filter size={20}/>}>Explorar Géneros</MobileLink>
              {!isGuest && (
                 <MobileLink href="/favorites" onClick={() => setIsMobileMenuOpen(false)} icon={<Trophy size={20} className="text-purple-500"/>}>Mi Lista</MobileLink>
              )}
              <div className="my-4 border-t border-white/10"></div>
              {isGuest ? (
                 <MobileLink href="/" onClick={() => setIsMobileMenuOpen(false)} icon={<Crown size={20} className="text-orange-500"/>}>Registrarse / Entrar</MobileLink>
              ) : (
                 <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-2xl transition-all font-medium active:scale-95 text-lg w-full text-left"
                 >
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                     <LogOut size={20}/>
                   </div>
                   Cerrar Sesión
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

function MobileLink({ href, onClick, children, icon }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 p-4 text-neutral-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-medium active:scale-95 text-lg"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      {children}
    </Link>
  );
}