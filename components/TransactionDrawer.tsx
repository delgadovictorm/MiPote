"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { TrendingUp, TrendingDown, Briefcase, Rocket, DollarSign, ShoppingCart, Wifi, Dog, Home, Gift, Edit3 } from "lucide-react";

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
  
  // Controlamos la apertura/cierre del panel manualmente
  const [isOpen, setIsOpen] = useState(false);

  const categories = {
    ingreso: [
      { id: "salario", label: "Sueldo", icon: <DollarSign size={18} /> },
      { id: "freelance", label: "Freelance", icon: <Briefcase size={18} /> },
      { id: "inversiones", label: "Inversiones", icon: <TrendingUp size={18} /> },
      { id: "ventas", label: "Ventas", icon: <ShoppingCart size={18} /> },
      { id: "tigritos", label: "Tigritos", icon: <Rocket size={18} /> },
      { id: "otro", label: "Personalizado", icon: <Edit3 size={18} /> },
    ],
    egreso: [
      { id: "comida", label: "Comida", icon: <ShoppingCart size={18} /> },
      { id: "cashea", label: "Cashea", icon: <DollarSign size={18} /> },
      { id: "internet", label: "Internet", icon: <Wifi size={18} /> },
      { id: "mascotas", label: "Mascotas", icon: <Dog size={18} /> },
      { id: "condominio", label: "Condominio", icon: <Home size={18} /> },
      { id: "regalos", label: "Regalos", icon: <Gift size={18} /> },
      { id: "otro", label: "Personalizado", icon: <Edit3 size={18} /> },
    ]
  };

  // Reglas estrictas para mostrar el campo de Detalle libre
  const showDetalle = 
    (tipo === "ingreso" && categoria === "otro") || 
    (tipo === "egreso" && (categoria === "comida" || categoria === "otro"));

  const tText = theme?.text || "text-purple-400";

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
        <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[88vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-[#A855F7]">
          
          {/* SR-ONLY: Arregla el error rojo de la consola */}
          <Drawer.Title className="sr-only">Registrar Nuevo Movimiento</Drawer.Title>
          <Drawer.Description className="sr-only">Formulario para registrar ingresos y egresos en Mi Pote</Drawer.Description>

          <div className="p-4 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto pb-10">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
            
            <div className="flex bg-[#262626] p-1 rounded-xl mb-6 shadow-inner">
              <button
                onClick={() => { setTipo("ingreso"); setCategoria(""); setDescripcion(""); }}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  tipo === "ingreso" ? "bg-green-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <TrendingUp size={18} />
                INGRESO
              </button>
              <button
                onClick={() => { setTipo("egreso"); setCategoria(""); setDescripcion(""); }}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  tipo === "egreso" ? "bg-red-500 text-black shadow-md" : "text-gray-400 hover:text-white"
                }`}
              >
                <TrendingDown size={18} />
                EGRESO
              </button>
            </div>

            <h3 className="text-gray-400 text-sm mb-3 font-semibold px-2">Selecciona una categoría</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories[tipo as keyof typeof categories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoria(cat.id);
                    // Si no mostramos detalle libre, auto-completamos la descripción para que la Base de Datos no falle
                    if (!( (tipo === "ingreso" && cat.id === "otro") || (tipo === "egreso" && (cat.id === "comida" || cat.id === "otro")) )) {
                        setDescripcion(cat.label);
                    } else {
                        setDescripcion("");
                    }
                  }}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                    categoria === cat.id 
                      ? tipo === "ingreso" ? "border-green-500 bg-green-500/10 text-green-400" : "border-red-500 bg-red-500/10 text-red-400"
                      : "border-[#333] bg-[#1a1a1a] text-gray-300 hover:bg-[#262626]"
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
{/* MONTO Y DETALLES INTELIGENTES */}
            <div className="space-y-4">
              
              {/* SELECTOR DE USUARIO (Si aplica) */}
              {espacioActivo?.tipo !== 'individual' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-1">Responsable del gasto</label>
                  <div className="flex bg-[#262626] p-1 rounded-xl border border-[#333]">
                    <select 
                      required value={usuario} onChange={(e) => setUsuario(e.target.value)} 
                      className="w-full bg-transparent p-3 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#121212]">¿Quién paga?</option>
                      {participantes?.map((u: any) => <option key={u.id} value={u.nombre} className="bg-[#121212]">{u.nombre}</option>)}
                      {/* Agregamos las opciones grupales que tenías antes */}
                      {participantes?.length > 0 && <option value={espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)'} className="bg-[#121212]">{espacioActivo?.tipo === 'pote' ? 'Ambos (Mitad)' : 'Todos (División igual)'}</option>}
                    </select>
                  </div>
                </div>
              )}

              {/* INPUT DE MONTO (Cambia etiqueta si es Cashea) */}
              <div className="flex bg-[#262626] p-4 rounded-xl border border-[#333] focus-within:border-[#A855F7] transition-colors">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-1">
                    {categoria === 'cashea' ? 'Monto Total del Producto' : 'Monto'}
                  </label>
                  <input 
                    type="number" step="0.01" placeholder="0.00" 
                    value={monto} onChange={(e) => setMonto(e.target.value)}
                    className="w-full bg-transparent text-3xl font-black text-white outline-none font-mono" 
                  />
                </div>
                <select 
                  value={moneda} onChange={(e) => setMoneda(e.target.value)}
                  className="bg-[#121212] border border-[#333] rounded-xl px-3 text-sm text-white font-bold outline-none cursor-pointer">
                  <option value="cash">CASH</option>
                  <option value="usd">USD</option>
                  <option value="bs">BS</option>
                </select>
              </div>

              {/* LÓGICA EXCLUSIVA DE CUOTAS CASHEA */}
              {categoria === 'cashea' && (
                <div className="animate-in zoom-in duration-300">
                  <label className="text-[10px] uppercase text-purple-400 font-bold tracking-widest block mb-1">¿En cuántas cuotas? (Sin contar el pago inicial)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 9].map((n) => (
                      <button 
                        key={n}
                        type="button"
                        onClick={() => (window as any).numCuotasCashea = n}
                        className="py-3 rounded-xl border border-[#333] bg-[#1a1a1a] text-white font-bold hover:border-purple-500 focus:bg-purple-600 focus:text-black transition-all"
                      >
                        {n} Cuotas
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 italic text-center">Mi Pote creará { (window as any).numCuotasCashea || 3 } recordatorios cada 14 días automáticamente.</p>
                </div>
              )}
              
              {/* INPUT DE DETALLE (Visible según tus reglas o si es Cashea) */}
              {(showDetalle || categoria === 'cashea') && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    placeholder={categoria === 'cashea' ? "¿Qué compraste? (Ej: Zapatos Nike)" : "Escribe un detalle específico..."} 
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#A855F7] rounded-xl p-4 text-sm text-white outline-none transition-colors" 
                  />
                </div>
              )}
            

              {/* EL BLOQUE DE CONVERSIÓN BCV / PARALELO RESTAURADO */}
              {monto && rates && rates.bcv > 0 && moneda !== 'cash' && (
                <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#333] w-full text-center animate-in fade-in slide-in-from-bottom-2">
                  {moneda === 'bs' ? (
                    <>
                      <div className="flex-1">
                        <p className={`text-[10px] uppercase ${tText} font-bold mb-1`}>Equiv. BCV</p>
                        <p className="font-mono text-white font-bold text-lg">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className={`h-8 w-px bg-[#333] mx-2`}></div>
                      <div className="flex-1">
                        <p className={`text-[10px] uppercase ${tText} font-bold mb-1`}>Equiv. Paralelo</p>
                        <p className="font-mono text-white font-bold text-lg">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className={`text-[10px] uppercase ${tText} font-bold mb-1`}>En Tasa BCV</p>
                        <p className="font-mono text-white font-bold text-lg">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className={`h-8 w-px bg-[#333] mx-2`}></div>
                      <div className="flex-1">
                        <p className={`text-[10px] uppercase ${tText} font-bold mb-1`}>En Paralelo</p>
                        <p className="font-mono text-white font-bold text-lg">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* CAMPO DE DETALLE CONDICIONAL */}
              {showDetalle && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    placeholder={categoria === 'comida' ? "Detalle (Ej: Arturo's, KFC...)" : "Escribe un detalle específico..."} 
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#A855F7] rounded-xl p-4 text-sm text-white outline-none transition-colors" 
                  />
                </div>
              )}
            </div>

            <button 
              onClick={(e) => {
                onSubmit(e);
                // Solo cerramos el panel automáticamente si no faltan datos importantes
                if (monto && categoria && (usuario || espacioActivo?.tipo === 'individual')) {
                  setIsOpen(false);
                }
              }}
              className={`w-full font-black py-4 rounded-xl text-white text-sm shadow-lg mt-8 active:scale-95 transition-all ${
                !categoria || !monto ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              }`}
              disabled={!categoria || !monto}
            >
              {!categoria ? 'SELECCIONA UNA CATEGORÍA' : !monto ? 'INGRESA UN MONTO' : 'GUARDAR REGISTRO'}
            </button>
            
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}