"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles, Eye, Calculator, CreditCard, ShoppingCart, Heart,
  Shield, Flame, Edit2, Globe, Camera, ArrowRight, ArrowLeft, X,
} from "lucide-react";

interface TutorialOnboardingProps {
  onClose: () => void;
}

const PASOS = [
  {
    selector: null as string | null,
    icon: Sparkles,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    titulo: "¡Bienvenido a Mi Pote!",
    texto: "Un recorrido rápido para que sepas dónde está todo. Te voy a ir señalando cada función directo en la pantalla.",
  },
  {
    selector: '[data-tutorial="fab"]',
    icon: Camera,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    titulo: "Registra tus movimientos",
    texto: "Con este botón registras cualquier ingreso o gasto — a mano, o escaneando una factura/Pago Móvil para que la IA lo llene por ti (15 escaneos gratis al mes).",
  },
  {
    selector: '[data-tutorial="patrimonio"]',
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    titulo: "Tu Patrimonio Neto",
    texto: "Toca el monto para ver el desglose por cuenta (dólares, bolívares, efectivo).",
  },
  {
    selector: '[data-tutorial="ojito"]',
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    titulo: "Ocultar el saldo",
    texto: "Toca el ojito para ocultar el monto en pantalla, por si alguien más está viendo.",
  },
  {
    selector: '[data-tutorial="tasa-oficial"]',
    icon: Globe,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    titulo: "Tasas de cambio",
    texto: "Aquí ves BCV, Paralelo y las que tú elijas. Adentro hay un botón \"+ Añadir tasa\" para sumar Euro, Peso Colombiano o Mexicano.",
  },
  {
    selector: '[data-tutorial="simulador"]',
    icon: Calculator,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    titulo: "Simulador y Calculadora",
    texto: "Convierte rápido aquí mismo, o toca el ícono de calculadora para abrir la versión completa — ahí también puedes escanear un precio con la cámara.",
  },
  {
    selector: '[data-tutorial="nav-presupuesto"]',
    icon: CreditCard,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    titulo: "Presupuesto",
    texto: "Pon topes por categoría, gastos fijos mensuales y tus cuotas de Cashea. Puedes escanear la captura de tus cuotas pendientes y se registran solas.",
  },
  {
    selector: '[data-tutorial="nav-mercado"]',
    icon: ShoppingCart,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    titulo: "Hacer Mercado",
    texto: "Modo lista de compras en vivo: ve agregando productos y mira el total sumar mientras estás en la tienda.",
  },
  {
    selector: '[data-tutorial="nav-espacios"]',
    icon: Heart,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    titulo: "Potes y Vacas",
    texto: "Aquí creas o cambias entre tu Billetera, un Pote (finanzas en pareja/familia) o una Vaca (planes entre amigos). Potes y Vacas son función PRO.",
  },
  {
    selector: '[data-tutorial="nav-reserva"]',
    icon: Shield,
    color: "text-white",
    bg: "bg-white/10",
    titulo: "Reserva (por si acaso)",
    texto: "Un fondo de emergencia separado de tu día a día, para que no lo toques sin querer.",
  },
  {
    selector: '[data-tutorial="racha"]',
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    titulo: "Tu racha",
    texto: "Cada día que entras y registras algo suma a tu racha 🔥. Entre más constante seas, más sube tu rango.",
  },
  {
    selector: '[data-tutorial="editar-nombre"]',
    icon: Edit2,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    titulo: "Cambia el nombre",
    texto: "Toca el lápiz para renombrar tu espacio — útil si tienes varios Potes o Vacas.",
  },
];

function medirElemento(selector: string | null): DOMRect | null {
  if (!selector) return null;
  const nodos = document.querySelectorAll(selector);
  let visible: Element | null = null;
  nodos.forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) visible = n;
  });
  return visible ? (visible as Element).getBoundingClientRect() : null;
}

export function TutorialOnboarding({ onClose }: TutorialOnboardingProps) {
  const [paso, setPaso] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const esUltimo = paso === PASOS.length - 1;
  const actual = PASOS[paso];
  const Icono = actual.icon;

  useEffect(() => {
    const actualizar = () => setRect(medirElemento(actual.selector));
    actualizar();
    const t = setTimeout(actualizar, 60);
    window.addEventListener("resize", actualizar);
    window.addEventListener("scroll", actualizar, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", actualizar);
      window.removeEventListener("scroll", actualizar, true);
    };
  }, [paso, actual.selector]);

  const cerrar = () => {
    try { localStorage.setItem("mipote_tutorial_visto", "true"); } catch {}
    onClose();
  };

  // Estilo de la tarjeta: si hay un elemento anclado, se posiciona al lado; si no, va centrada.
  const CARD_W = 300;
  const PAD = 10;
  let cardStyle: React.CSSProperties = {};
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const espacioAbajo = vh - rect.bottom;
    const colocarAbajo = espacioAbajo > 220 || espacioAbajo > rect.top;
    const left = Math.min(Math.max(rect.left + rect.width / 2 - CARD_W / 2, 16), vw - CARD_W - 16);
    cardStyle = {
      position: "fixed",
      left,
      width: CARD_W,
      ...(colocarAbajo
        ? { top: Math.min(rect.bottom + 16, vh - 260) }
        : { bottom: Math.max(vh - rect.top + 16, 16) }),
    };
  }

  return (
    <>
      {/* Recorte tipo "spotlight": oscurece todo excepto el elemento señalado */}
      {rect ? (
        <div
          className="fixed z-[400] rounded-2xl border-2 border-purple-500 transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[400] bg-black/85 backdrop-blur-sm" />
      )}
      {/* Capa que bloquea clics al resto de la app mientras dura el tour */}
      <div className="fixed inset-0 z-[399]" onClick={(e) => e.stopPropagation()} />

      <div
        className={`z-[401] bg-[#1a0f2e] border border-white/10 rounded-[2rem] shadow-2xl p-6 animate-in fade-in duration-200 ${
          rect ? "" : "fixed inset-0 flex items-center justify-center"
        }`}
        style={rect ? cardStyle : undefined}
      >
        <div className={rect ? "" : "max-w-md w-full"}>
          <button onClick={cerrar} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors" title="Saltar tutorial">
            <X className="w-4 h-4" />
          </button>

          <div className={`w-12 h-12 rounded-xl ${actual.bg} flex items-center justify-center mb-4`}>
            <Icono className={`w-6 h-6 ${actual.color}`} />
          </div>

          <h3 className="text-lg font-black text-white mb-2">{actual.titulo}</h3>
          <p className="text-xs text-white/60 leading-relaxed mb-5">{actual.texto}</p>

          <div className="flex items-center gap-1.5 mb-4">
            {PASOS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === paso ? "w-5 bg-purple-500" : "w-1.5 bg-white/15"}`} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {paso > 0 && (
              <button
                onClick={() => setPaso((p) => p - 1)}
                className="w-10 h-10 shrink-0 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => (esUltimo ? cerrar() : setPaso((p) => p + 1))}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {esUltimo ? "Empezar" : "Siguiente"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
