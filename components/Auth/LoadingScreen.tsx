"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0d0714] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-500/30 blur-[30px] rounded-full animate-pulse"></div>
        <img 
          src="/pote.png" 
          alt="Mi Pote" 
          className="w-24 h-24 object-contain relative z-10 animate-bounce" 
        />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Armando tu Pote...</h2>
      <p className="text-white/50 text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Ya casi estamos listos
      </p>
    </div>
  );
}
