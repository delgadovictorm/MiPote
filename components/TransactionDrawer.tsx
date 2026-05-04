"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { TrendingUp, Rocket, DollarSign, ShoppingCart, Wifi, Dog, Home, Gift, Edit3, X } from "lucide-react";

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

  const handleLocalSubmit = (e?: any) => {
    if (e) e.preventDefault();
    const isValidDesc = tipo === 'ingreso' ? true : descripcion.trim() !== "";
    const isValidUser = usuario.trim() !== "" || espacioActivo?.tipo === 'individual';
    
    if (monto && categoria && isValidDesc && isValidUser) {
      onSubmit(e);
      setIsOpen(false);
    } else {
      onSubmit(e); 
    }
  };

  // Función para matar el Ghost Click en iOS
  const executeAction = (e: any, action: () => void) => {
    e.preventDefault(); // Mata el clic fantasma de iOS que traspasa los botones
    e.stopPropagation();
    action();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} dismissible={false}>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 shadow-2xl outline-none">
          <Drawer.Title className="sr-only">Registrar Movimiento</Drawer.Title>
          
          <div className="px-4 md:px-6 flex-1 overflow-y-auto pb-20 bg-[#121212] flex flex-col rounded-t-[32px]">
            
            {/* HEADER DEL PANEL */}
            <div className="flex items-center justify-between pt-6 pb-6 sticky top-0 bg-[#121212] z-20">
              <h3 className="text-white font-black text-lg">Nuevo Registro</h3>
              <div 
                role="button"
                onClick={() => setIsOpen(false)} 
                onTouchEnd={(e) => executeAction(e, () => setIsOpen(false))}
                className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </div>
            </div>

            {/* TIPO DE REGISTRO */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl mb-6 shrink-0 select-none">
              <div 
                role="button"
                onClick={() => {setTipo("ingreso"); setCategoria("");}} 
                onTouchEnd={(e) => executeAction(e, () => {setTipo("ingreso"); setCategoria("");})}
                className={`text-center cursor-pointer flex-1 py-3 text-xs font-black rounded-xl transition-all ${tipo === 'ingreso' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                INGRESO
              </div>
              <div 
                role="button"
                onClick={() => {setTipo("egreso"); setCategoria("");}} 
                onTouchEnd={(e) => executeAction(e, () => {setTipo("egreso"); setCategoria("");})}
                className={`text-center cursor-pointer flex-1 py-3 text-xs font-black rounded-xl transition-all ${tipo === 'egreso' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                GASTO
              </div>
            </div>

            {/* CATEGORÍAS */}
            <div className="grid grid-cols-3 gap-2 mb-6 shrink-0 select-none">
              {categories[tipo as keyof typeof categories].map((cat) => (
                <div
                  key={cat.id}
                  role="button"
                  onClick={() => {
                    setCategoria(cat.id);
                    setDescripcion(cat.id === 'otro' ? '' : cat.label);
                  }}
                  onTouchEnd={(e) => executeAction(e, () => {
                    setCategoria(cat.id);
                    setDescripcion(cat.id === 'otro' ? '' : cat.label);
                  })}
                  className={`cursor-pointer p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    categoria === cat.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {cat.icon}
                  <span className="text-[10px] font-bold uppercase pointer-events-none">{cat.label}</span>
                </div>
              ))}
            </div>

            {/* INPUTS PRINCIPALES */}
            <div className="space-y-4 shrink-0">
              {espacioActivo?.tipo !== 'individual' && (
                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
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

              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-[9px] uppercase font-black text-white/30 block mb-1 tracking-widest pointer-events-none">Monto</label>
                    <input 
                      type="number" step="0.01" placeholder="0.00"
                      value={monto} onChange={(e) => setMonto(e.target.value)}
                      className="bg-transparent text-4xl font-black text-white outline-none w-full tabular-nums tracking-tight font-sans"
                    />
                  </div>
                </div>
                
                {/* BOTONES SEGMENTADOS PARA MONEDA */}
                <div className="flex bg-black/40 p-1 rounded-xl w-full border border-white/5 shadow-inner select-none">
                  <div 
                    role="button" 
                    onClick={() => setMoneda('usdt')} 
                    onTouchEnd={(e) => executeAction(e, () => setMoneda('usdt'))}
                    className={`text-center cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-all ${moneda === 'usdt' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                  >
                    USDT
                  </div>
                  <div 
                    role="button" 
                    onClick={() => setMoneda('bs')} 
                    onTouchEnd={(e) => executeAction(e, () => setMoneda('bs'))}
                    className={`text-center cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-all ${moneda === 'bs' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                  >
                    BS
                  </div>
                  <div 
                    role="button" 
                    onClick={() => setMoneda('cash')} 
                    onTouchEnd={(e) => executeAction(e, () => setMoneda('cash'))}
                    className={`text-center cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-all ${moneda === 'cash' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
                  >
                    CASH
                  </div>
                </div>

                {/* CONVERSIÓN EN TIEMPO REAL */}
                {monto && rates.bcv > 0 && moneda !== 'cash' && (
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 w-full text-center pointer-events-none">
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
                <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl animate-in zoom-in-95 min-h-[100px] select-none">
                  <p className="text-[10px] font-black text-purple-400 uppercase mb-3 text-center pointer-events-none">¿En cuántas cuotas?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 9].map(n => (
                      <div 
                        key={n} 
                        role="button"
                        onClick={() => (window as any).numCuotasCashea = n}
                        onTouchEnd={(e) => executeAction(e, () => (window as any).numCuotasCashea = n)}
                        className="text-center cursor-pointer py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl font-black text-white hover:bg-purple-600 transition-all focus:ring-2 ring-purple-400 tabular-nums"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tipo === 'egreso' && (
                <div className="min-h-[64px]">
                  <input 
                    type="text" placeholder="¿En qué se fue la plata? (Ej: Pizza)"
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div 
              role="button"
              onClick={handleLocalSubmit}
              onTouchEnd={(e) => executeAction(e, handleLocalSubmit)}
              className="text-center cursor-pointer w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-3xl mt-8 shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95 transition-transform text-sm uppercase tracking-widest shrink-0 select-none"
            >
              Confirmar Registro
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}