"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ShoppingCart, Plus, Trash2, Camera, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MercadoSessionProps {
  espacioActivo: any;
  session: any;
  rates: any;
  theme: any;
  triggerToast: (tipo: string, mensajeForzado?: string) => void;
  onClose: () => void;
  onSesionFinalizada: (payload: { totalUsd: number; cantidadItems: number }) => Promise<void> | void;
  puedeEscanear?: () => boolean;
  registrarEscaneo?: () => void;
  onTriggerPaywall?: () => void;
}

type Fase = "cargando" | "config" | "activa" | "cerrando";

export function MercadoSession({
  espacioActivo,
  session,
  rates,
  theme,
  triggerToast,
  onClose,
  onSesionFinalizada,
  puedeEscanear,
  registrarEscaneo,
  onTriggerPaywall,
}: MercadoSessionProps) {
  const [fase, setFase] = useState<Fase>("cargando");
  const [sesion, setSesion] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);

  const [presupuestoInput, setPresupuestoInput] = useState("");

  const [nombreInput, setNombreInput] = useState("");
  const [precioInput, setPrecioInput] = useState("");
  const [monedaInput, setMonedaInput] = useState<"usd" | "bs">("usd");

  const [montoRealInput, setMontoRealInput] = useState("");
  const [isScanningItem, setIsScanningItem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deslizar el dedo hacia abajo (cuando el contenido ya está arriba del todo) cierra el módulo,
  // igual que tocar el botón de volver — sin pelearse con el scroll normal de la lista.
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const intentarCerrar = () => {
    if (fase === "activa" && items.length > 0 && !confirm("¿Salir sin cerrar el mercado? La sesión sigue activa y puedes volver luego.")) return;
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop > 0) { touchStartY.current = null; return; }
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (deltaY > 80) intentarCerrar();
  };

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data } = await supabase
        .from("sesiones_mercado")
        .select("*")
        .eq("espacio_id", espacioActivo.id)
        .eq("estado", "activa")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!activo) return;

      if (data && data[0]) {
        setSesion(data[0]);
        const { data: itemsData } = await supabase
          .from("items_mercado")
          .select("*")
          .eq("sesion_id", data[0].id)
          .order("created_at", { ascending: true });
        setItems(itemsData || []);
        setFase("activa");
      } else {
        setFase("config");
      }

      cargarSugerencias();
    })();
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espacioActivo.id]);

  const cargarSugerencias = async () => {
    const { data } = await supabase
      .from("items_mercado")
      .select("nombre_producto, precio, moneda, precio_usd_normalizado, created_at")
      .eq("espacio_id", espacioActivo.id)
      .order("created_at", { ascending: false })
      .limit(300);

    if (!data) return;
    const vistos = new Set<string>();
    const unicos: any[] = [];
    for (const item of data) {
      const clave = item.nombre_producto.trim().toLowerCase();
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      unicos.push(item);
    }
    setSugerencias(unicos);
  };

  const totalUsd = items.reduce((acc, i) => acc + (i.precio_usd_normalizado || 0), 0);
  const totalBs = totalUsd * (rates.usdt || 0);
  const porcentajePresupuesto = sesion?.presupuesto_usd > 0 ? (totalUsd / sesion.presupuesto_usd) * 100 : null;
  const colorBarra = porcentajePresupuesto === null
    ? theme.primary
    : porcentajePresupuesto < 70 ? "bg-emerald-500" : porcentajePresupuesto < 100 ? "bg-amber-500" : "bg-rose-500";

  const sugerenciasFiltradas = nombreInput.trim().length > 0
    ? sugerencias.filter(s => s.nombre_producto.toLowerCase().includes(nombreInput.trim().toLowerCase())).slice(0, 4)
    : [];

  const iniciarSesion = async () => {
    const presupuestoVal = presupuestoInput ? parseFloat(presupuestoInput) : null;
    const { data, error } = await supabase
      .from("sesiones_mercado")
      .insert([{
        espacio_id: espacioActivo.id,
        usuario_id: session.user.id,
        presupuesto_usd: presupuestoVal,
        total_estimado_usd: 0,
        estado: "activa",
      }])
      .select()
      .single();

    if (error) { alert("No se pudo iniciar la sesión: " + error.message); return; }
    setSesion(data);
    setItems([]);
    setFase("activa");
  };

  const actualizarTotalSesion = async (nuevoTotal: number) => {
    if (!sesion) return;
    await supabase.from("sesiones_mercado").update({ total_estimado_usd: nuevoTotal }).eq("id", sesion.id);
  };

  const agregarItem = async (nombre: string, precioVal: number, monedaVal: "usd" | "bs") => {
    if (!sesion || !nombre.trim() || !precioVal || precioVal <= 0) return;
    const precioUsdNorm = monedaVal === "bs" ? (rates.usdt > 0 ? precioVal / rates.usdt : 0) : precioVal;

    const { data, error } = await supabase
      .from("items_mercado")
      .insert([{
        sesion_id: sesion.id,
        espacio_id: espacioActivo.id,
        nombre_producto: nombre.trim(),
        precio: precioVal,
        moneda: monedaVal,
        precio_usd_normalizado: precioUsdNorm,
      }])
      .select()
      .single();

    if (error) { alert("No se pudo agregar el producto: " + error.message); return; }

    const nuevosItems = [...items, data];
    setItems(nuevosItems);
    actualizarTotalSesion(nuevosItems.reduce((acc, i) => acc + (i.precio_usd_normalizado || 0), 0));
    setNombreInput("");
    setPrecioInput("");
  };

  const eliminarItem = async (id: string) => {
    await supabase.from("items_mercado").delete().eq("id", id);
    const nuevosItems = items.filter(i => i.id !== id);
    setItems(nuevosItems);
    actualizarTotalSesion(nuevosItems.reduce((acc, i) => acc + (i.precio_usd_normalizado || 0), 0));
  };

  const confirmarCierre = async () => {
    if (!sesion) return;
    const totalReal = montoRealInput ? parseFloat(montoRealInput) : null;
    const totalFinal = totalReal ?? totalUsd;

    await supabase
      .from("sesiones_mercado")
      .update({
        total_estimado_usd: totalUsd,
        total_real_usd: totalReal,
        estado: "cerrada",
        closed_at: new Date().toISOString(),
      })
      .eq("id", sesion.id);

    await onSesionFinalizada({ totalUsd: totalFinal, cantidadItems: items.length });
    triggerToast("egreso", `¡Mercado cerrado! 🛒 $${totalFinal.toFixed(2)}`);
    onClose();
  };

  const handleScanItem = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanningItem(true);
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.6));
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageUrl = base64Image.split(",")[1];
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, mode: "item" }),
      });

      if (!response.ok) throw new Error("Error procesando imagen");
      const dataResult = await response.json();
      const jsonString = (dataResult.result || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonString);

      if (data.nombre && data.precio) {
        setNombreInput(data.nombre);
        setPrecioInput(data.precio.toString());
        setMonedaInput(data.moneda?.toLowerCase() === "bs" ? "bs" : "usd");
        registrarEscaneo?.();
      } else {
        throw new Error("No se detectó un producto claro");
      }
    } catch (error) {
      console.error(error);
      alert("No pude leer el precio. Intenta de nuevo o agrégalo manual.");
    } finally {
      setIsScanningItem(false);
      if (event.target) event.target.value = "";
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-[#0d0714] w-full h-[100dvh] flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212] shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={intentarCerrar}
            className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-rose-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-white font-black text-lg flex items-center gap-2">
            <ShoppingCart className={`w-5 h-5 ${theme.text}`} /> Hacer Mercado
          </h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 bg-[#0d0714] overscroll-contain">
        {fase === "cargando" && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
          </div>
        )}

        {fase === "config" && (
          <div className="max-w-md mx-auto mt-6">
            <div className={`w-16 h-16 rounded-3xl ${theme.lightBg} border ${theme.border} flex items-center justify-center mx-auto mb-6`}>
              <ShoppingCart className={`w-8 h-8 ${theme.text}`} />
            </div>
            <h4 className="text-xl font-black text-white text-center mb-2">¿Vas al súper?</h4>
            <p className="text-sm text-white/50 text-center mb-8">
              Ponle un tope si quieres (opcional) y arranca. Cada producto que agregues se suma al total en vivo.
            </p>
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Presupuesto tope ($) — opcional</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 50"
              value={presupuestoInput}
              onChange={(e) => setPresupuestoInput(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums outline-none focus:border-emerald-500 mb-6"
            />
            <button
              onClick={iniciarSesion}
              className={`w-full ${theme.primary} text-white font-black py-5 rounded-3xl uppercase tracking-widest text-sm active:scale-95 transition-transform`}
            >
              Empezar Mercado
            </button>
          </div>
        )}

        {fase === "activa" && (
          <div className="max-w-md mx-auto">
            {/* TOTAL CORRIENDO — el elemento más grande de la pantalla */}
            <div className="text-center py-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2">Total en el carrito</p>
              <p className="text-6xl md:text-7xl font-black text-white tabular-nums leading-none font-sans">
                ${totalUsd.toFixed(2)}
              </p>
              <p className="text-lg text-white/40 font-bold tabular-nums mt-2">
                Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              {sesion?.presupuesto_usd > 0 && (
                <div className="mt-5">
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${colorBarra} transition-all duration-500`}
                      style={{ width: `${Math.min(porcentajePresupuesto || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 font-bold">
                    {Math.round(porcentajePresupuesto || 0)}% de ${sesion.presupuesto_usd.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* AGREGAR PRODUCTO */}
            <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-4 mb-4">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Producto (Ej: Harina Pan)"
                    value={nombreInput}
                    onChange={(e) => setNombreInput(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-3 py-3 text-sm font-bold text-white outline-none focus:border-emerald-500"
                  />
                  {sugerenciasFiltradas.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                      {sugerenciasFiltradas.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNombreInput(s.nombre_producto);
                            setPrecioInput(String(s.precio));
                            setMonedaInput(s.moneda);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/10 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{s.nombre_producto}</span>
                          <span className="text-white/30 shrink-0">{s.moneda === "bs" ? "Bs." : "$"}{s.precio}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (puedeEscanear && !puedeEscanear()) { onTriggerPaywall?.(); return; }
                    fileInputRef.current?.click();
                  }}
                  disabled={isScanningItem}
                  className={`w-12 h-12 rounded-xl ${theme.lightBg} flex items-center justify-center ${theme.text} shrink-0 active:scale-90 transition-transform`}
                  title="Escanear precio"
                >
                  {isScanningItem ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleScanItem} className="hidden" />
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={precioInput}
                  onChange={(e) => setPrecioInput(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-3 py-3 text-lg font-black text-white tabular-nums outline-none focus:border-emerald-500"
                />
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
                  <button type="button" onClick={() => setMonedaInput("usd")} className={`px-3 py-2 text-xs font-black rounded-lg transition-colors ${monedaInput === "usd" ? "bg-blue-600 text-white" : "text-white/40"}`}>$</button>
                  <button type="button" onClick={() => setMonedaInput("bs")} className={`px-3 py-2 text-xs font-black rounded-lg transition-colors ${monedaInput === "bs" ? "bg-emerald-600 text-white" : "text-white/40"}`}>Bs</button>
                </div>
                <button
                  type="button"
                  onClick={() => agregarItem(nombreInput, parseFloat(precioInput), monedaInput)}
                  className={`w-12 h-12 rounded-xl ${theme.primary} text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LISTA DE PRODUCTOS AGREGADOS */}
            <div className="space-y-2 mb-6">
              {items.length === 0 ? (
                <p className="text-center text-white/30 text-xs py-6">Aún no has agregado productos.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-[#1C1C1E] border border-white/5 rounded-2xl px-4 py-3 group">
                    <span className="text-sm font-bold text-white truncate">{item.nombre_producto}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-white/60 tabular-nums">
                        {item.moneda === "bs" ? "Bs." : "$"}{Number(item.precio).toFixed(2)}
                      </span>
                      <button onClick={() => eliminarItem(item.id)} className="text-white/20 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setFase("cerrando")}
              className="w-full bg-[#1C1C1E] border border-white/10 hover:border-emerald-500/40 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-sm active:scale-95 transition-transform"
            >
              Cerrar Mercado
            </button>
          </div>
        )}

        {fase === "cerrando" && (
          <div className="max-w-md mx-auto mt-6">
            <h4 className="text-xl font-black text-white text-center mb-2">Cerrar Mercado</h4>
            <p className="text-sm text-white/50 text-center mb-6">
              Estimado en el carrito: <span className="text-white font-bold">${totalUsd.toFixed(2)}</span>. Si te cobraron distinto en caja, ponlo aquí (opcional).
            </p>
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto real cobrado ($) — opcional</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={totalUsd.toFixed(2)}
              value={montoRealInput}
              onChange={(e) => setMontoRealInput(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums outline-none focus:border-emerald-500 mb-3"
            />
            {montoRealInput && !isNaN(parseFloat(montoRealInput)) && Math.abs(parseFloat(montoRealInput) - totalUsd) > 0.01 && (
              <p className={`text-xs font-bold text-center mb-4 ${parseFloat(montoRealInput) > totalUsd ? "text-rose-400" : "text-emerald-400"}`}>
                {parseFloat(montoRealInput) > totalUsd ? "Pagaste " : "Pagaste "}
                ${Math.abs(parseFloat(montoRealInput) - totalUsd).toFixed(2)} {parseFloat(montoRealInput) > totalUsd ? "más" : "menos"} de lo estimado.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFase("activa")}
                className="flex-1 bg-white/5 text-white/70 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Seguir agregando
              </button>
              <button
                onClick={confirmarCierre}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
