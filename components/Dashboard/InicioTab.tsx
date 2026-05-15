"use client";

import React, { useState } from "react";
import { Eye, EyeOff, PieChart as PieChartIcon, TrendingUp, TrendingDown, Target } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Espacio, Perfil } from "@/types";

interface InicioTabProps {
  espacioActivo: Espacio | null;
  perfil: Perfil | null;
  potes: any[];
  session: any;
  transactions: any[];
  rates: any;
  theme: any;
  participantes?: any[];
  getPoteAhorrado?: (poteId: string, poteName: string) => number;
  setIsAddingPote?: (val: boolean) => void;
  setPoteForm?: (form: any) => void;
  getSaldosAislados: (userName: string) => any;
  getPatrimonioNeto: () => any;
  onNavigateToTab?: (tab: string) => void;
  triggerToast?: (msg: string, type?: string) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function InicioTab({
  espacioActivo,
  perfil,
  potes,
  session,
  transactions,
  rates,
  theme,
  participantes = [],
  getPoteAhorrado,
  setIsAddingPote,
  setPoteForm,
  getSaldosAislados,
  getPatrimonioNeto,
  triggerToast,
}: InicioTabProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isPieChartVisible, setIsPieChartVisible] = useState(false);
  
  // NUEVO ESTADO PARA EL TOGGLE DEL PATRIMONIO
  const [patrimonioRate, setPatrimonioRate] = useState<'paralelo' | 'bcv'>('paralelo');

  const nombreUsuario = perfil?.nombre || session?.user?.email?.split("@")[0] || "Invitado";
  const saldoPrincipal = getSaldosAislados(nombreUsuario);
  
  const patrimonioInfo = getPatrimonioNeto();
  // Ahora el patrimonio total depende del botón que esté activo (BCV o Paralelo)
  const patrimonioTotal = typeof patrimonioInfo === 'number' ? patrimonioInfo : (patrimonioInfo?.[patrimonioRate] || 0);

  // Datos para gráfico
  const saldosData = Object.entries(saldoPrincipal || {})
    .filter(([_, val]: any) => val > 0)
    .map(([key, val]: any) => ({
      name: key.toUpperCase(),
      value: parseFloat(val.toFixed(2)),
    }));

  // Vaca (Group Goal) View
  if (espacioActivo?.tipo === "vaca" && potes.length > 0) {
    const ahorrado = getPoteAhorrado?.(potes[0].id, potes[0].nombre) || 0;
    const porcentaje = Math.min((ahorrado / potes[0].monto_objetivo) * 100, 100);
    const faltante = Math.max(potes[0].monto_objetivo - ahorrado, 0);

    return (
      <div className="space-y-6">
        <div className={`bg-[#1a0f2e] border-2 border-emerald-500/30 p-5 md:p-6 rounded-[2rem] shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden`}>
          {porcentaje >= 100 && (
            <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-4 rounded-xl">
              <span className="text-3xl mb-1">🎉</span>
              <h3 className="text-white font-black text-lg">¡Vaca Completada!</h3>
            </div>
          )}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  {potes[0].nombre}
                  <span className="text-emerald-400 text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">META: ${potes[0].monto_objetivo} USDT</span>
                </h2>
                <p className="text-xs text-white/50 mt-1">Faltan $<AnimatedNum value={faltante} format="usd" /> USD</p>
              </div>
              <span className="text-sm md:text-base font-black text-emerald-400"><AnimatedNum value={porcentaje} format="pct" /></span>
            </div>

            <div className="h-3 w-full bg-black/60 rounded-full border border-white/5 p-0.5 mt-2">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${porcentaje}%`, transition: 'width 1s ease-in-out' }}></div>
            </div>

            <p className="text-[10px] text-white/40 mt-2">Ahorrado: $<AnimatedNum value={ahorrado} format="usd" /> USDT</p>
          </div>
        </div>

        {/* Participantes */}
        {participantes && participantes.length > 0 && (
          <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
            <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Participantes ({participantes.length})
            </h3>
            <div className="space-y-2">
              {participantes.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs text-white/70 py-1 border-b border-white/5 last:border-b-0">
                  <span>{p.nombre || p}</span>
                  <span className="font-bold text-white">Miembro</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Individual wallet view
  return (
    <div className="space-y-6">
      {/* Patrimonio Principal */}
      <div
        className={`${theme.primary} p-6 md:p-8 rounded-[2rem] shadow-[0_0_20px_rgba(192,38,211,0.2)] relative overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(192,38,211,0.3)] transition-shadow`}
        onClick={() => setShowBalance(!showBalance)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs md:text-sm text-white/60 uppercase font-bold tracking-widest flex items-center gap-2">
                Patrimonio Neto 
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-white mt-2 font-sans tabular-nums tracking-tight">
                ${showBalance ? <AnimatedNum value={patrimonioTotal} format="usd" /> : "****"}
              </h1>
            </div>
            <button className="text-white/60 hover:text-white transition-colors">
              {showBalance ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* TOGGLE RATE BUTTONS (Z-Index alto para que se pueda clickear sin apagar el saldo) */}
          <div className="flex bg-black/20 p-1 rounded-xl w-max mt-4 backdrop-blur-sm border border-white/10" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setPatrimonioRate('paralelo')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${patrimonioRate === 'paralelo' ? `bg-white text-black shadow-md` : 'text-white/60 hover:text-white'}`}>PARALELO</button>
             <button onClick={() => setPatrimonioRate('bcv')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${patrimonioRate === 'bcv' ? `bg-white text-black shadow-md` : 'text-white/60 hover:text-white'}`}>BCV</button>
          </div>

        </div>
      </div>

      {/* Saldos por Tipo */}
      {saldosData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {saldosData.map((item, idx) => (
            <div
              key={item.name}
              className={`bg-[#1a0f2e] border ${theme.border} p-4 rounded-2xl text-center hover:${theme.lightBg} transition-colors`}
            >
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide mb-2">
                {item.name}
              </p>
              <p className="text-lg md:text-xl font-black text-white font-sans tabular-nums">
                $<AnimatedNum value={item.value} format="usd" />
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Últimas Transacciones */}
      <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden`}>
        <div className="p-4 border-b border-white/5 bg-black/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            Últimos Movimientos
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              No hay movimientos aún.
            </div>
          ) : (
            transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.tipo === "ingreso"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {tx.tipo === "ingreso" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">
                      {tx.descripcion}
                    </p>
                    <p className="text-[9px] text-white/40">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-black font-sans tabular-nums ${
                    tx.tipo === "ingreso"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {tx.tipo === "ingreso" ? "+" : "-"}$
                  <AnimatedNum
                    value={Math.abs(tx.monto_usd_paralelo || 0)}
                    format="usd"
                  />
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Metas */}
      {potes && potes.length > 0 && (
        <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
          <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Tus Metas
          </h3>
          <div className="space-y-3">
            {potes.slice(0, 3).map((pote: any) => {
              const ahorrado = getPoteAhorrado?.(pote.id, pote.nombre) || 0;
              const porcentaje = Math.min((ahorrado / pote.monto_objetivo) * 100, 100);
              return (
                <div key={pote.id} className="bg-black/30 p-3 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-white">{pote.nombre}</p>
                    <span className="text-[10px] font-black text-emerald-400">{Math.round(porcentaje)}%</span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${porcentaje}%` }}></div>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">$<AnimatedNum value={ahorrado} /> / ${pote.monto_objetivo}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}