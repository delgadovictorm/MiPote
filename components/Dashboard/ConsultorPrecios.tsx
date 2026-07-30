"use client";

import React, { useEffect, useState } from "react";
import { Search, Tag } from "lucide-react";

interface ProductoPrecio {
  producto?: string;
  nombre_producto?: string;
  precio_ref: number;
  iva_ref?: number;
  precio_total: number;
  tasa_bcv: number;
  url_producto?: string;
  scraped_at?: string;
}

interface ConsultorPreciosProps {
  theme: any;
  onSeleccionarProducto: (nombre: string, precioUsd: number) => void;
}

const MENSAJES_ESPERA = [
  "Comparando precios...",
  "Consultando el súper...",
  "Un momento más...",
  "Casi listo...",
];

function useMensajeRotativo(activo: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!activo) return;
    const interval = setInterval(() => setI((v) => (v + 1) % MENSAJES_ESPERA.length), 2000);
    return () => clearInterval(interval);
  }, [activo]);
  return MENSAJES_ESPERA[i];
}

export function ConsultorPrecios({ theme, onSeleccionarProducto }: ConsultorPreciosProps) {
  const [nombresCategorias, setNombresCategorias] = useState<string[] | null>(null);
  const [datosPorCategoria, setDatosPorCategoria] = useState<Record<string, ProductoPrecio[]>>({});
  const [categoriaCargando, setCategoriaCargando] = useState<string | null>(null);

  const [termino, setTermino] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ProductoPrecio[] | null>(null);

  const mensajeEspera = useMensajeRotativo(!!categoriaCargando);

  // Pide las categorías UNA por UNA (no todas juntas) para que cada sección
  // aparezca apenas está lista, en vez de dejar la pantalla en blanco hasta
  // que la más lenta termine.
  useEffect(() => {
    let activo = true;
    (async () => {
      const res = await fetch("/api/precios").then((r) => r.json()).catch(() => null);
      const nombres: string[] = res?.categoriasDisponibles || [];
      if (!activo) return;
      setNombresCategorias(nombres);

      for (const nombre of nombres) {
        if (!activo) return;
        setCategoriaCargando(nombre);
        const data = await fetch(`/api/precios?categoria=${encodeURIComponent(nombre)}`)
          .then((r) => r.json())
          .catch(() => ({ productos: [] }));
        if (!activo) return;
        setDatosPorCategoria((prev) => ({ ...prev, [nombre]: data.productos || [] }));
      }
      if (activo) setCategoriaCargando(null);
    })();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (!termino.trim()) { setResultadosBusqueda(null); return; }
    let activo = true;
    setBuscando(true);
    const t = setTimeout(() => {
      fetch(`/api/precios?q=${encodeURIComponent(termino.trim())}`)
        .then((r) => r.json())
        .then((data) => { if (activo) setResultadosBusqueda(data.resultados || []); })
        .catch(() => { if (activo) setResultadosBusqueda([]); })
        .finally(() => { if (activo) setBuscando(false); });
    }, 400);
    return () => { activo = false; clearTimeout(t); };
  }, [termino]);

  const renderTarjeta = (p: ProductoPrecio, key: string) => {
    const nombre = p.producto || p.nombre_producto || "";
    return (
      <button
        key={key}
        type="button"
        onClick={() => onSeleccionarProducto(nombre, p.precio_total)}
        className="shrink-0 w-36 text-left bg-[#1C1C1E] border border-white/5 rounded-2xl p-3 hover:border-emerald-500/40 transition-colors active:scale-95"
      >
        <p className="text-[11px] font-bold text-white/90 leading-snug line-clamp-2 min-h-[2.2em]">{nombre}</p>
        <p className="text-base font-black text-emerald-400 tabular-nums mt-2">${p.precio_total.toFixed(2)}</p>
        <p className="text-[9px] text-white/30 tabular-nums">Bs. {(p.precio_total * (p.tasa_bcv || 0)).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</p>
      </button>
    );
  };

  const categoriasConDatos = (nombresCategorias || []).filter((n) => (datosPorCategoria[n]?.length || 0) > 0);
  const terminadoSinResultados = nombresCategorias !== null && !categoriaCargando && categoriasConDatos.length === 0;

  return (
    <div className="bg-[#1C1C1E]/60 border border-white/5 rounded-3xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className={`w-4 h-4 ${theme.text}`} />
        <h4 className="text-xs font-black uppercase tracking-widest text-white/70">Consultor de precios</h4>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          placeholder="Buscar un producto (ej. harina, pollo...)"
          className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
        />
      </div>

      {resultadosBusqueda !== null ? (
        <div>
          {buscando ? (
            <p className="text-center text-white/40 text-[11px] py-4">{mensajeEspera}</p>
          ) : resultadosBusqueda.length === 0 ? (
            <p className="text-center text-white/30 text-[11px] py-4">Sin resultados para "{termino}".</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {resultadosBusqueda.map((p, i) => renderTarjeta(p, `busqueda-${i}`))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {categoriasConDatos.map((nombre) => (
            <div key={nombre}>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">{nombre}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {datosPorCategoria[nombre].map((p, i) => renderTarjeta(p, `${nombre}-${i}`))}
              </div>
            </div>
          ))}

          {categoriaCargando && (
            <div className="text-center py-3">
              <p className="text-[11px] font-bold text-white/60">Cargando {categoriaCargando}...</p>
              <p className="text-[10px] text-white/30 mt-1">{mensajeEspera}</p>
            </div>
          )}

          {terminadoSinResultados && (
            <p className="text-center text-white/30 text-[11px] py-4">Aún no hay precios cargados. Vuelve a intentar en unos minutos.</p>
          )}
        </div>
      )}

      <p className="text-[9px] text-white/20 text-center mt-3">Precios de referencia del supermercado, actualizados cada 24h.</p>
    </div>
  );
}
