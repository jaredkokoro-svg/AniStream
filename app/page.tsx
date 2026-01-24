'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Asegúrate de que esta ruta sea correcta según donde creaste el archivo (lib o utils)
import { supabase } from '../lib/supabase'; 

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Registro
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lógica para invitado (sin tocar Supabase)
  const handleGuestAccess = () => {
    localStorage.setItem('userMode', 'guest');
    localStorage.removeItem('sb-auth-token'); // Limpiamos sesión anterior si hubiera
    router.push('/home');
  };

  // Lógica de Autenticación con Supabase
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- INICIAR SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        // Si no hay error, Supabase gestiona la sesión solo.
        localStorage.setItem('userMode', 'registered'); // Para que tu Home sepa qué mostrar
        router.push('/home');

      } else {
        // --- REGISTRARSE ---
        if (!formData.name) throw new Error("Por favor escribe tu nombre.");

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            // AQUÍ es donde se guarda el nombre en la tabla de usuarios
            data: {
              full_name: formData.name,   // Estándar de Supabase
              display_name: formData.name // Para asegurar que lo veas en tu columna
            },
          },
        });

        if (error) throw error;

        localStorage.setItem('userMode', 'registered');
        router.push('/home');
      }
    } catch (error: any) {
      alert(error.message || "Ocurrió un error al intentar ingresar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      
      <div className="w-full max-w-md bg-[#111] border border-gray-800 rounded-3xl p-8 shadow-2xl relative">
        
        {/* Botón Volver / Invitado */}
        <button 
          onClick={handleGuestAccess}
          className="absolute top-6 left-6 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
          title="Entrar como invitado"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="mt-8 mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Accede a tu lista y continúa viendo donde lo dejaste.' 
              : 'Únete para guardar tus animes favoritos.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* INPUT NOMBRE (Solo visible en Registro) */}
          {!isLogin && (
            <div className="space-y-2 animate-fade-in-down">
              <label className="text-xs font-bold text-gray-500 tracking-wider ml-1 uppercase">Nombre de Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Kirito" 
                  className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 p-3.5 transition-all outline-none"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          {/* INPUT EMAIL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 tracking-wider ml-1 uppercase">Correo Electrónico</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="otaku@ejemplo.com" 
                className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 p-3.5 transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* INPUT PASSWORD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 tracking-wider ml-1 uppercase">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 p-3.5 transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* BOTÓN PRINCIPAL */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
            {!loading && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </form>

        {/* TOGGLE LOGIN / REGISTRO */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white font-bold hover:underline ml-1"
            >
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
        
        {/* LINK INVITADO ABAJO */}
        <div className="mt-6 pt-6 border-t border-gray-800/50 text-center">
             <button 
              onClick={handleGuestAccess}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Continuar como invitado sin cuenta
            </button>
        </div>

      </div>
    </div>
  );
}