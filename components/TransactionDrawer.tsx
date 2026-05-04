"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TrendingUp, Rocket, DollarSign, ShoppingCart, Wifi, Dog, Home, Gift, Edit3, ChevronLeft } from "lucide-react";

export function TransactionDrawer({ 
  children,
  tipo, setTipo,
  categoria, setCategoria,
  monto, setMonto,
  moneda, setMoneda,
  descripcion, setDescripcion,
  rates,
  theme,
  onSubmit,
  espacioActivo,
  participantes,
  usuario, setUsuario
}: any) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpiamos los campos al cerrar
  useEffect(() => {
    if (isOpen) {
      // ESCUDO iOS: Bloqueamos el fondo completamente
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setMonto("");
        setDescripcion("");
        setCategoria("");
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, setMonto, setDescripcion, setCategoria]);

  const categories = {
    ingreso: [
      { id: "salario", label: "Sueldo", icon: <DollarSign size={18} /> },
      { id: "inversiones", label: "Inversiones", icon: <TrendingUp size={18} /> },
      { id: "ventas", label: "Ventas", icon: <ShoppingCart size={18} /> },
      { id: "tigritos", label: "Tigritos", icon: <Rocket size={18} /> },
      { id: "otro", label: "Otro", icon: <Edit3 size={18} /> },
    ],
    egreso: [
      { id: "comida", label: "Comida", icon: <ShoppingCart size={18} /> },
      { id: "cashea", label: "Cashea", icon: <DollarSign size={18} /> },
      { id: "internet", label: "Internet", icon: <Wifi size={18} /> },
      { id: "mascotas", label: "Mascotas", icon: <Dog size={18} /> },
      { id: "condominio", label: "Condominio", icon: <Home size={18} /> },
      { id: "regalos", label: "Regalos", icon: <Gift size={18} /> },
      { id: "otro", label: "Otro", icon: <Edit3 size={18} /> },
    ]
  };

  const handleLocalSubmit = (e: any) => {
    e.preventDefault();
    const isValidDesc = tipo === 'ingreso' ? true : descripcion.trim() !== "";
    const isValidUser = usuario.trim() !== "" || espacioActivo?.tipo === 'individual';
    
    if (monto && categoria && isValidDesc && isValidUser) {
      onSubmit(e);
      setIsOpen(false);
    } else {
      onSubmit(e); 
    }
  };

  return (
    <>
      {React.cloneElement(children, { onClick: () => setIsOpen(true) })}

      {/* PORTAL: Pantalla Completa Nativa (Mata el bug del PWA en iOS) */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#0d0714] w-full h-[100dvh] flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-200">
          
          {/* HEADER NATIVO TIPO APP */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212] shrink-0 shadow-md z-20">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-rose-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h3 className="text-white font-black text-lg">Nuevo Registro</h3>
            </div>
          </div>

          {/* CONTENIDO SCROLLEABLE (Con overscroll-contain para que iOS no mueva la pantalla base) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 bg-[#0d0714] overscroll-contain">
            
            {/* TIPO DE REGISTRO */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl mb-6">
              <button 
                type="button"
                onClick={() => {setTipo("ingreso"); setCategoria("");}}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors cursor-pointer ${tipo === 'ingreso' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
              >
                INGRESO
              </button>
              <button 
                type="button"
                onClick={() => {setTipo("egreso"); setCategoria("");}}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors cursor-pointer ${tipo === 'egreso' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
              >
                GASTO
              </button>
            </div>

            {/* CATEGORÍAS */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {categories[tipo as keyof typeof categories].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoria(cat.id);
                    setDescripcion(cat.id === 'otro' ? '' : cat.label);
                  }}
                  className={`p-3 rounded-2xl border transition-colors flex flex-col items-center gap-2 cursor-pointer ${
                    categoria === cat.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase pointer-events-none">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* USER SELECT */}
            {espacioActivo?.tipo !== 'individual' && (
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 mb-6">
                <label className="text-[9px] uppercase font-black text-white/30 block mb-2 tracking-widest pointer-events-none">¿Quién realizó el movimiento?</label>
                <select 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full bg-transparent text-white font-bold outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">Seleccionar integrante...</option>
                  {participantes?.map((p: any) => <option key={p.id} value={p.nombre} className="bg-[#1a1a1a]">{p.nombre}</option>)}
                  <option value="Ambos" className="bg-[#1a1a1a]">Ambos (Mitad y mitad)</option>
                </select>
              </div>
            )}

            {/* MONTO Y MONEDA */}
            <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 space-y-4 mb-6">
              <div>
                <label className="text-[9px] uppercase font-black text-white/30 block mb-1 tracking-widest pointer-events-none">Monto</label>
                <input 
                  type="number" step="0.01" placeholder="0.00"
                  value={monto} 
                  onChange={(e) => setMonto(e.target.value)}
                  className="bg-transparent text-4xl font-black text-white outline-none w-full tabular-nums tracking-tight font-sans"
                />
              </div>
              
              <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button type="button" onClick={() => setMoneda('usdt')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'usdt' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>USDT</button>
                <button type="button" onClick={() => setMoneda('bs')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'bs' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>BS</button>
                <button type="button" onClick={() => setMoneda('cash')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'cash' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>CASH</button>
              </div>

              {monto && rates.bcv > 0 && moneda !== 'cash' && (
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 text-center text-sm pointer-events-none">
                  {moneda === 'bs' ? (
                    <>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">BCV</p>
                        <p className="text-white font-bold font-sans tracking-tight">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">Paralelo</p>
                        <p className="text-white font-bold font-sans tracking-tight">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">BCV</p>
                        <p className="text-white font-bold font-sans tracking-tight">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">Paralelo</p>
                        <p className="text-white font-bold font-sans tracking-tight">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CASHEA CUOTAS */}
            {categoria === 'cashea' && (
              <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl mb-6">
                <p className="text-[10px] font-black text-purple-400 uppercase mb-3 text-center pointer-events-none">¿En cuántas cuotas?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 9].map(n => (
                    <button 
                      key={n} 
                      type="button"
                      onClick={() => (window as any).numCuotasCashea = n}
                      className="cursor-pointer py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl font-black text-white hover:bg-purple-600 transition-colors focus:ring-2 ring-purple-400 tabular-nums"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPCION */}
            {tipo === 'egreso' && (
              <div className="mb-6">
                <input 
                  type="text" placeholder="¿En qué se fue la plata? (Ej: Pizza)"
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* BOTÓN CONFIRMAR */}
            <button 
              type="button"
              onClick={handleLocalSubmit}
              className="cursor-pointer w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95 transition-transform text-sm uppercase tracking-widest shrink-0"
            >
              Confirmar Registro
            </button>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}