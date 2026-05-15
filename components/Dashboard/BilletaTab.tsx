"use client";

import React, { useState } from "react";
import { Wallet, Eye, EyeOff, Copy, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedNum } from "@/components/AnimatedNum";
import type { Espacio, Perfil } from "@/types";

interface BilletaTabProps {
  espacioActivo: Espacio | null;
  perfil: Perfil | null;
  session: any;
  transactions: any[];
  rates: any;
  theme: any;
  getSaldosAislados: (userName: string) => any;
  triggerToast?: (msg: string, type?: string) => void;
}

export function BilletaTab({
  espacioActivo,
  perfil,
  session,
  transactions,
  rates,
  theme,
  getSaldosAislados,
  triggerToast,
}: BilletaTabProps) {
  const [activeWallet, setActiveWallet] = useState<'usdt' | 'bs' | 'cash'>('usdt');
  const [showBalance, setShowBalance] = useState(true);

  const nombreUsuario = perfil?.nombre || session?.user?.email?.split("@")[0] || "Invitado";
  const saldos = getSaldosAislados(nombreUsuario);

  const wallets = [
    { id: 'usdt', label: 'USDT', icon: '💵', saldo: saldos.usdt || 0, color: 'blue' },
    { id: 'bs', label: 'BS', icon: '🇻🇪', saldo: saldos.bs || 0, color: 'yellow' },
    { id: 'cash', label: 'CASH', icon: '💸', saldo: saldos.cash || 0, color: 'green' }
  ];

  const currentWallet = wallets.find(w => w.id === activeWallet);
  const walletTransactions = transactions
    .filter(tx => {
      const monedaEstricta = tx.moneda_original || (tx.monto_original > 1000 ? 'bs' : 'usdt');
      return monedaEstricta === activeWallet;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast?.("Copiado al portapapeles", "success");
  };

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-amber-500 to-amber-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className="space-y-6">
      {/* Billetera Activa */}
      {currentWallet && (
        <div className={`bg-gradient-to-br ${colorMap[currentWallet.color]} p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">
                  Billetera {currentWallet.label}
                </p>
                <p className="text-4xl md:text-5xl font-black text-white font-sans tabular-nums tracking-tight">
                  {showBalance ? <AnimatedNum value={currentWallet.saldo} format="usd" /> : "****"}
                </p>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={() => handleCopy(currentWallet.saldo.toString())}
              className="flex items-center gap-2 text-white/70 hover:text-white text-xs transition-colors"
            >
              <Copy className="w-4 h-4" /> Copiar saldo
            </button>
          </div>
        </div>
      )}

      {/* Selector de Billetera */}
      <div className="grid grid-cols-3 gap-3">
        {wallets.map(wallet => (
          <button
            key={wallet.id}
            onClick={() => setActiveWallet(wallet.id as 'usdt' | 'bs' | 'cash')}
            className={`p-4 rounded-2xl transition-all ${
              activeWallet === wallet.id
                ? `${theme.primary} shadow-lg scale-105`
                : `${theme.lightBg} hover:${theme.lightBg}`
            }`}
          >
            <p className="text-2xl mb-2">{wallet.icon}</p>
            <p className="text-xs font-bold text-white mb-1">{wallet.label}</p>
            <p className={`text-sm font-black ${
              activeWallet === wallet.id ? 'text-white' : 'text-white/60'
            }`}>
              ${wallet.saldo.toFixed(2)}
            </p>
          </button>
        ))}
      </div>

      {/* Transacciones de la Billetera */}
      <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden`}>
        <div className="p-4 border-b border-white/5 bg-black/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            Transacciones {currentWallet?.label}
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
          {walletTransactions.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              No hay transacciones en {currentWallet?.label} aún.
            </div>
          ) : (
            walletTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
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
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {tx.descripcion || tx.categoria}
                    </p>
                    <p className="text-[9px] text-white/40">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-black font-sans tabular-nums flex-shrink-0 ml-2 ${
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

      {/* Resumen de Movimientos */}
      <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl`}>
        <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-400" /> Resumen
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded-xl">
            <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">
              Total Ingresos
            </p>
            <p className="text-lg font-black text-emerald-400 font-sans">
              $<AnimatedNum
                value={walletTransactions
                  .filter(tx => tx.tipo === 'ingreso')
                  .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0)}
                format="usd"
              />
            </p>
          </div>
          <div className="bg-black/30 p-4 rounded-xl">
            <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">
              Total Egresos
            </p>
            <p className="text-lg font-black text-rose-400 font-sans">
              $<AnimatedNum
                value={walletTransactions
                  .filter(tx => tx.tipo === 'egreso')
                  .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0)}
                format="usd"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
