"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PagosTab } from "@/components/Dashboard/PagosTab";
import { useRates } from "@/hooks/useRates";
import { useEspacio } from "@/contexts/EspacioContext";

export default function PresupuestoPage() {
  const router = useRouter();
  const { rates, loading: ratesLoading } = useRates();
  const { espacioActivo } = useEspacio();

  const theme = { primary: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/30', card: 'from-purple-600/40', darkBg: 'bg-purple-950/30', stroke: '#9333ea', lightBg: 'bg-purple-500/10' };
  const triggerToast = (msg: string) => console.log(msg);

  if (ratesLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
      >
        ← Volver al Dashboard
      </button>
      <PagosTab
        rates={rates}
        theme={theme}
        triggerToast={triggerToast}
        // Aquí pasarían más props desde contexto/hooks
      />
    </div>
  );
}