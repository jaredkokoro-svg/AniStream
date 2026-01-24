'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  
  // Estado para controlar qué vista mostramos: 'login', 'register' o 'forgot'
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- 1. INICIAR SESIÓN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/'); // Si todo sale bien, mandar al Home
      router.refresh();
    }
  };

  // --- 2. REGISTRARSE ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirigir aquí después de confirmar email (si lo activas en el futuro)
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Cuenta creada! Revisa tu correo o inicia sesión.');
      setView('login');
    }
    setLoading(false);
  };

  // --- 3. RECUPERAR CONTRASEÑA ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Te hemos enviado un enlace a tu correo para restablecer tu contraseña.');
      setView('login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* FONDO ANIMADO (Decorativo) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

      {/* TARJETA DE AUTH */}
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 p-3 bg-neutral-900/50 rounded-2xl hover:bg-neutral-800 transition-colors">
             <ArrowLeft className="text-neutral-400" size={20} />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            {view === 'login' && 'Bienvenido de nuevo'}
            {view === 'register' && 'Crea tu cuenta'}
            {view === 'forgot' && 'Recuperar acceso'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {view === 'login' && 'Accede a tu lista y continúa viendo donde lo dejaste.'}
            {view === 'register' && 'Únete gratis y sincroniza tus animes en todos tus dispositivos.'}
            {view === 'forgot' && 'Ingresa tu correo y te enviaremos un enlace mágico.'}
          </p>
        </div>

        {/* MENSAJES DE ERROR O ÉXITO */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handleResetPassword} className="space-y-4">
          
          {/* INPUT EMAIL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                placeholder="otaku@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:bg-neutral-900 transition-all"
              />
            </div>
          </div>

          {/* INPUT PASSWORD (No visible en 'Recuperar') */}
          {view !== 'forgot' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:bg-neutral-900 transition-all"
                />
              </div>
            </div>
          )}

          {/* BOTÓN "OLVIDÉ MI CONTRASEÑA" */}
          {view === 'login' && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setView('forgot')}
                className="text-xs font-bold text-neutral-400 hover:text-orange-500 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* BOTÓN PRINCIPAL */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {view === 'login' && 'Entrar'}
                {view === 'register' && 'Crear Cuenta'}
                {view === 'forgot' && 'Enviar Enlace'}
                {!loading && <ArrowRight size={20} />}
              </>
            )}
          </button>
        </form>

        {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-sm">
            {view === 'login' ? "¿No tienes cuenta? " : view === 'register' ? "¿Ya tienes cuenta? " : "¿Ya te acordaste? "}
            <button 
              onClick={() => setView(view === 'login' ? 'register' : 'login')}
              className="font-bold text-white hover:text-orange-500 transition-colors"
            >
              {view === 'login' ? "Regístrate gratis" : "Inicia Sesión"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}