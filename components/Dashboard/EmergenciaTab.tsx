"use client";

import React, { useState } from "react";
import { Shield, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import { Drawer } from "vaul";
import type { Espacio } from "@/types";

interface EmergenciaTabProps {
  espacioActivo: Espacio | null;
  perfil: any;
  session: any;
  transactions: any[];
  theme: any;
  onAgregarEmergencia?: (monto: number, tipo: 'ingreso' | 'egreso', descripcion: string) => Promise<void>;
  onEliminarTransaccion?: (id: string) => Promise<void>;
  triggerToast?: (msg: string, type?: string) => void;
}

export function EmergenciaTab({
  espacioActivo,
  perfil,
  session,
  transactions,
  theme,
  onAgregarEmergencia,
  onEliminarTransaccion,
  triggerToast,
}: EmergenciaTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ monto: '', tipo: 'ingreso' as 'ingreso' | 'egreso', descripcion: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular fondo de emergencia
  const fondoEmergencia = transactions
    .filter((t) => t.categoria === "emergencia")
    .reduce((acc, tx) =>
      tx.tipo === "ingreso"
        ? acc + (tx.monto_usd_paralelo || 0)
        : acc - (tx.monto_usd_paralelo || 0),
      0
    );

  // Transacciones de emergencia
  const txEmergencia = transactions
    .filter((t) => t.categoria === "emergencia")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      triggerToast?.("Ingresa un monto válido", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAgregarEmergencia?.(
        parseFloat(formData.monto),
        formData.tipo,
        formData.descripcion || "Movimiento en fondo de emergencia"
      );
      setFormData({ monto: '', tipo: 'ingreso', descripcion: '' });
      setIsAdding(false);
      triggerToast?.("Movimiento registrado", "success");
    } catch (err) {
      triggerToast?.("Error al guardar movimiento", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalIngresos = txEmergencia
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);

  const totalEgresos = txEmergencia
    .filter(t => t.tipo === 'egreso')
    .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header con Balance */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-rose-600/20 to-rose-700/10 border-2 border-rose-500/30 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center`}>
        <Shield className="w-12 h-12 text-rose-400 mb-4" />
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
          Fondo de Emergencia 🚨
        </p>
        <p className="text-4xl md:text-5xl font-black text-white font-sans tabular-nums tracking-tight mb-2">
          $<AnimatedNum value={Math.max(fondoEmergencia, 0)} format="usd" />
        </p>
        <p className="text-xs text-white/50">
          {fondoEmergencia > 0 ? '✅ Tienes un colchón financiero' : '⚠️ Considera crear una reserva'}
        </p>

        {/* Recomendación */}
        <div className="mt-4 text-[10px] text-white/60 max-w-xs">
          <p className="italic">💡 Se recomienda ahorrar entre 3-6 meses de gastos fijos</p>
        </div>
      </div>

      {/* Botón Agregar Movimiento */}
      <button
        onClick={() => setIsAdding(true)}
        className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" /> Agregar Movimiento
      </button>

      {/* Modal para Agregar Movimiento */}
      <Drawer.Root open={isAdding} onOpenChange={setIsAdding}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-rose-500">
            <Drawer.Title className="sr-only">Agregar Movimiento</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">Movimiento en Emergencia</h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'ingreso'})}
                    className={`flex-1 py-3 rounded-xl font-black uppercase transition-colors ${
                      formData.tipo === 'ingreso'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'egreso'})}
                    className={`flex-1 py-3 rounded-xl font-black uppercase transition-colors ${
                      formData.tipo === 'egreso'
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    Retirar
                  </button>
                </div>

                <div className="min-h-[100px]">
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Emergencia médica, Reparación urgente..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    formData.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-rose-500'
                  } text-black font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-lg mt-6 active:scale-95 transition-transform disabled:opacity-50`}
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar Movimiento'}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Resumen de Movimientos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
          <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mb-1">
            Total Aportado
          </p>
          <p className="text-lg md:text-xl font-black text-emerald-400 font-sans">
            $<AnimatedNum value={totalIngresos} format="usd" />
          </p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl">
          <p className="text-[10px] text-rose-400 uppercase font-bold tracking-widest mb-1">
            Total Utilizado
          </p>
          <p className="text-lg md:text-xl font-black text-rose-400 font-sans">
            $<AnimatedNum value={totalEgresos} format="usd" />
          </p>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden`}>
        <div className="p-4 border-b border-white/5 bg-black/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" /> Historial de Movimientos
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
          {txEmergencia.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              No hay movimientos en el fondo de emergencia aún.
            </div>
          ) : (
            txEmergencia.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      tx.tipo === "ingreso"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {tx.tipo === "ingreso" ? (
                      <ArrowUpCircle className="w-4 h-4" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {tx.descripcion || (tx.tipo === 'ingreso' ? 'Aporte' : 'Retiro')}
                    </p>
                    <p className="text-[9px] text-white/40">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`text-sm font-black font-sans tabular-nums flex-shrink-0 ${
                      tx.tipo === "ingreso" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.tipo === "ingreso" ? "+" : "-"}$
                    <AnimatedNum value={Math.abs(tx.monto_usd_paralelo || 0)} format="usd" />
                  </p>
                  <button
                    onClick={() => onEliminarTransaccion?.(tx.id)}
                    className="text-white/30 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Información */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">ℹ️ ¿Qué es una emergencia?</h3>
        <ul className="space-y-2 text-[10px] md:text-xs text-white/60">
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Gastos inesperados que no puedes evitar (enfermedad, accidente, reparación urgente)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Situaciones que requieren dinero inmediato</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Usa este fondo solo en caso de verdadera emergencia</span>
          </li>
        </ul>
      </div>
    </div>
  );
}


