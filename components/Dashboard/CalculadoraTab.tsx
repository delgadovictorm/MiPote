"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowDownCircle, Calculator, Copy } from "lucide-react";

interface CalculadoraTabProps {
  rates: any;
  theme: any;
  triggerToast?: (msg: string, type?: string) => void;
  onBack?: () => void;
}

export function CalculadoraTab({
  rates,
  theme,
  triggerToast,
  onBack,
}: CalculadoraTabProps) {
  const [calcAmount, setCalcAmount] = useState("");
  const [calcBs, setCalcBs] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [rateType, setRateType] = useState("paralelo");

  // Determinar la tasa activa según la moneda y el tipo seleccionado
  const activeRate = currency === 'usd' 
    ? (rateType === 'paralelo' ? rates.usdt : rates.bcv)
    : (rateType === 'paralelo' ? rates.eur_paralelo : rates.eur_bcv);

  // Lógica Bidireccional
  const handleCalcAmount = (val: string) => {
    setCalcAmount(val);
    const num = parseFloat(val) || 0;
    setCalcBs((num * activeRate).toFixed(2));
  };

  const handleCalcBs = (val: string) => {
    setCalcBs(val);
    const num = parseFloat(val) || 0;
    setCalcAmount(activeRate > 0 ? (num / activeRate).toFixed(2) : "0.00");
  };

  // Recalcular si el usuario cambia la moneda (USD a EUR) o la tasa (Paralelo a BCV)
  useEffect(() => {
    if (calcAmount) {
      const num = parseFloat(calcAmount) || 0;
      setCalcBs((num * activeRate).toFixed(2));
    }
  }, [currency, rateType, activeRate]);

  const handleCopy = () => {
    const symbol = currency === 'usd' ? '$' : '€';
    navigator.clipboard.writeText(`${symbol}${calcAmount} = Bs.${calcBs} (Tasa: ${rateType.toUpperCase()})`);
    triggerToast?.("Cálculo copiado al portapapeles", "success");
  };

  return (
    <div className="space-y-6">
      <div className={`bg-[#1a0f2e] border ${theme.border} p-6 md:p-8 rounded-[2.5rem] shadow-xl w-full max-w-lg mx-auto relative overflow-hidden animate-in fade-in zoom-in-95 duration-300`}>
        
        {/* Efecto de luz detrás de la calculadora */}
        <div className={`absolute inset-0 ${theme.primary} opacity-10 blur-[80px] rounded-full pointer-events-none`}></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Calculator className={`w-6 h-6 ${theme.text}`} /> Calculadora Libre
            </h3>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black text-white/80 hover:bg-white/10 transition active:scale-95`}
            >
              <Copy className="w-3 h-3" />
              Copiar
            </button>
          </div>

          {/* Selector de Tasa (Paralelo vs BCV) */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-6 shadow-inner">
            <button 
              onClick={() => setRateType('paralelo')} 
              className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-black rounded-lg transition-all ${rateType === 'paralelo' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}
            >
              Paralelo
            </button>
            <button 
              onClick={() => setRateType('bcv')} 
              className={`flex-1 py-2 text-[11px] uppercase tracking-widest font-black rounded-lg transition-all ${rateType === 'bcv' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}
            >
              BCV Oficial
            </button>
          </div>
          
          <div className="space-y-6">
            
            {/* CAJA SUPERIOR: Moneda Extranjera */}
            <div className={`bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner transition-colors focus-within:border-white/20`}>
              <div className="flex justify-between items-center mb-2">
                <label className={`text-[10px] uppercase text-white/50 font-bold tracking-widest block`}>Monto Extranjero</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`bg-[#1a0f2e] ${theme.text} border ${theme.border} rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-white/10`}
                >
                  <option value="usd">Dólares (USD)</option>
                  <option value="eur">Euros (EUR)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${theme.text} opacity-50`}>{currency === 'usd' ? '$' : '€'}</span>
                <input 
                  type="number" step="0.01" placeholder="0.00" 
                  value={calcAmount} 
                  onChange={(e) => handleCalcAmount(e.target.value)} 
                  className="flex-1 bg-transparent text-4xl font-black text-white outline-none tabular-nums tracking-tight font-sans w-full" 
                />
              </div>
            </div>
            
            {/* FLECHA DEL MEDIO */}
            <div className="flex justify-center -my-3 relative z-10 pointer-events-none">
               <div className={`bg-[#1a0f2e] p-2 rounded-full border ${theme.border}`}>
                  <ArrowDownCircle className={`w-6 h-6 ${theme.text} opacity-50`} />
               </div>
            </div>

            {/* CAJA INFERIOR: Bolívares */}
            <div className={`bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner transition-colors focus-within:border-white/20`}>
              <label className={`text-[10px] uppercase text-white/50 font-bold tracking-widest block mb-2`}>Equivalente en Bolívares</label>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-black ${theme.text} opacity-50`}>Bs.</span>
                <input 
                  type="number" step="0.01" placeholder="0.00" 
                  value={calcBs} 
                  onChange={(e) => handleCalcBs(e.target.value)} 
                  className="flex-1 bg-transparent text-4xl font-black text-white outline-none tabular-nums tracking-tight font-sans w-full" 
                />
              </div>
            </div>

            {/* INFO DE TASAS ACTUALES */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <p className="text-[9px] uppercase text-white/30 font-bold mb-1 tracking-widest">1 {currency === 'usd' ? 'USD' : 'EUR'} (BCV)</p>
                <p className="text-sm font-black text-white font-sans tabular-nums tracking-tight">Bs. {(currency === 'usd' ? rates.bcv : rates.eur_bcv).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase text-white/30 font-bold mb-1 tracking-widest">1 {currency === 'usd' ? 'USD' : 'EUR'} (Paralelo)</p>
                <p className="text-sm font-black text-white font-sans tabular-nums tracking-tight">Bs. {(currency === 'usd' ? rates.usdt : rates.eur_paralelo).toFixed(2)}</p>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* BOTÓN VOLVER */}
        <div className="mt-8 flex justify-center border-t border-white/5 pt-6 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}