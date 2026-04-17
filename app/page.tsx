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

  // Estados para Categorías
  const [categoriasList, setCategoriasList] = useState<any[]>([]);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");

  // Estados para Formulario Cashea
  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "Victor" });

  // Estados para Motivación
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

  // Estados para Edición de Gastos Fijos
  const [editingGasto, setEditingGasto] = useState<string | null>(null);
  const [gastoForm, setGastoForm] = useState({ nombre: "", monto_estimado_usd: "", fecha_limite: "" });

  // Estados del Formulario
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
    
    // Nueva lógica para tomar "ahorro_meta" u "otro" dinámicamente
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

  // NUEVA LÓGICA: Calcula el progreso solo con los ingresos marcados como "Ahorro Meta"
  const totalAhorradoMeta = transactions
    .filter(tx => tx.categoria === "ahorro_meta" && tx.tipo === "ingreso")
    .reduce((acc, tx) => acc + (tx.monto_usd_bcv || 0), 0);

  const totalVictor = getBalance("Victor");
  const totalMari = getBalance("Mari");
  const totalGeneral = totalVictor + totalMari;
  const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));

  return (
    <div className="min-h-screen bg-[#0d0714] text-purple-50 p-4 md:p-8 font-sans pb-24 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER TASAS */}
        <div className="flex flex-col md:flex-row gap-4 bg-[#1a0f2e] p-5 rounded-3xl border border-purple-500/30 shadow-2xl items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-yellow-400 p-3 rounded-2xl shadow-lg text-3xl">🐥</div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">Pollitos Finanzas</h1>
              <p className="text-purple-300 text-sm">Control Mari & Víctor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-purple-500/20 w-full md:w-auto">
            <div className="text-center">
              <p className="text-xs uppercase text-purple-400 font-bold mb-1">Tasa BCV</p>
              <p className="font-mono text-xl text-white">Bs. {rates.bcv.toFixed(2)}</p>
            </div>
            <div className="h-10 w-px bg-purple-500/30"></div>
            <div className="text-center">
              <p className="text-xs uppercase text-purple-400 font-bold mb-1">Tasa Paralelo</p>
              <p className="font-mono text-xl text-white">Bs. {rates.usdt.toFixed(2)}</p>
            </div>
            <button onClick={fetchRates} disabled={syncing} className="ml-2 bg-purple-600/20 hover:bg-purple-600 p-2 rounded-xl transition-all">
              <RefreshCw className={`w-5 h-5 text-purple-300 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* PROGRESO DE META INTEGRADO (Exclusivo para la categoría "Ahorro Meta") */}
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                   Meta: Teléfono de Mari <span className="text-purple-400 text-xs font-normal bg-purple-500/10 px-2 py-1 rounded-lg">450 USDT</span>
                </h2>
                <span className="text-sm font-mono font-bold text-purple-300">
                  {((totalAhorradoMeta / 450) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-full bg-black/50 rounded-full border border-purple-500/10 p-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((totalAhorradoMeta / 450) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center md:text-right border-l border-purple-500/10 md:pl-6">
              <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest">Faltan</p>
              <p className="text-2xl font-black text-white">${Math.max(450 - totalAhorradoMeta, 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* BALANCES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardBalance title="Total General" amount={totalGeneral} icon={<Wallet />} color="from-purple-600/40" highlight />
          <CardBalance title="Balance Víctor" amount={totalVictor} icon={<Users />} color="from-indigo-600/30" />
          <CardBalance title="Balance Mari" amount={totalMari} icon={<Users />} color="from-fuchsia-600/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1a0f2e] border border-purple-500/30 p-6 rounded-3xl shadow-xl">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white"><Plus className="w-5 h-5 text-purple-400" /> Nuevo Registro</h2>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`w-full border rounded-xl p-3 text-sm font-black outline-none ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                    <option value="egreso">GASTO 💸</option>
                    <option value="ingreso">INGRESO 💰</option>
                  </select>
                  <select value={usuario} onChange={(e) => {setUsuario(e.target.value); localStorage.setItem("pf_usuario", e.target.value)}} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-3 text-sm text-white font-bold outline-none">
                    <option value="Victor">Víctor</option>
                    <option value="Mari">Mari</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                {isAddingCat ? (
                  <div className="flex gap-2 w-full">
                    <input type="text" placeholder="Ej: Gimnasio 🏋️" value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-3 text-sm text-white outline-none" />
                    <button type="button" onClick={agregarCategoria} className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl"><Check className="w-5 h-5"/></button>
                    <button type="button" onClick={() => setIsAddingCat(false)} className="bg-rose-500/20 text-rose-400 p-3 rounded-xl"><X className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-3 text-sm text-white outline-none">
                      {categoriasList.map(cat => (
                        <option key={cat.id} value={cat.valor}>{cat.label}</option>
                      ))}
                      {/* LA CATEGORÍA DE META AÑADIDA MANUALMENTE AQUÍ */}
                  
                      <option value="otro">Otro ✍️</option>
                    </select>
                    <button type="button" onClick={() => setIsAddingCat(true)} className="bg-purple-500/20 text-purple-400 p-3 rounded-xl border border-purple-500/30"><Plus className="w-5 h-5"/></button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl p-3 text-sm text-white font-mono outline-none" />
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-24 bg-black/50 border border-purple-500/30 rounded-xl p-3 text-sm text-white outline-none">
                    <option value="usd">USD</option>
                    <option value="bs">BS</option>
                    <option value="usdt">USDT</option>
                  </select>
                </div>
                {monto && rates.bcv > 0 && (
                  <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-purple-500/20 w-full mb-2 text-center">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase text-purple-400 font-bold mb-1">BCV</p>
                      <p className="font-mono text-white font-bold text-lg">${calcularMontos(parseFloat(monto), moneda).monto_usd_bcv.toFixed(2)}</p>
                    </div>
                    <div className="h-8 w-px bg-purple-500/30 mx-2"></div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase text-purple-400 font-bold mb-1">Paralelo</p>
                      <p className="font-mono text-white font-bold text-lg">${calcularMontos(parseFloat(monto), moneda).monto_usd_paralelo.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                <button type="submit" className="w-full font-black py-4 rounded-xl transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95">GUARDAR</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a0f2e] border border-purple-500/30 p-5 rounded-3xl space-y-2">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-purple-400"/> Gastos Fijos</h3>
                {gastosFijos.map(gasto => (
                  <div key={gasto.id}>
                    {editingGasto === gasto.id ? (
                      <div className="flex flex-col gap-3 p-4 rounded-xl border border-purple-500 bg-purple-900/20">
                        <input type="text" value={gastoForm.nombre} onChange={e => setGastoForm({...gastoForm, nombre: e.target.value})} className="bg-black/50 p-2 rounded text-sm text-white outline-none" />
                        <div className="flex gap-2">
                          <input type="number" value={gastoForm.monto_estimado_usd} onChange={e => setGastoForm({...gastoForm, monto_estimado_usd: e.target.value})} className="w-1/2 bg-black/50 p-2 rounded text-sm text-white" />
                          <input type="number" value={gastoForm.fecha_limite} onChange={e => setGastoForm({...gastoForm, fecha_limite: e.target.value})} className="w-1/2 bg-black/50 p-2 rounded text-sm text-white" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={cancelarEdicionGasto} className="text-rose-400"><X /></button>
                          <button onClick={() => guardarEdicionGasto(gasto.id)} className="text-emerald-400"><Check /></button>
                        </div>
                      </div>
                    ) : (
                      <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${gasto.pagado ? 'bg-emerald-900/20 border-emerald-500/30 opacity-60' : 'bg-black/40 border-purple-500/20 hover:border-purple-500/50'}`}>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleGastoFijo(gasto.id, gasto.pagado)}>
                          {gasto.pagado ? <CheckSquare className="text-emerald-400 w-5 h-5"/> : <Square className="text-purple-400 w-5 h-5"/>}
                          <div><p className="text-sm font-bold">{gasto.nombre}</p><p className="text-[10px] text-purple-400">Día {gasto.fecha_limite}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">${gasto.monto_estimado_usd}</span>
                          <button onClick={() => iniciarEdicionGasto(gasto)} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-purple-400 transition-opacity"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-[#1a0f2e] border border-fuchsia-500/30 p-5 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-fuchsia-400"/> Cashea</h3>
                  <button onClick={() => setIsAddingCashea(!isAddingCashea)} className="p-1.5 bg-fuchsia-500/20 rounded-md text-fuchsia-400"><Plus className="w-4 h-4"/></button>
                </div>
                {isAddingCashea && (
                  <form onSubmit={agregarCashea} className="flex flex-col gap-3 p-4 mb-4 rounded-xl border border-fuchsia-500/50 bg-fuchsia-900/10">
                    <input type="text" placeholder="Artículo" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} className="bg-black/50 p-2 rounded text-sm text-white" required />
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="$" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} className="w-1/2 bg-black/50 p-2 rounded text-sm text-white" required />
                      <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} className="w-1/2 bg-black/50 p-2 rounded text-sm text-white" required />
                    </div>
                    {/* RESTAURADO EL SELECTOR DE USUARIO EN CASHEA */}
                    <select value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/30 rounded-lg p-2 text-sm text-white outline-none">
                      <option value="Victor">Paga: Víctor</option>
                      <option value="Mari">Paga: Mari</option>
                      <option value="Ambos">Pagan: Ambos (Mitad)</option>
                    </select>
                    <button type="submit" className="bg-fuchsia-600 p-2 rounded font-bold">Guardar</button>
                  </form>
                )}
                <div className="space-y-2">
                  {cuotasCashea.map(cuota => (
                    <div key={cuota.id} className={`group flex items-center justify-between p-3 rounded-xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-black/40 border-fuchsia-500/20'}`}>
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCashea(cuota.id, cuota.pagado)}>
                        {cuota.pagado ? <CheckSquare className="text-emerald-400 w-5 h-5"/> : <Square className="text-fuchsia-400 w-5 h-5"/>}
                        <div>
                          {/* RESTAURADA LA VISUALIZACIÓN DEL USUARIO EN LA LISTA */}
                          <p className="text-sm font-bold">
                            {cuota.articulo} <span className="text-[10px] text-fuchsia-300 font-normal ml-1 bg-fuchsia-500/20 px-1.5 py-0.5 rounded-md">{cuota.usuario || 'Victor'}</span>
                          </p>
                          <p className="text-[10px] text-fuchsia-400">{cuota.fecha_pago}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">${cuota.monto_cuota}</span>
                        <button 
  onClick={async (e) => {
    e.stopPropagation(); 
    if(confirm("¿Eliminar esta cuota de Cashea?")) {
      await supabase.from('cashea').delete().eq('id', cuota.id);
      fetchData();
    }
  }} 
  className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500 transition-opacity"
>
  <Trash2 className="w-4 h-4" />
</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1a0f2e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-purple-500/20 flex justify-between items-center bg-black/20 text-sm font-bold uppercase text-purple-200">
                <span>Historial</span>
                <input type="month" value={mesActual} onChange={(e) => setMesActual(e.target.value)} className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-1 text-white outline-none" />
              </div>
              <div className="divide-y divide-purple-500/10 max-h-[400px] overflow-y-auto">
                {transaccionesDelMes.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${tx.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.tipo === 'ingreso' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{tx.descripcion}</p>
                        <p className="text-[10px] text-purple-400/80 uppercase">{tx.usuario} • {new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-base font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>${tx.monto_usd_bcv?.toFixed(2)}</p>
                        <p className="text-[10px] text-purple-300/50">Bs. {tx.monto_bs?.toFixed(2)}</p>
                      </div>
                      <button onClick={() => eliminarTransaccion(tx.id)} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST MOTIVACIONAL COMPLETAMENTE CENTRADO Y GRANDE */}
      {showToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a0f2e] border-2 border-purple-400/50 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center gap-6 max-w-md w-full animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-5 rounded-3xl text-5xl shadow-2xl">🐥</div>
            <div className="text-center space-y-2">
              <p className="text-white font-black text-xl md:text-2xl italic leading-tight">
                "{mensajeMotivacional}"
              </p>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-[0.2em] pt-4">Pollitos Finanzas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardBalance({ title, amount, icon, color, highlight = false }: any) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${color} to-[#1a0f2e] border ${highlight ? 'border-purple-400' : 'border-purple-500/20'} p-6 rounded-3xl shadow-xl flex flex-col justify-between h-full`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">{title}</p>
        <div className="text-purple-300/80">{icon}</div>
      </div>
      <p className={`text-3xl font-black ${amount < 0 ? 'text-rose-400' : 'text-white'}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
