"use client";

import React, { useState } from "react";
import { ListTodo, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
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
      triggerToast?.("Escribe una tarea", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAgregarRecordatorio?.(nuevoRecordatorio.trim());
      setNuevoRecordatorio("");
      triggerToast?.("Tarea agregada", "success");
    } catch (err) {
      triggerToast?.("Error al agregar tarea", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordatoriosCompletados = recordatorios.filter(r => r.completado);
  const recordatoriosPendientes = recordatorios.filter(r => !r.completado);
  const porcentajeCompletado = recordatorios.length > 0 
    ? Math.round((recordatoriosCompletados.length / recordatorios.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-2 border-blue-500/30 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center`}>
        <ListTodo className="w-12 h-12 text-blue-400 mb-4" />
        <p className="text-xl font-black text-white uppercase tracking-widest mb-2">
          Lista de Tareas
        </p>
        <p className="text-xs text-white/50 mt-2 max-w-md">
          Mantén un registro de las cosas pendientes que necesitas hacer o comprar
        </p>

        {/* Progreso */}
        {recordatorios.length > 0 && (
          <div className="mt-4 w-full max-w-xs">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-2 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                style={{ width: `${porcentajeCompletado}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-white/70 font-bold">
              {recordatoriosCompletados.length}/{recordatorios.length} completadas
            </p>
          </div>
        )}
      </div>

      {/* Formulario de Nuevo Recordatorio */}
      <form onSubmit={handleSubmit} className={`bg-gradient-to-br from-blue-600/10 to-transparent border-2 border-blue-500/30 p-4 md:p-6 rounded-3xl`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={nuevoRecordatorio}
            onChange={(e) => setNuevoRecordatorio(e.target.value)}
            placeholder="Ej: Pagar electricidad, Comprar leche..."
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-white/30 outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black px-6 rounded-xl flex items-center gap-2 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Agregar</span>
          </button>
        </div>
      </form>

      {/* Lista de Tareas */}
      {recordatorios.length === 0 ? (
        <div className={`bg-[#1a0f2e] border-2 border-dashed ${theme.border} p-10 rounded-[2rem] text-center`}>
          <Circle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-black text-white mb-2">Sin Tareas</h3>
          <p className="text-sm text-white/50">Crea tu primera tarea para empezar a organizar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tareas Pendientes */}
          {recordatoriosPendientes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">
                Pendientes ({recordatoriosPendientes.length})
              </h3>
              <div className="space-y-2">
                {recordatoriosPendientes.map((recordatorio) => (
                  <div
                    key={recordatorio.id}
                    className={`bg-[#1a0f2e] border ${theme.border} p-4 rounded-2xl flex items-start gap-3 group hover:border-blue-500/50 transition-colors`}
                  >
                    <button
                      onClick={() => onToggleRecordatorio?.(recordatorio.id, !recordatorio.completado)}
                      className="mt-0.5 text-white/40 hover:text-blue-400 transition-colors flex-shrink-0"
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
                      className="text-white/30 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tareas Completadas */}
          {recordatoriosCompletados.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">
                Completadas ({recordatoriosCompletados.length})
              </h3>
              <div className="space-y-2">
                {recordatoriosCompletados.map((recordatorio) => (
                  <div
                    key={recordatorio.id}
                    className={`bg-black/40 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 group hover:border-emerald-500/50 transition-colors opacity-75`}
                  >
                    <button
                      onClick={() => onToggleRecordatorio?.(recordatorio.id, !recordatorio.completado)}
                      className="mt-0.5 text-emerald-400 transition-colors flex-shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white/60 truncate line-through">
                        {recordatorio.texto}
                      </p>
                      <p className="text-[9px] text-white/30">
                        Completado {new Date(recordatorio.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onEliminarRecordatorio?.(recordatorio.id)}
                      className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consejos */}
      {recordatorios.length === 0 && (
        <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">💡 Consejos</h3>
          <ul className="space-y-2 text-[10px] md:text-xs text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Agrega todas tus tareas pendientes del mes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Marca como completadas cuando las termines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Las tareas completadas se archivan automáticamente</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
