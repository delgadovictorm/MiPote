"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, 
  Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X
} from "lucide-react";

export default function FinanzasDashboard() {
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  const [cuotasCashea, setCuotasCashea] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().toISOString().slice(0, 7));

  const [categoriasList, setCategoriasList] = useState<any[]>([]);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");

  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "Victor" });

  const [showToast, setShowToast] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState("");

  const MENSAJES = [
    "¡Pío, pío! Ese nido se está llenando de billetes. 🐥💰",
    "¡Un pollito ahorrador vale por dos! 🐥✨",
    "Pluma a pluma, el pollito llena el nido. 🪶",
    "¡Ese es mi pollito financiero favorito! 🐥🚀",
    "¡Pío, pío, pío! Más dinerito para la cuenta. 🐣💸",
    "Pollito que ahorra, pollito que triunfa. 🏆🐥",
    "¡Alimentando al pollito del ahorro! 🌽💰",
    "¡Creciendo como un pollito fuerte y financiero! 🐥💪",
    "Este nido cada vez brilla más. ✨🐣",
    "¡Qué pollitos tan responsables! 🐥👔",
    "¡Ese teléfono para Mari ya casi se puede tocar! 📱❤️",
    "¡Mari va a estar dando saltos de alegría! 💃📱",
    "¡Un pasito más cerca de la sonrisa de Mari! 😍",
    "El mejor equipo: Víctor, Mari y una buena cuenta de ahorros. 👫💼",
    "¡Para el teléfono de la reina de la casa! 👑📱",
    "¡Ese celular ya siente que tiene dueña! 📱👀",
    "Trabajo en equipo, triunfo seguro. ¡Vamos chicos! 🤝",
    "¡Mari, ve comprando el forro para el teléfono! 📱🛡️",
    "Amor es... ahorrar juntos para las metas. ❤️💰",
    "¡Mari ya está practicando las poses para las fotos! 🤳✨",
    "¡Excelente gestión, futuros lobos de Wall Street! 🐺📈",
    "El interés compuesto está orgulloso de ustedes. 📈😎",
    "¡Dinero que entra, futuro que se asegura! 🛡️💸",
    "Un dólar ahorrado es un dólar ganado. ¡Bien hecho! 💵👏",
    "¡Así se construye la libertad financiera! 🗽💰",
    "La cuenta bancaria sonríe el día de hoy. 🏦😁",
    "¡Qué buen ritmo llevan! Sigan así. 🏃‍♂️💨",
    "¡El ahorro es la base del éxito! 🚀",
    "Su 'yo' del futuro les está aplaudiendo ahora mismo. 👏🕰️",
    "¡Ca-ching! Sonido de victoria financiera. 🎰🏆",
    "¡Elon Musk les va a pedir consejos financieros! 🚀🧠",
    "¡A este paso compran Cashea la próxima semana! 🛒💸",
    "El BCV está temblando con estos ahorros. 🏦😱",
    "¡Cuidado que se rompe la alcancía de tanto meterle! 🐷💥",
    "¡Lluvia de billetes en el dashboard! 💸🌧️",
    "Warren Buffett estaría anotando sus estrategias. 👴📊",
    "¡Más liquidez que Rico McPato! 🦆🏊‍♂️",
    "¡Forbes 500, allá van! 📰🥇",
    "Si el ahorro fuera deporte olímpico, ¡oro para ustedes! 🥇🏃‍♀️",
    "¡La inflación no puede con este par! 🛡️📉",
    "¡Mía está moviendo la colita de felicidad por esos ahorros! 🐾🐶",
    "Más dinerito = Más premios para Mía. 🦴🐕",
    "¡Guau, guau! (Traducción: ¡Qué buenos dueños ahorradores!). 🐶💬",
    "Mía sabe que con estos dueños no le faltarán croquetas premium. 🥩🐾",
    "¡Hasta Mía está impresionada con esta disciplina! 😲🐶",
    "Ahorrando para que Mía viva como la realeza que es. 👑🐾",
    "¡Suma y sigue! ➕📈",
    "¡Imparables! 🧱🔨",
    "¡Otra victoria para la billetera! 🏆",
    "¡Objetivo fijado, dinero guardado! 🎯"
  ];

  const triggerToast = () => {
    const randomMsg = MENSAJES[Math.floor(Math.random() * MENSAJES.length)];
    setMensajeMotivacional(randomMsg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const [editingGasto, setEditingGasto] = useState<string | null>(null);
  const [gastoForm, setGastoForm] = useState({ nombre: "", monto_estimado_usd: "", fecha_limite: "" });

  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("usd");
  const [tipo, setTipo] = useState("egreso");
  const [categoria, setCategoria] = useState("comida");
  const [descripcion, setDescripcion] = useState("");
  const [usuario, setUsuario] = useState("Victor");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: txData } = await supabase.from("transacciones").select("*").order("created_at", { ascending: false });
      if (txData) setTransactions(txData);
      const { data: fijosData } = await supabase.from("gastos_fijos").select("*").order("fecha_limite", { ascending: true });
      if (fijosData) setGastosFijos(fijosData);
      const { data: casheaData } = await supabase.from("cashea").select("*").order("fecha_pago", { ascending: true });
      if (casheaData) setCuotasCashea(casheaData);
      const { data: catData } = await supabase.from("categorias").select("*");
      if (catData) setCategoriasList(catData);
    } catch (err) {
      console.error("Error cargando BD:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRates = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      if (data.success) setRates({ bcv: data.bcv, usdt: data.usdt });
    } catch (error) {
      console.error("Error obteniendo tasas:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("pf_usuario");
    if (savedUser) setUsuario(savedUser);
    fetchRates();
    fetchData();
  }, [fetchData]);

  const agregarCategoria = async () => {
    if (!newCatLabel) return;
    const valorGenerado = newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
    await supabase.from("categorias").insert([{ valor: valorGenerado, label: newCatLabel }]);
    setIsAddingCat(false);
    setNewCatLabel("");
    fetchData();
    setCategoria(valorGenerado);
  };

  const agregarCashea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!casheaForm.articulo || !casheaForm.monto_cuota || !casheaForm.fecha_pago) return;
    await supabase.from("cashea").insert([{
      articulo: casheaForm.articulo,
      monto_cuota: parseFloat(casheaForm.monto_cuota),
      fecha_pago: casheaForm.fecha_pago,
      usuario: casheaForm.usuario
    }]);
    setIsAddingCashea(false);
    setCasheaForm({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "Victor" });
    fetchData();
  };

  const calcularMontos = (montoInput: number, monedaInput: string) => {
    let monto_bs = 0, monto_usd_bcv = 0, monto_usd_paralelo = 0;
    if (monedaInput === 'bs') {
      monto_bs = montoInput;
      monto_usd_bcv = rates.bcv ? montoInput / rates.bcv : 0;
      monto_usd_paralelo = rates.usdt ? montoInput / rates.usdt : 0;
    } else if (monedaInput === 'usd') {
      monto_usd_bcv = montoInput;
      monto_usd_paralelo = montoInput;
      monto_bs = montoInput * rates.bcv;
    } else if (monedaInput === 'usdt') {
      monto_usd_paralelo = montoInput;
      monto_usd_bcv = montoInput; 
      monto_bs = montoInput * rates.usdt;
    }
    return { monto_bs, monto_usd_bcv, monto_usd_paralelo };
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);
    
    let descFinal = descripcion;
    if (categoria === "ahorro_meta") {
      descFinal = "Ahorro Meta (Teléfono) 📱🎯";
    } else if (categoria !== "otro") {
      descFinal = categoriasList.find(c => c.valor === categoria)?.label || "";
    }

    const { error } = await supabase.from("transacciones").insert([{
      descripcion: descFinal,
      monto_original: valorMonto,
      moneda_original: moneda,
      monto_bs,
      monto_usd_bcv,
      monto_usd_paralelo,
      categoria,
      usuario,
      tipo,
      created_at: new Date()
    }]);

    if (!error) {
      setMonto("");
      setDescripcion("");
      fetchData();
      if (tipo === "ingreso" || categoria === "ahorro_meta") triggerToast();
    }
  };

  const eliminarTransaccion = async (id: string) => {
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    await supabase.from("transacciones").delete().eq("id", id);
    fetchData();
  };

  const toggleGastoFijo = async (id: string, estadoActual: boolean) => {
    await supabase.from("gastos_fijos").update({ pagado: !estadoActual }).eq("id", id);
    fetchData();
  };

  const toggleCashea = async (id: string, estadoActual: boolean) => {
    await supabase.from("cashea").update({ pagado: !estadoActual }).eq("id", id);
    fetchData();
  };

  const iniciarEdicionGasto = (gasto: any) => {
    setEditingGasto(gasto.id);
    setGastoForm({
      nombre: gasto.nombre,
      monto_estimado_usd: gasto.monto_estimado_usd.toString(),
      fecha_limite: gasto.fecha_limite.toString()
    });
  };

  const cancelarEdicionGasto = () => setEditingGasto(null);

  const guardarEdicionGasto = async (id: string) => {
    if (!gastoForm.nombre || !gastoForm.monto_estimado_usd || !gastoForm.fecha_limite) return;
    await supabase.from("gastos_fijos").update({
      nombre: gastoForm.nombre,
      monto_estimado_usd: parseFloat(gastoForm.monto_estimado_usd),
      fecha_limite: parseInt(gastoForm.fecha_limite)
    }).eq("id", id);
    setEditingGasto(null);
    fetchData();
  };

  const getBalance = (user: string | null) => {
    return transactions
      .filter(tx => (!user || tx.usuario === user || tx.usuario === 'Ambos'))
      .reduce((acc, tx) => {
        const valorUSD = tx.monto_usd_bcv || 0;
        const modificador = (tx.usuario === 'Ambos' && user) ? 0.5 : 1; 
        return tx.tipo === "ingreso" ? acc + (valorUSD * modificador) : acc - (valorUSD * modificador);
      }, 0);
  };

  const totalAhorradoMeta = transactions
    .filter(tx => tx.categoria === "ahorro_meta" && tx.tipo === "ingreso")
    .reduce((acc, tx) => acc + (tx.monto_usd_bcv || 0), 0);

  const totalVictor = getBalance("Victor");
  const totalMari = getBalance("Mari");
  const totalGeneral = totalVictor + totalMari;
  const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));

  return (
    <div className="min-h-screen bg-[#0d0714] text-purple-50 p-3 md:p-8 font-sans pb-24 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* HEADER COMPACTO TIPO APP */}
        <div className="flex items-center justify-between bg-[#1a0f2e] p-3 md:p-4 rounded-[2rem] border border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg text-2xl">🐥</div>
            <div>
              <h1 className="text-base md:text-xl font-black text-white leading-tight">Pollitos Finanzas</h1>
              <p className="text-purple-300 text-[10px] md:text-xs tracking-wide">Control Mari & Víctor</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase text-purple-400 font-bold leading-none">BCV</span>
                <span className="font-mono text-xs text-white">Bs.{rates.bcv.toFixed(2)}</span>
              </div>
              <button onClick={fetchRates} disabled={syncing} className="bg-purple-600/20 hover:bg-purple-600 p-1.5 rounded-xl transition-all">
                <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* BALANCES EN GRID (Mejor uso de espacio) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="col-span-2">
            <CardBalance title="Total General" amount={totalGeneral} icon={<Wallet className="w-5 h-5"/>} color="from-purple-600/40" highlight />
          </div>
          <CardBalance title="Víctor" amount={totalVictor} icon={<Users className="w-4 h-4"/>} color="from-indigo-600/30" small />
          <CardBalance title="Mari" amount={totalMari} icon={<Users className="w-4 h-4"/>} color="from-fuchsia-600/30" small />
        </div>

        {/* META COMPACTA */}
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                 Teléfono Mari <span className="text-purple-400 text-[9px] font-normal bg-purple-500/10 px-1.5 py-0.5 rounded-md">450 USDT</span>
              </h2>
              <p className="text-[10px] text-purple-400 mt-0.5">Faltan ${Math.max(450 - totalAhorradoMeta, 0).toFixed(2)}</p>
            </div>
            <span className="text-sm font-mono font-black text-white">{((totalAhorradoMeta / 450) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((totalAhorradoMeta / 450) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* NUEVO REGISTRO */}
          <div className="lg:col-span-5">
            <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-5 rounded-3xl shadow-xl">
              <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-white"><Plus className="w-4 h-4 text-purple-400" /> Registro Rápido</h2>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`flex-1 border rounded-xl p-2 text-xs font-black outline-none ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                    <option value="egreso">GASTO 💸</option>
                    <option value="ingreso">INGRESO 💰</option>
                  </select>
                  <select value={usuario} onChange={(e) => {setUsuario(e.target.value); localStorage.setItem("pf_usuario", e.target.value)}} className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl p-2 text-xs text-white font-bold outline-none">
                    <option value="Victor">Víctor</option>
                    <option value="Mari">Mari</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                
                {isAddingCat ? (
                  <div className="flex gap-2 w-full">
                    <input type="text" placeholder="Categoría (Ej: Gasolina)" value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-2 text-xs text-white outline-none" />
                    <button type="button" onClick={agregarCategoria} className="bg-emerald-500/20 text-emerald-400 px-3 rounded-xl"><Check className="w-4 h-4"/></button>
                    <button type="button" onClick={() => setIsAddingCat(false)} className="bg-rose-500/20 text-rose-400 px-3 rounded-xl"><X className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-2 text-xs text-white outline-none">
                      {categoriasList.map(cat => (
                        <option key={cat.id} value={cat.valor}>{cat.label}</option>
                      ))}
                      <option value="ahorro_meta">Ahorro Meta (Teléfono) 📱🎯</option>
                      <option value="otro">Otro ✍️</option>
                    </select>
                    <button type="button" onClick={() => setIsAddingCat(true)} className="bg-purple-500/20 text-purple-400 px-3 rounded-xl border border-purple-500/30"><Plus className="w-4 h-4"/></button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00" className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl p-2 text-sm text-white font-mono outline-none" />
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-20 bg-black/50 border border-purple-500/30 rounded-xl p-2 text-xs text-white outline-none font-bold">
                    <option value="usd">USD</option>
                    <option value="bs">BS</option>
                    <option value="usdt">USDT</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full font-black py-3 rounded-xl transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95 text-xs">GUARDAR REGISTRO</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            
            {/* GASTOS FIJOS Y CASHEA (Tabs o Stack Compacto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 rounded-3xl space-y-2">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-purple-400"/> Fijos</h3>
                <div className="space-y-1.5">
                  {gastosFijos.map(gasto => (
                    <div key={gasto.id}>
                      {editingGasto === gasto.id ? (
                        <div className="flex flex-col gap-1 p-2 rounded-xl border border-purple-500 bg-purple-900/20">
                          <input type="text" value={gastoForm.nombre} onChange={e => setGastoForm({...gastoForm, nombre: e.target.value})} className="bg-black/50 p-1.5 rounded text-xs text-white outline-none" />
                          <div className="flex gap-1">
                            <input type="number" value={gastoForm.monto_estimado_usd} onChange={e => setGastoForm({...gastoForm, monto_estimado_usd: e.target.value})} className="w-1/2 bg-black/50 p-1.5 rounded text-xs text-white" />
                            <input type="number" value={gastoForm.fecha_limite} onChange={e => setGastoForm({...gastoForm, fecha_limite: e.target.value})} className="w-1/2 bg-black/50 p-1.5 rounded text-xs text-white" />
                          </div>
                          <div className="flex justify-end gap-1 mt-1">
                            <button onClick={cancelarEdicionGasto} className="text-rose-400 bg-rose-500/10 p-1 rounded"><X className="w-3 h-3" /></button>
                            <button onClick={() => guardarEdicionGasto(gasto.id)} className="text-emerald-400 bg-emerald-500/10 p-1 rounded"><Check className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-2 rounded-xl border transition-all ${gasto.pagado ? 'bg-emerald-900/10 border-emerald-500/20 opacity-60' : 'bg-black/30 border-purple-500/10'}`}>
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleGastoFijo(gasto.id, gasto.pagado)}>
                            {gasto.pagado ? <CheckSquare className="text-emerald-400 w-4 h-4"/> : <Square className="text-purple-400 w-4 h-4"/>}
                            <div><p className="text-xs font-bold leading-tight">{gasto.nombre}</p><p className="text-[9px] text-purple-400/80">Día {gasto.fecha_limite}</p></div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold">${gasto.monto_estimado_usd}</span>
                            <button onClick={() => iniciarEdicionGasto(gasto)} className="p-1.5 text-purple-400/50 hover:text-purple-300"><Edit2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a0f2e] border border-fuchsia-500/30 p-4 rounded-3xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-fuchsia-400"/> Cashea</h3>
                  <button onClick={() => setIsAddingCashea(!isAddingCashea)} className="p-1 bg-fuchsia-500/20 rounded text-fuchsia-400"><Plus className="w-3.5 h-3.5"/></button>
                </div>
                {isAddingCashea && (
                  <form onSubmit={agregarCashea} className="flex flex-col gap-1.5 p-2 mb-2 rounded-xl border border-fuchsia-500/30 bg-fuchsia-900/10">
                    <input type="text" placeholder="Artículo" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} className="bg-black/50 p-1.5 rounded text-xs text-white outline-none" required />
                    <div className="flex gap-1.5">
                      <input type="number" step="0.01" placeholder="$" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} className="w-1/2 bg-black/50 p-1.5 rounded text-xs text-white" required />
                      <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} className="w-1/2 bg-black/50 p-1.5 rounded text-xs text-white" required />
                    </div>
                    <select value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/30 rounded p-1.5 text-xs text-white outline-none">
                      <option value="Victor">Víctor</option>
                      <option value="Mari">Mari</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                    <button type="submit" className="bg-fuchsia-600 p-1.5 rounded font-bold text-[10px] uppercase tracking-wider mt-1">Añadir</button>
                  </form>
                )}
                <div className="space-y-1.5">
                  {cuotasCashea.map(cuota => (
                    <div key={cuota.id} className={`flex items-center justify-between p-2 rounded-xl border ${cuota.pagado ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-black/30 border-fuchsia-500/10'}`}>
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleCashea(cuota.id, cuota.pagado)}>
                        {cuota.pagado ? <CheckSquare className="text-emerald-400 w-4 h-4"/> : <Square className="text-fuchsia-400 w-4 h-4"/>}
                        <div>
                          <p className="text-xs font-bold leading-tight">
                            {cuota.articulo} <span className="text-[8px] text-fuchsia-300 font-normal ml-1 bg-fuchsia-500/20 px-1 py-0.5 rounded">{cuota.usuario || 'Victor'}</span>
                          </p>
                          <p className="text-[9px] text-fuchsia-400/80">{cuota.fecha_pago}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold">${cuota.monto_cuota}</span>
                        <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) { await supabase.from('cashea').delete().eq('id', cuota.id); fetchData(); } }} className="p-1.5 text-rose-500/50 hover:text-rose-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HISTORIAL COMPACTO */}
            <div className="bg-[#1a0f2e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-3 border-b border-purple-500/10 flex justify-between items-center bg-black/20">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Actividad</span>
                <input type="month" value={mesActual} onChange={(e) => setMesActual(e.target.value)} className="bg-purple-900/30 border border-purple-500/20 rounded p-1 text-white outline-none text-[10px] font-mono" />
              </div>
              <div className="divide-y divide-purple-500/10 max-h-[300px] overflow-y-auto">
                {transaccionesDelMes.map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-1.5 rounded-lg shrink-0 ${tx.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.tipo === 'ingreso' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{tx.descripcion}</p>
                        <p className="text-[9px] text-purple-400/60 uppercase truncate">{tx.usuario} • {new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>${tx.monto_usd_bcv?.toFixed(2)}</p>
                      </div>
                      <button onClick={() => eliminarTransaccion(tx.id)} className="p-1 text-rose-500/50 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a0f2e] border border-purple-400/30 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-5 max-w-[300px] w-full animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 w-16 h-16 flex items-center justify-center rounded-3xl text-4xl shadow-xl">🐥</div>
            <div className="text-center space-y-1">
              <p className="text-white font-black text-lg leading-snug">"{mensajeMotivacional}"</p>
              <p className="text-[9px] text-purple-400 font-bold uppercase tracking-[0.2em] pt-2">Pollitos Finanzas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardBalance({ title, amount, icon, color, highlight = false, small = false }: any) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${color} to-[#1a0f2e] border ${highlight ? 'border-purple-400/50' : 'border-purple-500/10'} ${small ? 'p-3 rounded-2xl' : 'p-4 rounded-3xl'} shadow-lg flex flex-col justify-between h-full`}>
      <div className="flex justify-between items-start mb-2">
        <p className={`font-bold text-purple-200 uppercase tracking-widest ${small ? 'text-[9px]' : 'text-[10px]'}`}>{title}</p>
        <div className="text-purple-300/50">{icon}</div>
      </div>
      <p className={`font-black ${amount < 0 ? 'text-rose-400' : 'text-white'} ${small ? 'text-xl' : 'text-3xl'}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
