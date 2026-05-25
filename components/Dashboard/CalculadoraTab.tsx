import React, { useState, useRef } from 'react';
import { ArrowLeft, Calculator, Camera, Loader2, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export function CalculadoraTab({ rates, theme, triggerToast, onBack }: any) {
  const [inputValue, setInputValue] = useState("");
  const [monedaOrigen, setMonedaOrigen] = useState<'usd'|'bs'>('usd');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formateador exacto para Venezuela (Ej: 1.234,50)
  const formatVE = (num: number) => {
    if (!num || isNaN(num)) return "0,00";
    return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Convertimos el input de texto a número para los cálculos (manejando las comas si el usuario las escribe)
  const numValue = parseFloat(inputValue.replace(/\./g, '').replace(',', '.')) || 0;

  // Cálculos Simultáneos
  const bcvResult = monedaOrigen === 'usd' ? numValue * rates.bcv : rates.bcv > 0 ? numValue / rates.bcv : 0;
  const paraleloResult = monedaOrigen === 'usd' ? numValue * rates.usdt : rates.usdt > 0 ? numValue / rates.usdt : 0;
  // Para el tercero usamos Euro si existe, si no mostramos el equivalente inverso
  const euroResult = monedaOrigen === 'usd' 
    ? (rates.eur_bcv > 0 ? (numValue * rates.bcv) / rates.eur_bcv : 0) 
    : (rates.eur_bcv > 0 ? numValue / rates.eur_bcv : 0);

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
        onClick={() => fileInputRef.current?.click()} 
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
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleScanPrice} className="hidden" />
      </button>

      {/* Panel de Entrada Principal */}
      <div className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[2rem] shadow-xl mb-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Monto a Convertir</span>
          
          {/* Toggle de Moneda */}
          <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setMonedaOrigen('usd')} 
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${monedaOrigen === 'usd' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
            >
              USD $
            </button>
            <button 
              onClick={() => setMonedaOrigen('bs')} 
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${monedaOrigen === 'bs' ? 'bg-emerald-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}
            >
              BS
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center pb-4 border-b border-white/5">
          <span className="text-3xl text-white/30 font-black mr-2 pb-1">{monedaOrigen === 'usd' ? '$' : 'Bs.'}</span>
          <input 
            type="number" 
            placeholder="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent text-5xl font-black text-white font-sans tabular-nums tracking-tight outline-none text-center"
          />
        </div>
      </div>

      {/* Cajas de Conversión Simultánea */}
      <div className="space-y-3">
        <div className="bg-[#121212] border border-emerald-500/20 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Tasa Oficial (BCV)
            </p>
            <p className="text-2xl font-black text-white font-sans tabular-nums tracking-tight">
              {monedaOrigen === 'usd' ? 'Bs. ' : '$ '}
              {formatVE(bcvResult)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/30 uppercase font-bold">Referencia</p>
            <p className="text-xs text-white/50 font-sans tabular-nums font-medium">{formatVE(rates.bcv)}</p>
          </div>
        </div>

        <div className="bg-[#121212] border border-blue-500/20 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Paralelo / USDT
            </p>
            <p className="text-2xl font-black text-white font-sans tabular-nums tracking-tight">
              {monedaOrigen === 'usd' ? 'Bs. ' : '$ '}
              {formatVE(paraleloResult)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/30 uppercase font-bold">Referencia</p>
            <p className="text-xs text-white/50 font-sans tabular-nums font-medium">{formatVE(rates.usdt)}</p>
          </div>
        </div>

        <div className="bg-[#121212] border border-purple-500/20 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
          <div>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Wallet className="w-3 h-3" /> Euro Oficial (€)
            </p>
            <p className="text-2xl font-black text-white font-sans tabular-nums tracking-tight">
              {monedaOrigen === 'usd' ? '€ ' : '€ '}
              {formatVE(euroResult)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/30 uppercase font-bold">Referencia</p>
            <p className="text-xs text-white/50 font-sans tabular-nums font-medium">{formatVE(rates.eur_bcv)}</p>
          </div>
        </div>
      </div>

    </div>
  );
}