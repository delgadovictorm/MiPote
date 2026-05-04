"use client";

import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, Rocket, DollarSign, ShoppingCart, Wifi, Dog, Home, Gift, Edit3, X } from "lucide-react";

const drawerStyles = `
  @supports (height: 100dvh) {
    .drawer-overlay {
      opacity: 0;
      transition: opacity 200ms ease-out;
      pointer-events: none;
    }
    .drawer-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    
    .drawer-panel {
      bottom: -90dvh;
      transition: bottom 300ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: bottom;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .drawer-panel.open {
      bottom: 0;
    }

    .drawer-panel * {
      touch-action: manipulation !important;
    }

    .drawer-panel button {
      pointer-events: auto !important;
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
    }

    .drawer-panel input,
    .drawer-panel select {
      pointer-events: auto !important;
      -webkit-user-select: text;
      user-select: text;
    }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = drawerStyles;
  style.setAttribute('data-drawer-styles', 'true');
  if (!document.querySelector('style[data-drawer-styles]')) {
    document.head.appendChild(style);
  }
}

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
  const panelRef = useRef<HTMLDivElement>(null);

  // Limpiamos los campos al cerrar
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setMonto("");
        setDescripcion("");
        setCategoria("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setMonto, setDescripcion, setCategoria]);

  // 🔥 EVENT LISTENERS NATIVOS PARA iOS PWA
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;

    // Helper para agregar listeners a todos los botones
    const attachButtonListeners = () => {
      const buttons = panel.querySelectorAll('button');
      
      buttons.forEach(button => {
        // Prevenir listeners duplicados
        button.removeEventListener('touchend', handleButtonTouchEnd);
        button.removeEventListener('mousedown', handleButtonMouseDown);
        
        button.addEventListener('touchend', handleButtonTouchEnd, { passive: false });
        button.addEventListener('mousedown', handleButtonMouseDown, { passive: false });
      });
    };

    const handleButtonTouchEnd = (e: any) => {
      e.preventDefault();
      const button = e.currentTarget;
      const action = button.dataset.action;
      const value = button.dataset.value;
      
      if (action === 'close') setIsOpen(false);
      else if (action === 'tipo') { setTipo(value); setCategoria(""); }
      else if (action === 'categoria') { 
        const label = button.dataset.label;
        setCategoria(value); 
        setDescripcion(value === 'otro' ? '' : label);
      }
      else if (action === 'moneda') setMoneda(value);
      else if (action === 'cuota') (window as any).numCuotasCashea = parseInt(value);
    };

    const handleButtonMouseDown = (e: any) => {
      const button = e.currentTarget;
      const action = button.dataset.action;
      const value = button.dataset.value;
      
      if (action === 'close') setIsOpen(false);
      else if (action === 'tipo') { setTipo(value); setCategoria(""); }
      else if (action === 'categoria') { 
        const label = button.dataset.label;
        setCategoria(value); 
        setDescripcion(value === 'otro' ? '' : label);
      }
      else if (action === 'moneda') setMoneda(value);
      else if (action === 'cuota') (window as any).numCuotasCashea = parseInt(value);
    };

    // Agregar listeners al abrir
    attachButtonListeners();

    // Cleanup
    return () => {
      const buttons = panel.querySelectorAll('button');
      buttons.forEach(button => {
        button.removeEventListener('touchend', handleButtonTouchEnd);
        button.removeEventListener('mousedown', handleButtonMouseDown);
      });
    };
  }, [isOpen, setTipo, setCategoria, setDescripcion, setMonto]);

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
      {/* BOTÓN INICIAL PARA ABRIR EL PANEL */}
      {React.cloneElement(children, { onClick: () => setIsOpen(true) })}

      {/* 🔧 CONTENEDOR PRINCIPAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end overflow-hidden">
          
          {/* FONDO OSCURO */}
          <div 
            className={`drawer-overlay absolute inset-0 bg-black/80 backdrop-blur-sm ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(false)}
          />

          {/* 🎯 CONTENEDOR DEL PANEL */}
          <div 
            ref={panelRef}
            className={`drawer-panel fixed left-0 right-0 bg-[#121212] w-full rounded-t-[32px] h-[90dvh] flex flex-col shadow-[0_-10px_50px_rgba(0,0,0,0.8)] ${isOpen ? 'open' : ''}`}
          >
            
            <div className="px-4 md:px-6 flex-1 overflow-y-auto pb-20 flex flex-col">
              
              {/* HEADER DEL PANEL */}
              <div className="flex items-center justify-between pt-6 pb-6 sticky top-0 bg-[#121212] z-20 border-b border-white/5 mb-4">
                <h3 className="text-white font-black text-lg">Nuevo Registro</h3>
                <button 
                  data-action="close"
                  className="p-2 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* TIPO DE REGISTRO */}
              <div className="flex bg-[#1a1a1a] p-1 rounded-2xl mb-6 shrink-0">
                <button 
                  type="button"
                  data-action="tipo"
                  data-value="ingreso"
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors ${tipo === 'ingreso' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
                >
                  INGRESO
                </button>
                <button 
                  type="button"
                  data-action="tipo"
                  data-value="egreso"
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors ${tipo === 'egreso' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
                >
                  GASTO
                </button>
              </div>

              {/* CATEGORÍAS */}
              <div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
                {categories[tipo as keyof typeof categories].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    data-action="categoria"
                    data-value={cat.id}
                    data-label={cat.label}
                    className={`p-3 rounded-2xl border transition-colors flex flex-col items-center gap-2 ${
                      categoria === cat.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* INPUTS PRINCIPALES */}
              <div className="space-y-4 shrink-0">
                {espacioActivo?.tipo !== 'individual' && (
                  <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                    <label className="text-[9px] uppercase font-black text-white/30 block mb-2 tracking-widest">¿Quién realizó el movimiento?</label>
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

                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-black text-white/30 block mb-1 tracking-widest">Monto</label>
                      <input 
                        type="number" step="0.01" placeholder="0.00"
                        value={monto} 
                        onChange={(e) => setMonto(e.target.value)}
                        className="bg-transparent text-4xl font-black text-white outline-none w-full tabular-nums tracking-tight font-sans"
                      />
                    </div>
                  </div>
                  
                  {/* BOTONES SEGMENTADOS PARA MONEDA */}
                  <div className="flex bg-black/40 p-1 rounded-xl w-full border border-white/5 shadow-inner">
                    <button 
                      type="button"
                      data-action="moneda"
                      data-value="usdt"
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'usdt' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}
                    >
                      USDT
                    </button>
                    <button 
                      type="button"
                      data-action="moneda"
                      data-value="bs"
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'bs' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}
                    >
                      BS
                    </button>
                    <button 
                      type="button"
                      data-action="moneda"
                      data-value="cash"
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'cash' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}
                    >
                      CASH
                    </button>
                  </div>

                  {/* CONVERSIÓN EN TIEMPO REAL */}
                  {monto && rates.bcv > 0 && moneda !== 'cash' && (
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 w-full text-center">
                      {moneda === 'bs' ? (
                        <>
                          <div className="flex-1"><p className={`text-[9px] uppercase text-purple-400 font-bold mb-0.5`}>Equiv. BCV</p><p className="font-sans tabular-nums tracking-tight text-white font-bold text-sm">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p></div>
                          <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                          <div className="flex-1"><p className={`text-[9px] uppercase text-purple-400 font-bold mb-0.5`}>Equiv. Paralelo</p><p className="font-sans tabular-nums tracking-tight text-white font-bold text-sm">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p></div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1"><p className={`text-[9px] uppercase text-purple-400 font-bold mb-0.5`}>En Tasa BCV</p><p className="font-sans tabular-nums tracking-tight text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p></div>
                          <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                          <div className="flex-1"><p className={`text-[9px] uppercase text-purple-400 font-bold mb-0.5`}>En Paralelo</p><p className="font-sans tabular-nums tracking-tight text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p></div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {categoria === 'cashea' && (
                  <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl animate-in fade-in min-h-[100px]">
                    <p className="text-[10px] font-black text-purple-400 uppercase mb-3 text-center">¿En cuántas cuotas?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 6, 9].map(n => (
                        <button 
                          key={n} 
                          type="button"
                          data-action="cuota"
                          data-value={n}
                          className="py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl font-black text-white hover:bg-purple-600 transition-colors focus:ring-2 ring-purple-400 tabular-nums"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tipo === 'egreso' && (
                  <div className="min-h-[64px]">
                    <input 
                      type="text" placeholder="¿En qué se fue la plata? (Ej: Pizza)"
                      value={descripcion} 
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={handleLocalSubmit}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-3xl mt-8 shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95 transition-transform text-sm uppercase tracking-widest shrink-0"
              >
                Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}