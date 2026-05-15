"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalculadoraTab } from "@/components/Dashboard/CalculadoraTab";
import { useRates } from "@/hooks/useRates";

export default function CalculadoraPage() {
  const router = useRouter();
  const { rates, loading } = useRates();

  const theme = { primary: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/30', card: 'from-purple-600/40', darkBg: 'bg-purple-950/30', stroke: '#9333ea', lightBg: 'bg-purple-500/10' };
  const triggerToast = (msg: string) => console.log(msg);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <CalculadoraTab
        rates={rates}
        theme={theme}
        triggerToast={triggerToast}
        onBack={() => router.push('/dashboard')}
      />
    </div>
  );
}