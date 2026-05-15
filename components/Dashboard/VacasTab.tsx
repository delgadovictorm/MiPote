"use client";

import React from "react";
import { Users, Target, TrendingUp, TrendingDown, Calculator, Plane } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import type { Espacio } from "@/types";

interface VacasTabProps {
  espacioActivo: Espacio | null;
  potes: any[];
  transactions: any[];
  participantes?: any[];
  theme: any;
  getPoteAhorrado?: (poteId: string, poteName: string) => number;
  triggerToast?: (msg: string, type?: string) => void;
  onOpenCalculator?: () => void;
}

export function VacasTab({
  espacioActivo,
  potes,
  transactions,
  participantes = [],
  theme,
  getPoteAhorrado,
  triggerToast,
  onOpenCalculator,
}: VacasTabProps) {
  if (!potes || potes.length === 0) {
    return (
      <div className={`bg-[#1a0f2e] border-2 border-dashed ${theme.border} p-10 rounded-[2rem] text-center mt-6`}>
        <Users className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-black text-white mb-2">Sin Vacas Creadas</h3>
        <p className="text-sm text-white/50">
          Una vaca es un presupuesto de viaje o evento compartido. El administrador puede crear una para que el grupo comience a aportar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen del Presupuesto Compartido (La Vaca) */}
      {potes.map((vaca: any) => {
        // Filtrar transacciones para no mezclar
        const transaccionesVaca = transactions.filter(tx => tx.categoria.startsWith('pote_') || tx.categoria === 'general');
        
        // Sumamos todo lo que ha entrado (Aportes del grupo)
        const recaudado = transaccionesVaca
          .filter(tx => tx.tipo === 'ingreso')
          .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
          
        // Sumamos todo lo que se ha gastado (Durante el viaje/evento)
        const gastado = transaccionesVaca
          .filter(tx => tx.tipo === 'egreso')
          .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
          
        const disponible = Math.max(recaudado - gastado, 0);
        const meta = vaca.monto_objetivo || 0;
        
        const porcentajeRecaudado = meta > 0 ? Math.min((recaudado / meta) * 100, 100) : 0;
        const porcentajeGastado = recaudado > 0 ? Math.min((gastado / recaudado) * 100, 100) : 0;
        const isCompleted = porcentajeRecaudado >= 100;

        return (
          <div
            key={vaca.id}
            className={`bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-2 ${
              isCompleted ? 'border-emerald-500/50' : 'border-blue-500/30'
            } p-5 md:p-7 rounded-[2rem] relative overflow-hidden`}
          >
            {isCompleted && (
              <div className="absolute top-4 right-4 text-3xl animate-bounce">✈️</div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white mb-1 flex items-center gap-2">
                  {vaca.nombre}
                </h2>
                <p className="text-xs md:text-sm text-white/60">
                  Presupuesto Grupal · {participantes.length} miembros
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mb-1">Presupuesto</p>
                <p className={`text-2xl md:text-3xl font-black font-sans tabular-nums text-white`}>
                  $<AnimatedNum value={meta} format="usd" />
                </p>
              </div>
            </div>

            {/* Grilla de métricas de la Vaca */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Recaudado */}
              <div className="bg-black/40 p-4 rounded-2xl border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3"/> Aportado
                </p>
                <p className="text-xl font-black text-emerald-400 font-sans">
                  $<AnimatedNum value={recaudado} format="usd" />
                </p>
                <div className="h-1.5 w-full bg-black/60 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${porcentajeRecaudado}%` }}></div>
                </div>
                <p className="text-[9px] text-white/40 mt-1 text-right">{Math.round(porcentajeRecaudado)}% de la meta</p>
              </div>

              {/* Gastado */}
              <div className="bg-black/40 p-4 rounded-2xl border border-rose-500/20">
                <p className="text-[10px] text-rose-400/80 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3"/> Gastado
                </p>
                <p className="text-xl font-black text-rose-400 font-sans">
                  $<AnimatedNum value={gastado} format="usd" />
                </p>
                <div className="h-1.5 w-full bg-black/60 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-rose-500 rounded-full" style={{ width: `${porcentajeGastado}%` }}></div>
                </div>
                <p className="text-[9px] text-white/40 mt-1 text-right">{Math.round(porcentajeGastado)}% de los aportes</p>
              </div>
            </div>

            {/* Disponible */}
            <div className="bg-blue-900/20 p-4 rounded-2xl border border-blue-500/30 flex justify-between items-center mb-6">
               <div>
                 <p className="text-[10px] text-blue-300 uppercase font-bold tracking-widest">Fondo Disponible</p>
                 <p className="text-xs text-white/50">Plata lista para usar</p>
               </div>
               <p className="text-2xl font-black text-blue-400 font-sans">
                  $<AnimatedNum value={disponible} format="usd" />
               </p>
            </div>

            {/* Botón Simulador */}
            <button
              onClick={onOpenCalculator}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-colors bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 flex items-center justify-center gap-2`}
            >
              <Calculator className="w-4 h-4" /> Simulador de Gastos
            </button>
          </div>
        );
      })}

      {/* Participantes */}
      {participantes && participantes.length > 0 && (
        <div className="bg-[#1a0f2e] border border-blue-500/20 p-4 md:p-5 rounded-3xl">
          <h3 className="text-xs md:text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Viajeros / Miembros ({participantes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {participantes.map((participant: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 px-3 bg-black/40 rounded-xl border border-white/5"
              >
                <span className="font-bold text-white">
                  {participant.nombre || participant}
                </span>
                <span className="text-blue-400/50 text-[9px] uppercase tracking-widest font-bold">Activo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transacciones de la Vaca */}
      {potes.length > 0 && (
        <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden`}>
          <div className="p-4 border-b border-white/5 bg-black/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-400" /> Bitácora de Gastos
            </h3>
          </div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {transactions.filter(tx => tx.categoria.startsWith('pote_')).length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm">
                No hay aportes ni gastos registrados aún.
              </div>
            ) : (
              transactions
                .filter(tx => tx.categoria.startsWith('pote_'))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
                .map((tx) => (
                  <div key={tx.id} className="p-4 flex justify-between hover:bg-white/5">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        tx.tipo === "ingreso"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {tx.tipo === "ingreso" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {tx.descripcion || (tx.tipo === 'ingreso' ? 'Aporte' : 'Gasto')}
                        </p>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">
                          {tx.usuario || "Tú"} · {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-black font-sans tabular-nums ${
                      tx.tipo === "ingreso" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tx.tipo === "ingreso" ? "+" : "-"}$<AnimatedNum
                        value={Math.abs(tx.monto_usd_paralelo || 0)}
                        format="usd"
                      />
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Info de Grupo */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
        <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" /> Reglas de la Vaca
        </h3>
        <ul className="space-y-2 text-[10px] md:text-xs text-white/60">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Los <b>"Ingresos"</b> son los aportes que da cada miembro para llegar al presupuesto.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Los <b>"Egresos"</b> descuentan del fondo disponible para controlar las finanzas durante el viaje o evento.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>El progreso y los gastos son visibles para todos los viajeros en tiempo real.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}