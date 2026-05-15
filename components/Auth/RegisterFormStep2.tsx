"use client";

import React from "react";
import { ArrowLeft, UserPlus, Phone, Check, ChevronRight } from "lucide-react";

interface RegisterFormStep2Props {
  nombre: string;
  setNombre: (nombre: string) => void;
  telefono: string;
  setTelefono: (telefono: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function RegisterFormStep2({
  nombre,
  setNombre,
  telefono,
  setTelefono,
  error,
  loading,
  onSubmit,
  onBack,
}: RegisterFormStep2Props) {
  return (
    <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack} 
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <div className="h-1.5 w-8 bg-purple-500 rounded-full"></div>
            <div className="h-1.5 w-8 bg-purple-500 rounded-full"></div>
          </div>
          <div className="w-10"></div>
        </div>

        <h2 className="text-3xl font-black text-white mb-2">Información personal</h2>
        <p className="text-white/50 text-sm mb-10">
          ¿Cómo quieres que te llamen en tus potes?
        </p>

        <form onSubmit={onSubmit} className="space-y-5 flex-1">
          {error && (
            <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}

          <div>
            <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">
              Nombre o Apodo
            </label>
            <div className="relative">
              <UserPlus className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ej: Pedro Peréz"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">
              WhatsApp (Teléfono)
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="Ej: 04121234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Finalizar Registro"} <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
