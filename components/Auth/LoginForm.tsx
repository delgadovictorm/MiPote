"use client";

import React from "react";
import { ArrowLeft, Mail, Lock, ChevronRight } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  onBack,
}: LoginFormProps) {
  return (
    <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-3xl font-black text-white mb-2">Bienvenido de vuelta</h2>
        <p className="text-white/50 text-sm mb-10">Ingresa tus datos para continuar</p>

        <form onSubmit={onSubmit} className="space-y-5 flex-1">
          {error && (
            <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}
          
          <div>
            <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
