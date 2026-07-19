import React, { useState, useRef } from 'react';
import { ArrowLeft, Calculator, Camera, Loader2, Plus, X } from 'lucide-react';
import { TASAS_DISPONIBLES, calcularResultadoTasa, getValorTasa, type MonedaOrigen } from './tasasConfig';

export function CalculadoraTab({ rates, activeRates, setActiveRates, theme, triggerToast, onBack, puedeEscanear, registrarEscaneo, onTriggerPaywall, onRegistrarGasto }: any) {
  const [inputValue, setInputValue] = useState("");
  const [monedaOrigen, setMonedaOrigen] = useState<MonedaOrigen>('usd');
  const [isScanning, setIsScanning] = useState(false);
  const [showAddTasa, setShowAddTasa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formateador exacto para Venezuela (Ej: 1.234,50)
  const formatVE = (num: number) => {
    if (!num || isNaN(num)) return "0,00";
    return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Convertimos el input de texto a número para los cálculos (manejando las comas si el usuario las escribe)
  const numValue = parseFloat(inputValue.replace(/\./g, '').replace(',', '.')) || 0;

  // Escáner de IA adaptado para precios rápidos
  const handleScanPrice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    triggerToast("ingreso", "IA analizando la etiqueta... 📸");

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const imageUrl = base64Image.split(',')[1];

      // Usamos el mismo endpoint, pero la IA detectará un ticket pequeño en vez de una factura larga
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) throw new Error("Error procesando imagen");
      
      const dataResult = await response.json();
      const aiResponse = dataResult.result;
      
      if (aiResponse) {
        const jsonString = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        if (data.monto_total) {
          setInputValue(data.monto_total.toString());
          setMonedaOrigen(data.moneda?.toLowerCase() === 'bs' ? 'bs' : 'usd');
          triggerToast("ingreso", "¡Precio extraído con éxito!");
          registrarEscaneo?.();
        } else {
          throw new Error("No se detectó un precio claro");
        }
      }
    } catch (error) {
      console.error(error);
      triggerToast("gasto", "No pude leer el precio. Intenta de nuevo.");
    } finally {
      setIsScanning(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full pb-36 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      {/* Header Calculadora */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <button onClick={onBack} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Calculator className={`w-5 h-5 ${theme.text}`} /> Simulador
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Botón IA */}
      <button
        onClick={() => {
          if (puedeEscanear && !puedeEscanear()) { onTriggerPaywall?.(); return; }
          fileInputRef.current?.click();
        }}
        disabled={isScanning}
        className="mb-8 w-full bg-[#1C1C1E] border border-emerald-500/30 hover:bg-[#2C2C2E] p-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isScanning ? (
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-emerald-400 font-black text-sm uppercase tracking-widest">
          {isScanning ? 'Extrayendo precio...' : 'Escanear Precio con IA'}
        </span>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleScanPrice} className="hidden" />
      </button>

      {/* Panel de Entrada Principal */}
      <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[2rem] shadow-xl mb-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Monto a Convertir</span>
          
          {/* Toggle de Moneda */}
          <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setMonedaOrigen('usd')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${monedaOrigen === 'usd' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
            >
              USD $
            </button>
            <button
              onClick={() => setMonedaOrigen('bs')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${monedaOrigen === 'bs' ? 'bg-emerald-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
            >
              BS
            </button>
            <button
              onClick={() => setMonedaOrigen('eur')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${monedaOrigen === 'eur' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
            >
              EUR €
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center pb-4 border-b border-white/5">
          <span className="text-3xl text-white/30 font-black mr-2 pb-1">{monedaOrigen === 'usd' ? '$' : monedaOrigen === 'eur' ? '€' : 'Bs.'}</span>
          <input 
            type="number" 
            placeholder="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent text-5xl font-black text-white font-sans tabular-nums tracking-tight outline-none text-center"
          />
        </div>
      </div>

      {numValue > 0 && onRegistrarGasto && (
        <button
          onClick={() => onRegistrarGasto(numValue, monedaOrigen)}
          className={`w-full mb-4 ${theme.primary} text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform`}
        >
          <Plus className="w-4 h-4" /> Registrar este gasto
        </button>
      )}

      {/* Cajas de Conversión Simultánea */}
      <div className="space-y-3">
        {activeRates.map((id: string) => {
          const def = TASAS_DISPONIBLES.find(t => t.id === id);
          if (!def) return null;
          const resultado = calcularResultadoTasa(def, monedaOrigen, numValue, rates);
          const referencia = getValorTasa(def.id, rates);
          const nativo: 'usd' | 'eur' = def.kind === 'bs_per_eur' ? 'eur' : 'usd';
          // Para BCV/Paralelo/Euro: el origen "bs" da como resultado la divisa nativa de la tarjeta;
          // cualquier otro origen (usd o eur) se cotiza directo a Bs con la tasa propia de la tarjeta
          // (sin puentear USD<->EUR entre sí, por eso ya no depende de si "nativo" coincide con el origen).
          const prefijo = def.kind === 'foreign_per_usd'
            ? `${def.badge} `
            : (monedaOrigen === 'bs' ? (nativo === 'eur' ? '€ ' : '$ ') : 'Bs. ');

          // Equivalente en Bs. solo hace falta para las monedas extranjeras (COP/MXN), que siempre
          // muestran su valor propio arriba y el ancla en Bs abajo como referencia.
          const mostrarEquivalenteBs = def.kind === 'foreign_per_usd';
          const equivalenteBs = def.kind === 'foreign_per_usd'
            ? (referencia > 0 ? (resultado / referencia) * rates.bcv : 0)
            : 0;

          return (
            <div key={id} className={`bg-[#121212] border ${def.classes.border} p-5 rounded-2xl flex justify-between items-center relative overflow-hidden group`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${def.classes.bar}`}></div>
              <button
                onClick={() => setActiveRates((prev: string[]) => prev.filter(r => r !== id))}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-white/20 hover:text-rose-400 transition-colors"
                title="Quitar tasa"
              >
                <X className="w-3 h-3" />
              </button>
              <div>
                <p className={`text-[10px] ${def.classes.text} font-bold uppercase tracking-widest mb-1`}>
                  {def.label}
                </p>
                <p className="text-2xl font-black text-white font-sans tabular-nums tracking-tight">
                  {prefijo}
                  {def.kind === 'foreign_per_usd' ? resultado.toLocaleString(def.locale, { maximumFractionDigits: 0 }) : formatVE(resultado)}
                </p>
                {mostrarEquivalenteBs && (
                  <p className="text-[10px] text-white/40 font-sans tabular-nums mt-0.5">
                    ≈ Bs. {formatVE(equivalenteBs)}
                  </p>
                )}
              </div>
              <div className="text-right pr-4">
                <p className="text-[9px] text-white/30 uppercase font-bold">Referencia</p>
                <p className="text-xs text-white/50 font-sans tabular-nums font-medium">
                  {def.kind === 'foreign_per_usd' ? `${referencia.toLocaleString(def.locale, { maximumFractionDigits: 0 })} / USD` : formatVE(referencia)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {TASAS_DISPONIBLES.some(t => !activeRates.includes(t.id)) && (
        <div className="mt-3">
          {!showAddTasa ? (
            <button
              onClick={() => setShowAddTasa(true)}
              className="w-full bg-[#121212] border border-dashed border-white/15 hover:border-emerald-500/40 p-3 rounded-2xl flex items-center justify-center gap-2 text-white/50 hover:text-emerald-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Añadir tasa</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {TASAS_DISPONIBLES.filter(t => !activeRates.includes(t.id)).map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveRates((prev: string[]) => [...prev, t.id]); setShowAddTasa(false); }}
                  className={`bg-[#121212] border ${t.classes.border} hover:bg-[#1c1c1c] p-3 rounded-xl text-[11px] font-bold text-white/70 hover:text-white transition-colors flex items-center gap-1.5`}
                >
                  <Plus className="w-3 h-3" /> {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}