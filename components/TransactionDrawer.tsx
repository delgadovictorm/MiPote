"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { TrendingUp, Rocket, DollarSign, ShoppingCart, Wifi, Dog, Home, Gift, Edit3, ChevronLeft, Plus, ArrowRight, Tag, Settings2, X } from "lucide-react";
import { TASAS_DISPONIBLES, getValorTasa } from "@/components/Dashboard/tasasConfig";

// Formatea un monto "crudo" (punto decimal, ej. "25000.5") al estilo venezolano mientras se escribe (ej. "25.000,5")
const formatMontoDisplay = (raw: string) => {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const intFormatted = new Intl.NumberFormat('es-VE').format(Number(intPart || "0"));
  return decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;
};

// Convierte lo que el usuario ve/escribe (con puntos de miles y coma decimal) de vuelta al formato crudo con punto decimal
const parseMontoInput = (display: string) => {
  const cleaned = display.replace(/[^\d,]/g, '');
  const [intPartRaw, ...decParts] = cleaned.split(',');
  const intPart = intPartRaw.replace(/^0+(?=\d)/, '');
  if (decParts.length === 0) return intPart;
  const decPart = decParts.join('').slice(0, 2);
  return `${intPart || '0'}.${decPart}`;
};

export function TransactionDrawer({
  children,
  tipo, setTipo,
  categoria, setCategoria,
  customCategoria, setCustomCategoria,
  categoriasApi,
  monto, setMonto,
  moneda, setMoneda,
  activeRates, setActiveRates,
  descripcion, setDescripcion,
  rates,
  theme,
  onSubmit,
  espacioActivo,
  participantes,
  usuario, setUsuario,
  espacios,
  potes,
  destinoTransferencia, setDestinoTransferencia
}: any) {

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [nuevaCategoriaInput, setNuevaCategoriaInput] = useState("");

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
        setCustomCategoria("");
        setMoneda("bs");
        setShowCategoryManager(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, setMonto, setDescripcion, setCategoria, setCustomCategoria, setMoneda]);

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
      { id: "internet", label: "Internet", icon: <Wifi size={18} /> },
      { id: "abono_pote", label: "Abonar a Pote 🍯", icon: <Plus size={18} /> },
      { id: "mascotas", label: "Mascotas", icon: <Dog size={18} /> },
      { id: "condominio", label: "Condominio", icon: <Home size={18} /> },
      { id: "regalos", label: "Regalos", icon: <Gift size={18} /> },
      { id: "otro", label: "Otro", icon: <Edit3 size={18} /> },
    ]
  };

  const proteccion = ["otro", "abono_pote"];

  const categoriasMostradas = useMemo(() => {
    const ocultas: Set<string> = categoriasApi?.ocultas || new Set();
    const defaults = categories[tipo as keyof typeof categories].filter(c => proteccion.includes(c.id) || !ocultas.has(c.id));
    const customs = (categoriasApi?.custom || [])
      .filter((c: any) => c.tipo === tipo)
      .map((c: any) => ({ id: c.valor, label: c.label, icon: <Tag size={18} />, custom: true, dbId: c.id }));
    return [...defaults, ...customs];
  }, [tipo, categoriasApi]);

  const monedasForaneas = TASAS_DISPONIBLES.filter(t => t.kind === 'foreign_per_usd');
  const monedasForaneasActivas = monedasForaneas.filter(t => (activeRates || []).includes(t.id));
  const monedasForaneasInactivas = monedasForaneas.filter(t => !(activeRates || []).includes(t.id));

  const handleLocalSubmit = (e: any) => {
    e.preventDefault();

    if (categoria === 'abono_pote' && !destinoTransferencia) return alert("Selecciona a qué Pote vas a mandar la plata");

    const isValidDesc = (tipo === 'ingreso' || categoria === 'abono_pote') ? true : descripcion.trim() !== "";
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Categorías</span>
              {categoriasApi?.disponible !== false && (
                <button
                  type="button"
                  onClick={() => setShowCategoryManager(v => !v)}
                  className="text-[9px] uppercase font-black text-purple-400 flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 size={12} /> {showCategoryManager ? 'Listo' : 'Personalizar'}
                </button>
              )}
            </div>

            {showCategoryManager ? (
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-3 mb-6 space-y-1">
                {categoriasMostradas.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-2 py-2 border-b border-white/5 last:border-b-0">
                    <span className="text-xs font-bold text-white/80">{cat.label}</span>
                    {!proteccion.includes(cat.id) && (
                      <button
                        type="button"
                        onClick={() => (cat as any).custom ? categoriasApi.eliminar((cat as any).dbId) : categoriasApi.ocultar(cat.id, tipo)}
                        className="text-white/30 hover:text-rose-400 cursor-pointer p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={nuevaCategoriaInput}
                    onChange={(e) => setNuevaCategoriaInput(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (nuevaCategoriaInput.trim()) {
                        categoriasApi.agregar(nuevaCategoriaInput.trim(), tipo);
                        setNuevaCategoriaInput("");
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-xl cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {categoriasMostradas.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoria(cat.id);
                      setDescripcion(cat.id === 'otro' || cat.id === 'abono_pote' ? '' : cat.label);
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
            )}

            {/* NOMBRE DE CATEGORÍA PERSONALIZADA (SOLO "OTRO") */}
            {categoria === 'otro' && !showCategoryManager && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Nombre de tu categoría (Ej: Regalos)"
                  value={customCategoria}
                  onChange={(e) => setCustomCategoria(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            {/* SELECTOR DE POTE DESTINO - SOLO SI ELIGE ABONAR */}
            {categoria === 'abono_pote' && (
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-emerald-500/30 mb-6 animate-in zoom-in-95">
                <label className="text-[9px] uppercase font-black text-emerald-400 block mb-2 tracking-widest">¿A qué meta enviamos el dinero?</label>
                <select 
                  value={destinoTransferencia} 
                  onChange={(e) => setDestinoTransferencia(e.target.value)}
                  className="w-full bg-transparent text-white font-bold outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#121212]">Seleccionar Pote...</option>
                  {potes?.map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-[#121212]">{p.nombre}</option>
                  ))}
                </select>
              </div>
            )}

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
                  type="text" inputMode="decimal" placeholder="0,00"
                  value={formatMontoDisplay(monto)}
                  onChange={(e) => setMonto(parseMontoInput(e.target.value))}
                  className="bg-transparent text-4xl font-black text-white outline-none w-full tabular-nums tracking-tight font-sans"
                />
              </div>

              <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button type="button" onClick={() => setMoneda('usdt')} className={`cursor-pointer flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'usdt' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>USDT</button>
                <button type="button" onClick={() => setMoneda('bs')} className={`cursor-pointer flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'bs' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>BS</button>
                <button type="button" onClick={() => setMoneda('cash')} className={`cursor-pointer flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'cash' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>CASH</button>
                {monedasForaneasActivas.map(t => (
                  <button key={t.id} type="button" onClick={() => setMoneda(t.id)} className={`cursor-pointer flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${moneda === t.id ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>{t.badge}</button>
                ))}
                {monedasForaneasInactivas.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setActiveRates?.((prev: string[]) => [...prev, t.id]); setMoneda(t.id); }}
                    className="cursor-pointer flex-1 min-w-[64px] py-2 text-[10px] font-black rounded-lg border border-dashed border-white/15 text-white/30 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors flex items-center justify-center gap-1"
                    title="Agregar esta moneda"
                  >
                    <Plus size={10} /> {t.badge}
                  </button>
                ))}
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
                  ) : (() => {
                    const monedaForanea = monedasForaneas.find(t => t.id === moneda);
                    const usdEquiv = monedaForanea
                      ? (getValorTasa(monedaForanea.id, rates) > 0 ? parseFloat(monto) / getValorTasa(monedaForanea.id, rates) : 0)
                      : parseFloat(monto);
                    return (
                      <>
                        <div className="flex-1">
                          <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">BCV</p>
                          <p className="text-white font-bold font-sans tracking-tight">Bs. {(usdEquiv * rates.bcv).toFixed(2)}</p>
                        </div>
                        <div className="h-6 w-px bg-white/10"></div>
                        <div className="flex-1">
                          <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">Paralelo</p>
                          <p className="text-white font-bold font-sans tracking-tight">Bs. {(usdEquiv * rates.usdt).toFixed(2)}</p>
                        </div>
                      </>
                    );
                  })()}
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
            {tipo === 'egreso' && categoria !== 'abono_pote' && (
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