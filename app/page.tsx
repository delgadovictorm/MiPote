"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Wallet, Users, ArrowRight, CheckCircle2,
  Star, ChevronDown,
  Bell, Plus, Target, Calculator, ArrowDownCircle
} from "lucide-react";
import { InstallPWA } from "@/components/UI/InstallPWA";

export default function LandingPage() {
  const router = useRouter();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [mensajeActual, setMensajeActual] = useState(0);
  const [verboActual, setVerboActual] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados para la Calculadora en la Landing
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [calcUsd, setCalcUsd] = useState("");
  const [calcBs, setCalcBs] = useState("");

  const verbosAnimados = ["ORGANIZA", "CUIDA", "ADMINISTRA", "ESTIRA"];

  const mensajesMuestra = [
    { tx: "ingreso", texto: "¡Epa! Ese pote está engordando, mi amor. 🍯💰" },
    { tx: "egreso", texto: "¿De pana necesitábamos gastar en esto? 🤨" },
    { tx: "ingreso", texto: "¡Cayó la plata pa' las frías! La vaca engorda. 🐄🍻" },
    { tx: "egreso", texto: "Mosca con la tarjeta, que nos descuadramos. 💳" }
  ];

  // 🚀 REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGUEADO
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [isMounted, router]);

  // Carrusel para Mensajes y Verbos
  useEffect(() => {
    if (isLoading) return;
    
    const intervaloMensajes = setInterval(() => {
      setMensajeActual((prev) => (prev + 1) % mensajesMuestra.length);
    }, 3500);

    const intervaloVerbos = setInterval(() => {
      setVerboActual((prev) => (prev + 1) % verbosAnimados.length);
    }, 2500);

    return () => {
      clearInterval(intervaloMensajes);
      clearInterval(intervaloVerbos);
    };
  }, [isLoading, mensajesMuestra.length, verbosAnimados.length]);

  // CONEXIÓN API: Traer tasas reales para el mockup y la calculadora
  useEffect(() => {
    const fetchTasa = async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        if (data.success) {
          setRates({ bcv: data.bcv, usdt: data.usdt });
        }
      } catch (error) {
        console.error("Error cargando tasas en landing:", error);
      }
    };
    fetchTasa();
  }, []);

  // LOGICA BIDIRECCIONAL CALCULADORA
  const handleCalcUsd = (val: string) => {
    setCalcUsd(val);
    const num = parseFloat(val) || 0;
    setCalcBs((num * rates.usdt).toFixed(2));
  };

  const handleCalcBs = (val: string) => {
    setCalcBs(val);
    const num = parseFloat(val) || 0;
    setCalcUsd(rates.usdt > 0 ? (num / rates.usdt).toFixed(2) : "0.00");
  };

  if (isLoading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center" suppressHydrationWarning><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" suppressHydrationWarning></div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative" suppressHydrationWarning>
      
      {/* 🌌 FONDO DINÁMICO TIPO MALLA */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* 🧭 NAVBAR FLOTANTE */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] z-50 bg-[#151518]/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 pl-2">
          <img src="/pote.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
          <span className="font-black text-lg uppercase italic tracking-tighter">Mi Pote</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-white/60 uppercase tracking-widest">
          <a href="#caracteristicas" className="hover:text-purple-400 transition-colors">Características</a>
          <a href="#calculadora" className="hover:text-blue-400 transition-colors">Calculadora</a>
          <a href="#precios" className="hover:text-purple-400 transition-colors">Precios</a>
          <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
        </div>
        <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]">
          Iniciar Sesión
        </Link>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative z-10 pt-48 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* TÍTULO CON VERBO DINÁMICO */}
          <h1 className="text-[2.5rem] md:text-7xl lg:text-[6.5rem] font-black italic uppercase tracking-tighter mb-8 leading-[1.1] text-white flex flex-col items-center">
            <span className="mb-2">El pana que te</span>
            <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 w-full">
              
              <div className="relative inline-flex justify-center items-center">
                <span className="invisible py-2 pr-2">ADMINISTRA</span>
                {verbosAnimados.map((verbo, index) => (
                  <span
                    key={verbo}
                    className={`absolute transition-all duration-500 ease-in-out w-full text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-amber-400 py-2 pr-2 ${
                      verboActual === index 
                        ? 'opacity-100 scale-100 blur-none' 
                        : 'opacity-0 scale-95 blur-sm'
                    }`}
                  >
                    {verbo}
                  </span>
                ))}
              </div>
              
              <span className="text-white">LA</span>
              <span className="text-white">PLATA</span>
            </div>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
            Mi Pote no es una App aburrida de finanzas, es la app diseñada para la locura multimoneda de Venezuela. Organiza tu dinero, tus potes en pareja y las vacas con tus panas.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400"><CheckCircle2 size={18}/> Tasas BCV y Paralelo</div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400"><CheckCircle2 size={18}/> 100% Gratis en fase Beta</div>
          </div>

          <Link href="/dashboard" className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-black px-12 py-5 rounded-full font-black text-lg uppercase italic shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-3">
            Empezar ahora <ArrowRight className="w-6 h-6" />
          </Link>
          {/* 📱 BOTÓN DE INSTALACIÓN (Solo visible en móviles) */}
          <div className="mt-8">
            <InstallPWA />
          </div>
        </div>
      </section>

      {/* 📱 SECCIÓN MOCKUP (Cómo se ve) */}
      <section id="caracteristicas" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto bg-[#151518] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          
          <div className="flex-1 space-y-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight mb-4">
              Diseñada para nuestra <span className="text-purple-400">realidad.</span>
            </h2>
            <p className="text-white/50 text-lg mb-8">Visualiza tu dinero en dólares, bolívares y USDT al instante. Nosotros hacemos el arbitraje por ti.</p>
            
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 items-start backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Wallet className="text-purple-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black uppercase text-sm mb-1">Mi Billetera</h4>
                  <p className="text-white/40 text-xs leading-relaxed">Tu espacio personal de control. Registra ingresos y gastos en cualquier moneda y observa cómo se actualiza tu patrimonio neto al instante.</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 items-start backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Target className="text-emerald-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black uppercase text-sm mb-1">Mi Pote</h4>
                  <p className="text-white/40 text-xs leading-relaxed">El espacio para metas compartidas. Ideal para parejas. Comparte un código y ambos podrán registrar aportes para "la nave", "el viaje" o los gastos de la casa.</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 items-start backdrop-blur-sm hover:bg-white/10 transition-colors opacity-60">
                <Users className="text-amber-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black uppercase text-sm mb-1">La Vaca (Próximamente)</h4>
                  <p className="text-white/40 text-xs leading-relaxed">Reúne a todo el grupo. Divide la cuenta de la rumba o el viaje de fin de semana con múltiples amigos sin enredarte con quién pagó qué.</p>
                </div>
              </div>
            </div>
          </div>

          {/* MOCKUP DEL TELÉFONO HECHO EN CSS */}
          <div className="flex-1 flex justify-center relative z-10 w-full mt-10 md:mt-0">
            <div className="relative border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] h-[550px] w-[280px] shadow-2xl overflow-hidden ring-1 ring-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Notch */}
              <div className="w-[120px] h-[25px] bg-gray-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20 flex justify-center items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black/50"></div>
                <div className="w-2 h-2 rounded-full bg-blue-900/50"></div>
              </div>
              
              {/* Pantalla App Falsa */}
              <div className="w-full h-full bg-[#0d0714] p-4 pt-10 flex flex-col gap-4 relative">
                {/* Header App */}
                <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-2"><img src="/pote.png" className="w-6 h-6"/> <span className="font-black text-xs">Mi Pote</span></div>
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Bell size={12} className="text-purple-400"/></div>
                </div>

                {/* Card Falsa */}
                <div className="bg-[#151515] p-4 rounded-3xl border border-white/5 shadow-lg">
                  <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Patrimonio Total</p>
                  <p className="text-3xl font-black text-white">$ 145.50</p>
                  <p className="text-[10px] text-white/30 font-mono mt-1">Bs. 6,547.50 Pral.</p>
                  <div className="flex gap-2 mt-4">
                    <div className="bg-purple-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg">USD</div>
                    <div className="bg-white/5 text-white/30 text-[8px] font-black px-3 py-1.5 rounded-lg">BS</div>
                    <div className="bg-white/5 text-white/30 text-[8px] font-black px-3 py-1.5 rounded-lg">USDT</div>
                  </div>
                </div>

                <div className="bg-[#1a0f2e] border border-emerald-500/30 p-4 rounded-3xl mt-2 relative overflow-hidden">
                  <p className="text-xs font-black text-white flex items-center gap-1"><Star size={12} className="text-emerald-400"/> El Viaje</p>
                  <div className="flex justify-between mt-2 text-[10px]"><span className="text-white/50">Ahorrado:</span><span className="text-emerald-400 font-bold">85%</span></div>
                  <div className="w-full bg-black/50 h-1.5 rounded-full mt-1"><div className="w-[85%] bg-emerald-500 h-full rounded-full"></div></div>
                </div>

                {/* Falso Floating Btn */}
                <div className="absolute bottom-6 right-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/40">
                  <Plus className="text-white" />
                </div>
              </div>
            </div>
            
            {/* ELEMENTO FLOTANTE CON TASA REAL DE LA API */}
            <div className="absolute -bottom-6 -left-6 bg-[#1a0f2e] border border-emerald-500/30 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce z-20">
               <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center"><CheckCircle2 className="text-emerald-400" size={16}/></div>
               <div>
                 <p className="text-[10px] text-white/50 uppercase font-bold">Tasa BCV</p>
                 <p className="text-sm font-black text-white font-sans tabular-nums tracking-tight">
                   Bs. {rates.bcv > 0 ? rates.bcv.toFixed(2) : "..."}
                 </p>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🧮 SECCIÓN CALCULADORA EN LA LANDING */}
      <section id="calculadora" className="relative z-10 py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">Herramienta Gratuita</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight text-white">
              Saca cuentas sin <br className="hidden lg:block"/> <span className="text-blue-400">enredarte.</span>
            </h2>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Prueba cómo funciona nuestro motor de conversión. Ingresa un monto en dólares o bolívares y descubre al instante su equivalente exacto usando las tasas oficiales de Venezuela, actualizadas al día.
            </p>
            <ul className="space-y-4 pt-4 text-left inline-block">
              <li className="flex items-center gap-3 text-sm text-white/70 font-medium"><CheckCircle2 className="text-blue-400 shrink-0" size={20}/> Tasa Oficial BCV</li>
              <li className="flex items-center gap-3 text-sm text-white/70 font-medium"><CheckCircle2 className="text-blue-400 shrink-0" size={20}/> Tasa Dólar Paralelo (USDT)</li>
              <li className="flex items-center gap-3 text-sm text-white/70 font-medium"><CheckCircle2 className="text-blue-400 shrink-0" size={20}/> No requiere registro previo</li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-md w-full relative">
            {/* Efecto de luz detrás de la calculadora */}
            <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className={`relative bg-[#1a0f2e] border border-blue-500/30 p-6 md:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(59,130,246,0.15)] w-full mx-auto`}>
              <h3 className="text-xl font-black text-white flex items-center justify-center gap-3 mb-8">
                <Calculator className={`w-6 h-6 text-blue-400`} /> Calculadora Libre
              </h3>
              
              <div className="space-y-6">
                <div className={`bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner`}>
                  <label className={`text-[10px] uppercase text-white/50 font-bold tracking-widest block mb-2`}>Monto en Dólares ($)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white/30">$</span>
                    <input 
                      type="number" step="0.01" placeholder="0.00" 
                      value={calcUsd} 
                      onChange={(e) => handleCalcUsd(e.target.value)} 
                      className="flex-1 bg-transparent text-4xl font-black text-white outline-none tabular-nums tracking-tight font-sans w-full" 
                    />
                  </div>
                </div>
                
                <div className="flex justify-center -my-3 relative z-10">
                   <div className={`bg-[#1a0f2e] p-2 rounded-full border border-blue-500/30`}>
                      <ArrowDownCircle className={`w-6 h-6 text-blue-400 opacity-50`} />
                   </div>
                </div>

                <div className={`bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner`}>
                  <label className={`text-[10px] uppercase text-white/50 font-bold tracking-widest block mb-2`}>Monto en Bolívares (Bs)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white/30">Bs.</span>
                    <input 
                      type="number" step="0.01" placeholder="0.00" 
                      value={calcBs} 
                      onChange={(e) => handleCalcBs(e.target.value)} 
                      className="flex-1 bg-transparent text-4xl font-black text-white outline-none tabular-nums tracking-tight font-sans w-full" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-white/30 font-bold mb-1">Tasa BCV</p>
                    <p className="text-sm font-black text-white font-sans tabular-nums tracking-tight">Bs. {rates.bcv.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-white/30 font-bold mb-1">Tasa Paralelo</p>
                    <p className="text-sm font-black text-white font-sans tabular-nums tracking-tight">Bs. {rates.usdt.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* 🗣️ MENSAJES VENEZOLANOS */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Te cantamos las <span className="text-amber-400">verdades</span></h2>
          <p className="text-white/50 mb-12 max-w-xl mx-auto">La app no solo saca cuentas, también te regaña si botas los reales o te motiva cuando ahorras pa' cumplir el objetivo.</p>

          <div className="h-32 relative max-w-md mx-auto">
            {mensajesMuestra.map((m, i) => (
              <div key={i} 
                   className={`absolute top-0 left-0 w-full bg-[#1a0f2e] border-2 ${m.tx === 'ingreso' ? 'border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 'border-rose-500/30 shadow-[0_10px_30px_rgba(244,63,94,0.1)]'} p-6 rounded-3xl flex items-center gap-4 transition-all duration-500`}
                   style={{
                     opacity: mensajeActual === i ? 1 : 0,
                     transform: `translateY(${mensajeActual === i ? '0px' : '20px'}) scale(${mensajeActual === i ? 1 : 0.95})`,
                     pointerEvents: mensajeActual === i ? 'auto' : 'none'
                   }}>
                <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${m.tx === 'ingreso' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {m.tx === 'ingreso' ? '🤑' : '📉'}
                </div>
                <p className="text-white font-black italic text-left leading-tight">"{m.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💰 PRICING */}
      <section id="precios" className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-16">Planes para todos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* TIER GRATIS */}
            <div className="bg-[#151518] p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Modo Base</span>
                <p className="text-5xl font-black italic mt-4 mb-8 text-white">GRATIS</p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-sm text-white/60"><CheckCircle2 size={16} className="text-white/30"/> Mi Billetera personal</li>
                  <li className="flex items-center gap-3 text-sm text-white/60"><CheckCircle2 size={16} className="text-white/30"/> Sin límite de registros</li>
                  <li className="flex items-center gap-3 text-sm text-white/60"><CheckCircle2 size={16} className="text-white/30"/> Calculadora Multimoneda</li>
                  <li className="flex items-center gap-3 text-sm text-white/60"><CheckCircle2 size={16} className="text-white/30"/> Control Presupuestario Base Cero</li>
                  <li className="flex items-center gap-3 text-sm text-white/60"><CheckCircle2 size={16} className="text-white/30"/> Escaneo de facturas con IA (15 al mes)</li>
                </ul>
              </div>
              <Link href="/dashboard" className="text-center py-4 rounded-2xl border border-white/10 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all text-white">
                Comenzar Gratis
              </Link>
            </div>

            {/* TIER PRO */}
            <div className="bg-[#1a0f2e] p-10 rounded-[3rem] border border-amber-500/30 relative shadow-xl flex flex-col justify-between transform md:-translate-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Modo Pro</span>
                <div className="flex items-baseline gap-2 mt-4 mb-8">
                  <p className="text-5xl font-black italic text-white">$2</p>
                  <p className="text-white/40 text-xs">/mes, a tasa BCV</p>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="text-amber-400" size={16} /> Todo lo del plan Gratis</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="text-amber-400" size={16} /> Potes compartidos (pareja o familia)</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="text-amber-400" size={16} /> Las Vacas (planes entre amigos)</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="text-amber-400" size={16} /> Hacer Mercado (lista de compras en vivo)</li>
                  <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="text-amber-400" size={16} /> Escaneos con IA ilimitados</li>
                </ul>
              </div>
              <Link href="/dashboard" className="text-center py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black uppercase tracking-widest text-xs text-black transition-all">
                Hazte PRO
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 🤔 FAQ ACORDEÓN */}
      <section id="faq" className="py-20 px-6 relative z-10 bg-white/[0.01] border-t border-white/5 mt-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase italic mb-4">Preguntas Frecuentes</h2>
            <p className="text-white/50">Resolvemos tus dudas más comunes sobre Mi Pote</p>
          </div>

          <div className="space-y-3">
            {[
              { q: "¿Qué es Mi Pote?", a: "Es una app financiera adaptada a Venezuela. Te permite registrar gastos en bolívares, pero visualizar tu patrimonio real en dólares usando las tasas BCV y Paralelo actualizadas. Además, te permite compartir cuentas con tu pareja o amigos." },
              { q: "¿Cómo funcionan los Potes compartidos?", a: "Es sencillo. Un usuario crea el Pote y la aplicación genera un código único de 6 dígitos. La otra persona simplemente ingresa ese código al registrarse y ¡listo!, ambos verán el mismo balance en tiempo real." },
              { q: "¿Se conecta directamente a mi cuenta bancaria?", a: "No. Por seguridad y privacidad, Mi Pote funciona como un registro manual (pero inteligente). Tú anotas lo que gastas y nosotros hacemos toda la matemática compleja por ti." },
              { q: "¿Es realmente gratis?", a: "Sí, durante nuestro periodo de Beta y desarrollo activo, todas las funciones de 'Mi Billetera' y 'Mi Pote' (para parejas) están abiertas al público sin costo." }
            ].map((faq, idx) => (
              <div key={idx} className={`border ${faqOpen === idx ? 'border-purple-500 bg-[#1a0f2e]' : 'border-white/5 bg-[#151518] hover:bg-white/5'} rounded-2xl transition-all overflow-hidden`}>
                <button 
                  suppressHydrationWarning
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} 
                  className="w-full p-5 flex items-center justify-between font-bold text-left"
                >
                  <span className={faqOpen === idx ? 'text-purple-400' : 'text-white'}>{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-purple-400' : 'text-white/30'}`} size={20}/>
                </button>
                <div className={`px-5 text-sm text-white/50 leading-relaxed transition-all duration-300 ${faqOpen === idx ? 'pb-5 opacity-100' : 'h-0 opacity-0 pb-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10 bg-[#09090b]">
        <div className="flex justify-center mb-4 opacity-30 grayscale"><img src="/pote.png" className="w-8"/></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">© 2026 Mi Pote venezuela</p>
      </footer>
    </div>
  );
}