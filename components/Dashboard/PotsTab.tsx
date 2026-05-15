"use client";

import React, { useState } from "react";
import { Target, Plus, Trash2, Edit2, Calculator } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import { Drawer } from "vaul";
import type { Espacio } from "@/types";

interface PotsTabProps {
  espacioActivo: Espacio | null;
  potes: any[];
  transactions: any[];
  theme: any;
  getPoteAhorrado?: (poteId: string, poteName: string) => number;
  setIsAddingPote?: (val: boolean) => void;
  setPoteForm?: (form: any) => void;
  isAddingPote?: boolean;
  poteForm?: any;
  handleSavePote?: (e: any) => void;
  eliminarPote?: (id: string) => void;
  triggerToast?: (msg: string, type?: string) => void;
  onOpenCalculator?: () => void; // <--- NUEVA PROPIEDAD PARA ABRIR LA CALCULADORA
}

const POTE_OPCIONES = [
  "Vacaciones 🏖️",
  "Carro 🚗",
  "Casa 🏠",
  "Electrónica 💻",
  "Ropa 👗",
  "Personalizado ✍️"
];

export function PotsTab({
  espacioActivo,
  potes,
  transactions,
  theme,
  getPoteAhorrado,
  setIsAddingPote,
  setPoteForm,
  isAddingPote = false,
  poteForm = { id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" },
  handleSavePote,
  eliminarPote,
  triggerToast,
  onOpenCalculator,
}: PotsTabProps) {
  const [localIsAddingPote, setLocalIsAddingPote] = useState(false);
  const [localPoteForm, setLocalPoteForm] = useState(poteForm);

  const isAddingState = isAddingPote !== undefined ? isAddingPote : localIsAddingPote;
  const poteFormState = poteForm || localPoteForm;

  const handleLocalSave = (e: any) => {
    e.preventDefault();
    if (!poteFormState.monto_objetivo || poteFormState.monto_objetivo <= 0) {
      triggerToast?.("Ingresa un monto válido", "error");
      return;
    }
    handleSavePote?.(e);
    setLocalIsAddingPote(false);
  };

  const totalAhorrado = potes.reduce((acc, pote) => {
    const ahorrado = getPoteAhorrado?.(pote.id, pote.nombre) || 0;
    return acc + ahorrado;
  }, 0);

  const totalMeta = potes.reduce((acc, pote) => acc + (pote.monto_objetivo || 0), 0);
  const porcentajeGlobal = totalMeta > 0 ? (totalAhorrado / totalMeta) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen Global */}
      {potes.length > 0 && (
        <div className={`bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">
                  Total Ahorrado en Metas
                </p>
                <p className="text-4xl md:text-5xl font-black text-white font-sans tabular-nums">
                  $<AnimatedNum value={totalAhorrado} format="usd" />
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">
                  Meta Total
                </p>
                <p className="text-2xl font-black text-white/90">
                  $<AnimatedNum value={totalMeta} format="usd" />
                </p>
              </div>
            </div>

            <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-white/70 font-bold">
              {Math.round(porcentajeGlobal)}% completado
            </p>
          </div>
        </div>
      )}

      {/* Lista de Metas */}
      {potes.length === 0 ? (
        <div className={`bg-[#1a0f2e] border-2 border-dashed ${theme.border} p-10 rounded-[2rem] text-center`}>
          <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-black text-white mb-2">Sin Metas Creadas</h3>
          <p className="text-sm text-white/50 mb-6">Crea tu primera meta para empezar a ahorrar en equipo</p>
          <button
            onClick={() => {
              setIsAddingPote?.(true);
              setPoteForm?.({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
            }}
            className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl hover:bg-emerald-600 transition-colors active:scale-95"
          >
            + CREAR META
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {potes.map((pote: any) => {
            const ahorrado = getPoteAhorrado?.(pote.id, pote.nombre) || 0;
            const porcentaje = Math.min((ahorrado / pote.monto_objetivo) * 100, 100);
            const faltante = Math.max(pote.monto_objetivo - ahorrado, 0);
            const isCompleted = porcentaje >= 100;

            return (
              <div
                key={pote.id}
                className={`bg-[#1a0f2e] border-2 ${
                  isCompleted ? 'border-emerald-500/50' : theme.border
                } p-4 md:p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors`}
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2 text-2xl animate-bounce">🎉</div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-black text-white mb-1">
                      {pote.nombre}
                    </h3>
                    <p className="text-[10px] md:text-xs text-white/50">
                      {pote.tipo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs md:text-sm font-black ${
                      isCompleted ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {Math.round(porcentaje)}%
                    </span>
                    <button
                      onClick={() => eliminarPote?.(pote.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-2 md:h-2.5 bg-black/60 rounded-full overflow-hidden mb-2 md:mb-3 border border-white/5">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'bg-gradient-to-r from-purple-600 to-purple-400'
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] md:text-xs">
                  <div>
                    <p className="text-white/50 uppercase font-bold mb-1">Ahorrado</p>
                    <p className="font-black text-white">
                      $<AnimatedNum value={ahorrado} format="usd" />
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 uppercase font-bold mb-1">Meta</p>
                    <p className="font-black text-white">
                      $<AnimatedNum value={pote.monto_objetivo} format="usd" />
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 uppercase font-bold mb-1">Falta</p>
                    <p className={`font-black ${faltante > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      $<AnimatedNum value={faltante} format="usd" />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botones Agregar Meta y Calculadora */}
      <div className={`grid ${potes.length === 0 ? 'hidden' : 'grid-cols-2 gap-3 mt-4'}`}>
        <button
          onClick={() => {
            setIsAddingPote?.(true);
            setPoteForm?.({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
          }}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-colors ${theme.lightBg} text-white hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" /> Nueva Meta
        </button>

        <button
          onClick={onOpenCalculator}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-colors ${theme.lightBg} text-white hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center gap-2`}
        >
          <Calculator className="w-4 h-4" /> Simulador
        </button>
      </div>

      {/* Modal para Agregar/Editar Meta */}
      <Drawer.Root open={isAddingState || false} onOpenChange={setIsAddingPote || setLocalIsAddingPote}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-emerald-500">
            <Drawer.Title className="sr-only">Nueva Meta</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">
                {poteFormState.id ? "Editar Meta" : "Nueva Meta de Ahorro"}
              </h3>

              <form onSubmit={handleLocalSave} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Tipo de Meta
                  </label>
                  <select
                    value={poteFormState.tipo}
                    onChange={(e) => setPoteForm?.({ ...poteFormState, tipo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    {POTE_OPCIONES.map(opt => (
                      <option key={opt} value={opt} className="bg-[#1a0f2e]">{opt}</option>
                    ))}
                  </select>
                </div>

                {poteFormState.tipo === "Personalizado ✍️" && (
                  <div>
                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                      Nombre Personalizado
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Viaje a Disney"
                      value={poteFormState.nombreCustom}
                      onChange={(e) => setPoteForm?.({ ...poteFormState, nombreCustom: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}

                <div className="min-h-[100px]">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Monto Objetivo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={poteFormState.monto_objetivo}
                    onChange={(e) => setPoteForm?.({ ...poteFormState, monto_objetivo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-black font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 active:scale-95 transition-transform hover:bg-emerald-600"
                >
                  {poteFormState.id ? "Actualizar Meta" : "Crear Meta"}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}