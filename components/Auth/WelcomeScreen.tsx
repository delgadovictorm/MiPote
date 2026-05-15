"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
  onGuest: () => void;
}

export function WelcomeScreen({ onRegister, onLogin, onGuest }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-[#0d0714] flex flex-col relative overflow-hidden animate-in fade-in duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex-1 flex flex-col justify-end p-8 z-10 relative mb-10 max-w-md mx-auto w-full">
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-fuchsia-500/30 blur-[40px] rounded-full animate-pulse"></div>
            <img 
              src="/pote.png" 
              alt="Mi Pote" 
              className="w-40 h-40 object-contain relative z-10 drop-shadow-[0_0_35px_rgba(192,38,211,0.5)] hover:scale-105 transition-transform" 
            />
          </div>
        </div>
        
        <h1 className="text-[40px] md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
          Domina <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">tus finanzas.</span>
        </h1>
        
        <p className="text-white/60 text-sm md:text-base mb-10 max-w-sm">
          Cuentas claras conservan amistades (y parejas). Organiza, divide y ahorra sin estrés.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={onRegister} 
            className="w-full bg-white text-black font-black py-4 rounded-2xl text-base shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
          >
            Comenzar ahora
          </button>
          
          <button 
            onClick={onLogin} 
            className="w-full bg-[#1a0f2e] border border-white/10 text-white font-bold py-4 rounded-2xl text-base hover:bg-white/5 active:scale-95 transition-all"
          >
            Ya tengo cuenta
          </button>
        </div>
        
        <button 
          onClick={onGuest} 
          className="mt-8 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto active:scale-95 transition-transform"
        >
          <Sparkles className="w-4 h-4" /> Entrar como Invitado
        </button>
      </div>
    </div>
  );
}
