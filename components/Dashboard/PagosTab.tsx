"use client";

import React, { useState, useCallback } from "react";
import { Target, Home, Plus, Trash2, PieChart as PieChartIcon, CreditCard, Calendar, CheckSquare, Square, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Drawer } from "vaul";
import type { Espacio } from "@/types";

interface PagosTabProps {
  espacioActivo: Espacio | null;
  session: any;
  transactions: any[];
  transaccionesFiltradas: any[];
  cuotasCashea: any[];
  presupuestos: any[];
  gastosFijos: any[];
  categoriasList?: any[];
  theme: any;
  mesActual: string;
  filtroHistorial: string;
  filterOptions: string[];
  nombresParticipantes: string[];
  isAddingCashea: boolean;
  setIsAddingCashea: (value: boolean) => void;
  isAddingFijo: boolean;
  setIsAddingFijo: (value: boolean) => void;
  isEditingBudget: boolean;
  setIsEditingBudget: (value: boolean) => void;
  casheaForm: any;
  setCasheaForm: (value: any) => void;
  budgetForm: any;
  setBudgetForm: (value: any) => void;
  fijoForm: any;
  setFijoForm: (value: any) => void;
  onAgregarCashea?: (e: React.FormEvent) => Promise<void>;
  onAgregarGastoFijo?: (e: React.FormEvent) => Promise<void>;
  onAgregarPresupuesto?: (e: React.FormEvent) => Promise<void>;
  onToggleCashea?: (cuota: any) => void;
  onToggleGastoFijo?: (id: string) => void;
  onEliminarGastoFijo?: (id: string) => void;
  onEliminarTransaccion?: (id: string) => void;
  onSetMesActual: (mes: string) => void;
  onSetFiltroHistorial: (filtro: string) => void;
  triggerToast?: (msg: string, type?: string) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const DEFAULT_CATEGORIES = [
  { valor: 'comida', label: 'Comida' },
  { valor: 'cashea', label: 'Cashea' },
  { valor: 'internet', label: 'Internet' },
  { valor: 'mascotas', label: 'Mascotas' },
  { valor: 'condominio', label: 'Condominio' },
  { valor: 'regalos', label: 'Regalos' },
  { valor: 'otro', label: 'Otro' }
];

export function PagosTab({  session,
  espacioActivo,
  perfil,
  transactions,
  transaccionesFiltradas,
  cuotasCashea,
  presupuestos,
  gastosFijos,
  categoriasList,
  theme,
  mesActual,
  filtroHistorial,
  filterOptions,
  nombresParticipantes,
  isAddingCashea,
  setIsAddingCashea,
  isAddingFijo,
  setIsAddingFijo,
  isEditingBudget,
  setIsEditingBudget,
  casheaForm,
  setCasheaForm,
  budgetForm,
  setBudgetForm,
  fijoForm,
  setFijoForm,
  onAgregarCashea,
  onAgregarGastoFijo,
  onAgregarPresupuesto,
  onToggleCashea,
  onToggleGastoFijo,
  onEliminarGastoFijo,
  onEliminarTransaccion,
  onSetMesActual,
  onSetFiltroHistorial,
}: PagosTabProps) {
  const [isChartVisible, setIsChartVisible] = useState(false);

  // Calcular gastos por categoría para el gráfico
  const gastosPorCategoria = transaccionesFiltradas
    .filter((tx) => tx.tipo === "egreso")
    .reduce((acc, tx) => {
      const cat = tx.categoria || "otro";
      acc[cat] = (acc[cat] || 0) + (tx.monto_usd_paralelo || 0);
      return acc;
    }, {});

  const dataGraficoTorta = Object.keys(gastosPorCategoria)
    .map((key) => ({ name: key, value: gastosPorCategoria[key] }))
    .sort((a, b) => b.value - a.value);

  const COLORS = [
    theme.stroke,
    "#ec4899",
    "#f97316",
    "#eab308",
    "#10b981",
    "#0ea5e9",
    "#6366f1",
    "#d946ef",
  ];

  return (
    <div className="space-y-6">
      {/* Presupuestos */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-5 rounded-3xl`}>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`} />
            Presupuestos
          </h3>
          <button
            onClick={() => setIsEditingBudget(true)}
            className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}
          >
            <Plus className="w-3 h-3" />
            Nuevo
          </button>
        </div>

        <div className="space-y-2">
          {presupuestos.length === 0 ? (
            <p className="text-[10px] md:text-xs text-white/50 italic px-2">
              No hay presupuestos configurados.
            </p>
          ) : (
            presupuestos.map((pres) => {
              const gastado = transaccionesFiltradas
                .filter((tx) => tx.categoria === pres.categoria && tx.tipo === "egreso")
                .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
              const porcentaje = Math.min((gastado / pres.monto_limite) * 100, 100);

              return (
                <div key={pres.id} className="bg-black/40 p-3 md:p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs md:text-sm font-bold text-white">
                      {pres.categoria}
                    </p>
                    <p className="text-xs text-white/40">
                      ${gastado.toFixed(2)} / ${pres.monto_limite}
                    </p>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        porcentaje > 90
                          ? "bg-rose-500"
                          : porcentaje > 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    {Math.round(porcentaje)}% usado
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gastos Fijos */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-5 rounded-3xl`}>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
            <Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`} />
            Gastos Fijos
          </h3>
          <button
            onClick={() => setIsAddingFijo(true)}
            className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}
          >
            <Plus className="w-3 h-3" />
            Nuevo
          </button>
        </div>

        <div className="space-y-2">
          {gastosFijos.length === 0 ? (
            <p className="text-[10px] md:text-xs text-white/50 italic px-2">
              No hay gastos fijos configurados.
            </p>
          ) : (
            gastosFijos.map((gf: any) => (
              <div
                key={gf.id}
                className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${
                  gf.pagado ? "bg-emerald-900/20 border-emerald-500/30" : `bg-black/40 ${theme.border}`
                }`}
              >
                <div
                  className="flex items-center gap-2.5 md:gap-3 cursor-pointer"
                  onClick={() => onToggleGastoFijo(gf.id)}
                >
                  {gf.pagado ? (
                    <CheckSquare className="text-emerald-400 w-5 h-5" />
                  ) : (
                    <Square className={`${theme.text} w-5 h-5`} />
                  )}
                  <div>
                    <p className="text-xs md:text-sm font-bold text-white">
                      {gf.descripcion}
                    </p>
                    <p className={`text-[10px] text-white/40 mt-0.5`}>
                      Se paga los días {gf.dia_pago}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-sans tabular-nums tracking-tight font-black ${
                      gf.pagado ? "text-emerald-400/50" : "text-rose-400"
                    }`}
                  >
                    ${parseFloat(gf.monto).toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarGastoFijo?.(gf.id);
                    }}
                    className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cashea */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-5 rounded-3xl`}>
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
            <Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`} />
            Cashea
          </h3>
          <button
            onClick={() => setIsAddingCashea(true)}
            className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}
          >
            <Plus className="w-3 h-3" />
            Nuevo Pago
          </button>
        </div>

        <div className="space-y-2">
          {cuotasCashea.length === 0 ? (
            <p className="text-[10px] md:text-xs text-white/50 italic px-2">
              No hay cuotas pendientes.
            </p>
          ) : (
            cuotasCashea.map((cuota) => (
              <div
                key={cuota.id}
                className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${
                  cuota.pagado ? "bg-emerald-900/20 border-emerald-500/30" : `bg-black/40 ${theme.border}`
                }`}
              >
                <div
                  className="flex items-center gap-2.5 md:gap-3 cursor-pointer"
                  onClick={() => onToggleCashea?.(cuota)}
                >
                  {cuota.pagado ? (
                    <CheckSquare className="text-emerald-400 w-5 h-5" />
                  ) : (
                    <Square className={`${theme.text} w-5 h-5`} />
                  )}
                  <div>
                    <p className="text-xs md:text-sm font-bold text-white">
                      {cuota.articulo}{" "}
                      <span className={`text-[8px] md:text-[10px] ${theme.text} font-normal ml-1 ${theme.lightBg} px-2 py-0.5 rounded-md`}>
                        {cuota.usuario || "Usuario"}
                      </span>
                    </p>
                    <p className={`text-[10px] text-white/40 mt-0.5`}>
                      Vence: {cuota.fecha_pago}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-sans tabular-nums tracking-tight font-black ${
                      cuota.pagado ? "text-emerald-400/50" : "text-rose-400"
                    }`}
                  >
                    ${cuota.monto_cuota}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("¿Eliminar esta cuota de Cashea?")) {
                        await onEliminarTransaccion?.(cuota.id);
                      }
                    }}
                    className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historial del Mes */}
      <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}>
        <div className={`p-3 border-b border-white/5 bg-black/20 flex flex-col gap-3`}>
          <div className={`flex justify-between items-center text-xs font-bold uppercase text-white/70`}>
            <span>Historial del Mes</span>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={mesActual}
                onChange={(e) => onSetMesActual(e.target.value)}
                className={`bg-black/50 border ${theme.border} rounded-lg p-1 text-white outline-none text-[10px]`}
              />
              <button
                onClick={() => setIsChartVisible(!isChartVisible)}
                className={`p-2 rounded-lg ${
                  isChartVisible ? theme.primary : "bg-white/10"
                } text-white transition-colors`}
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          {espacioActivo?.tipo !== "individual" && filterOptions.length > 1 && (
            <div className="flex flex-wrap gap-2 p-1 bg-black/50 rounded-xl">
              {filterOptions.map((filtro) => (
                <button
                  key={filtro}
                  onClick={() => onSetFiltroHistorial(filtro)}
                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg transition-colors ${
                    filtroHistorial === filtro
                      ? `${theme.primary} text-white`
                      : `text-white/50 hover:${theme.lightBg}`
                  }`}
                >
                  {filtro}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gráfico de Gastos */}
        {isChartVisible && dataGraficoTorta.length > 0 && (
          <div className="p-4 border-b border-white/5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dataGraficoTorta}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataGraficoTorta.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    background: "#121212",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {transaccionesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              No hay registros en este mes.
            </div>
          ) : (
            transaccionesFiltradas.map((tx) => (
              <div key={tx.id} className="p-3 flex justify-between hover:bg-white/5 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`p-1.5 rounded-xl shrink-0 ${
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
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      {tx.descripcion}
                    </p>
                    <p className="text-[8px] text-white/40 uppercase truncate">
                      {tx.usuario} • {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm font-black font-sans tabular-nums tracking-tight ${
                        tx.tipo === "ingreso"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      $<AnimatedNum value={tx.monto_usd_paralelo || 0} format="usd" />
                    </p>
                    {tx.moneda_original === "bs" && (
                      <p className="text-[9px] text-white/30 font-sans tabular-nums font-medium">
                        Bs. {(tx.monto_original || 0).toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onEliminarTransaccion(tx.id)}
                    className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drawers para formularios */}
      {/* Drawer para Cashea */}
      <Drawer.Root open={isAddingCashea} onOpenChange={setIsAddingCashea}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
            <Drawer.Title className="sr-only">Registrar Cuota Cashea</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">
                Registrar Cuota Cashea
              </h3>

              <form onSubmit={onAgregarCashea} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    ¿Qué compraste?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Zapatos Nike"
                    value={casheaForm.articulo}
                    onChange={(e) => setCasheaForm({ ...casheaForm, articulo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="flex gap-4 items-start min-h-[80px]">
                  <div className="w-1/2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                      Monto Cuota ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={casheaForm.monto_cuota}
                      onChange={(e) => setCasheaForm({ ...casheaForm, monto_cuota: e.target.value })}
                      className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-purple-500`}
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                      Fecha de Pago
                    </label>
                    <input
                      type="date"
                      value={casheaForm.fecha_pago}
                      onChange={(e) => setCasheaForm({ ...casheaForm, fecha_pago: e.target.value })}
                      className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500 h-[64px]`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Responsable
                  </label>
                  <select
                    required
                    value={casheaForm.usuario}
                    onChange={(e) => setCasheaForm({ ...casheaForm, usuario: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer appearance-none focus:border-purple-500`}
                  >
                    <option value="">¿Quién debe pagar?</option>
                    {espacioActivo?.tipo === "individual"
                      ? <option value={(perfil?.nombre || session?.user?.email?.split("@")[0]) || "Invitado"}>Tú</option>
                      : nombresParticipantes.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className={`w-full bg-purple-600 text-white font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-6 active:scale-95 transition-transform`}
                >
                  Guardar Cuota
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Drawer para Gastos Fijos */}
      <Drawer.Root open={isAddingFijo} onOpenChange={setIsAddingFijo}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
            <Drawer.Title className="sr-only">Agregar Gasto Fijo</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">
                Agregar Gasto Fijo
              </h3>

              <form onSubmit={onAgregarGastoFijo} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Internet, Condominio"
                    value={fijoForm.descripcion}
                    onChange={(e) => setFijoForm({ ...fijoForm, descripcion: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex gap-4 items-start min-h-[80px]">
                  <div className="w-1/2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                      Monto ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={fijoForm.monto}
                      onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })}
                      className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-emerald-500`}
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                      Día de Pago (1 al 31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={fijoForm.dia_pago}
                      onChange={(e) => setFijoForm({ ...fijoForm, dia_pago: e.target.value })}
                      className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-emerald-500`}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`w-full bg-emerald-500 text-black font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 active:scale-95 transition-transform`}
                >
                  Guardar Fijo
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Drawer para Presupuestos */}
      <Drawer.Root open={isEditingBudget} onOpenChange={setIsEditingBudget}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
            <Drawer.Title className="sr-only">Agregar Presupuesto</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">
                Agregar Presupuesto
              </h3>

              <form onSubmit={onAgregarPresupuesto} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Categoría
                  </label>
                  <select
                    value={budgetForm.categoria}
                    onChange={(e) => setBudgetForm({ ...budgetForm, categoria: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categoriasList.map((cat) => (
                      <option key={cat.valor} value={cat.valor}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">
                    Monto Límite ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetForm.monto_limite}
                    onChange={(e) => setBudgetForm({ ...budgetForm, monto_limite: e.target.value })}
                    className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-purple-500`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full bg-purple-600 text-white font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-6 active:scale-95 transition-transform`}
                >
                  Guardar Presupuesto
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
