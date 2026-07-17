"use client";

import React, { useState } from "react";
import { ListTodo, Plus, Trash2, Circle } from "lucide-react";
import type { Espacio } from "@/types";

interface RecordatoriosTabProps {
  espacioActivo: Espacio | null;
  recordatorios: any[];
  theme: any;
  onAgregarRecordatorio?: (descripcion: string) => Promise<void>;
  onToggleRecordatorio?: (id: string, completado: boolean) => Promise<void>;
  onEliminarRecordatorio?: (id: string) => Promise<void>;
  triggerToast?: (msg: string, type?: string) => void;
}

export function RecordatoriosTab({
  espacioActivo,
  recordatorios = [],
  theme,
  onAgregarRecordatorio,
  onToggleRecordatorio,
  onEliminarRecordatorio,
  triggerToast,
}: RecordatoriosTabProps) {
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoRecordatorio.trim()) {
      triggerToast?.("Escribe una nota", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAgregarRecordatorio?.(nuevoRecordatorio.trim());
      setNuevoRecordatorio("");
      triggerToast?.("Nota agregada", "success");
    } catch (err) {
      triggerToast?.("Error al agregar la nota", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Las notas completadas desaparecen de la vista (quedan marcadas en la base de datos, no se muestran más).
  const recordatoriosPendientes = recordatorios.filter(r => !r.completado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden ${theme.lightBg} border-2 ${theme.border} p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center`}>
        <ListTodo className={`w-12 h-12 ${theme.text} mb-4`} />
        <p className="text-xl font-black text-white uppercase tracking-widest mb-2">
          Notas
        </p>
        <p className="text-xs text-white/50 mt-2 max-w-md">
          Anota lo pendiente para que todos en este espacio lo vean e interactúen
        </p>

        {recordatoriosPendientes.length > 0 && (
          <p className="text-[10px] text-white/70 font-bold mt-4">
            {recordatoriosPendientes.length} pendiente{recordatoriosPendientes.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* Formulario de Nueva Nota */}
      <form onSubmit={handleSubmit} className={`${theme.card} border-2 ${theme.border} p-4 md:p-6 rounded-3xl`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoRecordatorio}
            onChange={(e) => setNuevoRecordatorio(e.target.value)}
            placeholder="Ej: Pagar electricidad, Comprar leche..."
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${theme.primary} hover:opacity-90 disabled:opacity-50 text-white font-black px-6 rounded-xl flex items-center gap-2 transition-opacity active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Agregar</span>
          </button>
        </div>
      </form>

      {/* Lista de Notas Pendientes (al completarlas, desaparecen de aquí) */}
      {recordatoriosPendientes.length === 0 ? (
        <div className={`bg-[#1a0f2e] border-2 border-dashed ${theme.border} p-10 rounded-[2rem] text-center`}>
          <Circle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white mb-2">Sin Notas</h3>
          <p className="text-sm text-white/50">Escribe tu primera nota para empezar a organizar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recordatoriosPendientes.map((recordatorio) => (
            <div
              key={recordatorio.id}
              className={`bg-[#1a0f2e] border ${theme.border} p-4 rounded-2xl flex items-start gap-3 group hover:border-white/20 transition-colors`}
            >
              <button
                onClick={() => { onToggleRecordatorio?.(recordatorio.id, !recordatorio.completado); triggerToast?.("¡Nota completada! ✅", "success"); }}
                className={`mt-0.5 text-white/40 hover:${theme.text} transition-colors flex-shrink-0`}
                title="Marcar como completada"
              >
                <Circle className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {recordatorio.texto}
                </p>
                <p className="text-[9px] text-white/40">
                  Creado {new Date(recordatorio.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onEliminarRecordatorio?.(recordatorio.id)}
                className="p-1 text-white/30 hover:text-rose-400 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                title="Eliminar nota"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Consejos */}
      {recordatoriosPendientes.length === 0 && (
        <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">💡 Consejos</h3>
          <ul className="space-y-2 text-[10px] md:text-xs text-white/60">
            <li className="flex items-start gap-2">
              <span className={`${theme.text} mt-0.5`}>•</span>
              <span>Agrega todo lo pendiente del mes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`${theme.text} mt-0.5`}>•</span>
              <span>Márcala como hecha y desaparece de la lista</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`${theme.text} mt-0.5`}>•</span>
              <span>Todos los que están en este espacio ven la misma lista</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
