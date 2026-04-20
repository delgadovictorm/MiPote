"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, 
  Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X, Bell, Send, PieChart as PieChartIcon, BarChart3, Target, Home, CreditCard, StickyNote, Calculator
} from "lucide-react";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function FinanzasDashboard() {
  // ESTADOS DE NAVEGACIÓN (NUEVO)
  const [activeTab, setActiveTab] = useState("inicio");
  const [filtroHistorial, setFiltroHistorial] = useState("Todos");

  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  const [cuotasCashea, setCuotasCashea] = useState<any[]>([]);
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().toISOString().slice(0, 7));

  const [categoriasList, setCategoriasList] = useState<any[]>([]);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");

  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "Victor" });

  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ categoria: "", monto_limite: "" });

  const [showToast, setShowToast] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState("");
  const [toastType, setToastType] = useState("ingreso");

  // ESTADOS CALCULADORA
  const [calcMonto, setCalcMonto] = useState("");
  const [calcMoneda, setCalcMoneda] = useState("bs");

  const MENSAJES_INGRESOS = [
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

  const MENSAJES_EGRESOS = [
    "¿Realmente necesitabas esto o fue un impulso? Evalúa tu costo de oportunidad. 📉",
    "Un dólar gastado hoy es un dólar menos produciendo rendimiento mañana. 💸",
    "Recuerda que la inflación no perdona, pero tus gastos hormiga tampoco. 🐜",
    "¿Este gasto te acerca al teléfono de Mari o te aleja? Piensa estratégicamente. 📱📉",
    "El flujo de caja negativo quema liquidez. Controla los egresos. ⚠️",
    "Mía te está juzgando con la mirada por este gasto. 🐶🤨",
    "Cashea es deuda, no dinero extra. Cuidado con el apalancamiento. 💳",
    "Registrado. Pero pregúntate: ¿podrías haberlo conseguido a mejor precio? 🔍",
    "El arbitraje cambiario te salva a veces, pero no justifica el consumismo. ⚖️",
    "Si este gasto no genera valor o bienestar real, es solo pérdida neta. 🗑️",
    "Revisa tu presupuesto mensual, este gasto acaba de reducir tu margen. 📊",
    "Gastar es fácil, generar liquidez es lo difícil. Respeta tu esfuerzo. 💼",
    "¿Esto era un 'deseo' o una 'necesidad'? Las finanzas no admiten autoengaños. 🧠",
    "Cada salida de capital retrasa tus objetivos de inversión. 🐢",
    "La disciplina duele hoy, pero la falta de liquidez dolerá mañana. 📉",
    "Un buen economista sabe cuándo cerrar la billetera. 🎓",
    "¿Vale la pena descapitalizarse por esto? 📉",
    "Tu 'yo' del futuro acaba de perder un poco de libertad financiera. 🕰️",
    "Cuidado, los pequeños gastos son las grandes fugas del patrimonio. 💧",
    "El consumismo es el enemigo silencioso de la acumulación de capital. 🛍️",
    "El mercado castiga a los que no cuiden su liquidez. 📉",
    "¿Pasaste esto por el filtro de prioridad o solo pasaste la tarjeta? 💳",
    "Si sigues así, ni el interés compuesto te va a rescatar. 📉",
    "Gasto registrado. Que este número te sirva de reflexión. 📝",
    "Recuerda: El objetivo no es solo ganar más, sino retener más. 🛡️",
    "Tu balance de USDT acaba de sufrir un golpe. ¿Valió la pena? 🥊",
    "Estás gastando dinero presente a costa de tu seguridad futura. 📉",
    "Menos compras innecesarias, más ahorro duro. 🧱",
    "La regla de oro: si no lo necesitas, es caro a cualquier precio. 🏷️",
    "Mía espera sus croquetas, no dejes el presupuesto en cero. 🦴",
    "El teléfono de Mari no se va a comprar solo con intenciones. 📱",
    "Un presupuesto sin disciplina es solo un papel con números. 🧾",
    "La riqueza se mide en lo que no gastas, no en lo que compras. 💎",
    "Cuidado con la trampa del estilo de vida inflado. 🎈",
    "¿Calculaste las horas de trabajo que te costó este gasto? ⏳",
    "El dinero se va más rápido de lo que se deprecia el bolívar. 🏃‍♂️",
    "Si pagas intereses por cosas que se deprecian, estás retrocediendo. 📉",
    "El ahorro exige sacrificio. El gasto solo exige debilidad. 📉",
    "Optimiza tus recursos. Todo gasto tiene un impacto. ⚙️",
    "No permitas que las emociones decidan tus estados financieros. 🎭",
    "Este egreso afecta tu liquidez inmediata. Administra el riesgo. ⚠️",
    "¿Gasto recurrente o eventual? Vigila las fugas sistémicas. 🚰",
    "El capital es munición. No la desperdicies en objetivos menores. 🎯",
    "Ser estricto con el gasto es la única vía para acumular patrimonio. 🛣️",
    "Si cada gasto requiere una justificación, estás en el camino correcto. ¿Lo hiciste? ⚖️",
    "Ahorro no es lo que sobra después de gastar. Gasto es lo que sobra después de ahorrar. 🧠",
    "Las matemáticas no mienten, y este registro resta. ➖",
    "Cuidado con comprometer flujos de caja futuros. 📉",
    "Gasto procesado. Ahora, vuelve al plan. 🗺️",
    "Toda salida de efectivo es una decisión de asignación de recursos. 📊"
  ];

  const triggerToast = (tipoTransaccion: string) => {
    const lista = tipoTransaccion === "ingreso" ? MENSAJES_INGRESOS : MENSAJES_EGRESOS;
    const randomMsg = lista[Math.floor(Math.random() * lista.length)];
    setMensajeMotivacional(randomMsg);
    setToastType(tipoTransaccion);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
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

      const { data: recData } = await supabase.from("recordatorios").select("*").order("created_at", { ascending: false });
      if (recData) setRecordatorios(recData);

      const { data: presData } = await supabase.from("presupuestos").select("*");
      if (presData) setPresupuestos(presData);

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

  const guardarPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.categoria || !budgetForm.monto_limite) return;
    
    const existente = presupuestos.find(p => p.categoria === budgetForm.categoria);
    if (existente) {
      await supabase.from("presupuestos").update({ monto_limite: parseFloat(budgetForm.monto_limite) }).eq("id", existente.id);
    } else {
      await supabase.from("presupuestos").insert([{ categoria: budgetForm.categoria, monto_limite: parseFloat(budgetForm.monto_limite) }]);
    }
    setIsEditingBudget(false);
    setBudgetForm({ categoria: "", monto_limite: "" });
    fetchData();
  };

  const eliminarPresupuesto = async (id: string) => {
    if(!confirm("¿Eliminar este tope presupuestario?")) return;
    await supabase.from("presupuestos").delete().eq("id", id);
    fetchData();
  };

  const agregarRecordatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoRecordatorio.trim()) return;
    await supabase.from("recordatorios").insert([{ texto: nuevoRecordatorio, usuario: usuario }]);
    setNuevoRecordatorio("");
    fetchData();
  };

  const eliminarRecordatorio = async (id: string) => {
    await supabase.from("recordatorios").delete().eq("id", id);
    fetchData();
  };

  const toggleRecordatorio = async (id: string, estado: boolean) => {
    await supabase.from("recordatorios").update({ completado: !estado }).eq("id", id);
    fetchData();
  };

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
      monto_usd_bcv = rates.bcv > 0 ? montoInput / rates.bcv : 0;
      monto_usd_paralelo = rates.usdt > 0 ? montoInput / rates.usdt : 0;
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
    if (!descripcion.trim()) {
      alert("Debes especificar el motivo o descripción del registro.");
      return;
    }

    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);
    
    // Ahora el usuario SIEMPRE provee la descripción
    let descFinal = descripcion; 
    let labelCategoria = categoriasList.find(c => c.valor === categoria)?.label || categoria;
    
    // Anexamos la etiqueta de categoría a la descripción para contexto
    if (categoria !== "otro" && categoria !== "cashea" && categoria !== "ahorro_meta") {
       descFinal = `${labelCategoria} - ${descripcion}`;
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
      triggerToast(tipo);
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

  const toggleCashea = async (cuota: any) => {
    const nuevoEstado = !cuota.pagado;
    
    await supabase.from("cashea").update({ pagado: nuevoEstado }).eq("id", cuota.id);
    
    if (nuevoEstado) {
      if (confirm(`¿Descontar $${cuota.monto_cuota} (Deuda Nominal) del balance de ${cuota.usuario} por el pago de Cashea?\n\nNota: Se calculará el descuento real en USDT aplicando el arbitraje de tasas (Deuda BCV / Paralelo).`)) {
        
        const costo_bs = cuota.monto_cuota * rates.bcv;
        const costo_real_usdt = rates.usdt > 0 ? costo_bs / rates.usdt : cuota.monto_cuota;

        await supabase.from("transacciones").insert([{
          descripcion: `Pago Cashea: ${cuota.articulo}`,
          monto_original: cuota.monto_cuota,
          moneda_original: "usd",
          monto_bs: costo_bs,
          monto_usd_bcv: cuota.monto_cuota,
          monto_usd_paralelo: costo_real_usdt,
          categoria: "cashea",
          usuario: cuota.usuario,
          tipo: "egreso",
          created_at: new Date()
        }]);
        triggerToast("egreso");
      } else {
        await supabase.from("cashea").update({ pagado: false }).eq("id", cuota.id);
      }
    }
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

  // --- LÓGICA CONTABLE ---
  const getPatrimonioBruto = () => {
    return transactions.reduce((acc, tx) => {
      const valorRealUSDT = tx.monto_usd_paralelo || 0;
      return tx.tipo === "ingreso" ? acc + valorRealUSDT : acc - valorRealUSDT;
    }, 0);
  };

  const getDisponible = (user: string | null) => {
    return transactions
      .filter(tx => (!user || tx.usuario === user || tx.usuario === 'Ambos'))
      .reduce((acc, tx) => {
        const valorRealUSDT = tx.monto_usd_paralelo || 0;
        const modificador = (tx.usuario === 'Ambos' && user) ? 0.5 : 1; 
        
        if (tx.categoria === "ahorro_meta") {
          return acc; 
        }
        return tx.tipo === "ingreso" ? acc + (valorRealUSDT * modificador) : acc - (valorRealUSDT * modificador);
      }, 0);
  };

  const totalAhorradoMeta = transactions
    .filter(tx => tx.categoria === "ahorro_meta" && tx.tipo === "ingreso")
    .reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);

  const patrimonioBrutoUSDT = getPatrimonioBruto();
  const disponibleVictor = getDisponible("Victor");
  const disponibleMari = getDisponible("Mari");
  
  const equivalenciaBS = patrimonioBrutoUSDT * rates.usdt;
  const equivalenciaUSD_BCV = rates.bcv > 0 ? equivalenciaBS / rates.bcv : 0;

  const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));

  // FILTRO DEL HISTORIAL
  const transaccionesFiltradas = transaccionesDelMes.filter(tx => {
    if (filtroHistorial === "Todos") return true;
    return tx.usuario === filtroHistorial;
  });

  const gastosDelMes = transaccionesDelMes.filter(tx => tx.tipo === 'egreso');
  
  const gastosPorCategoriaValor = gastosDelMes.reduce((acc, tx) => {
    acc[tx.categoria] = (acc[tx.categoria] || 0) + (tx.monto_usd_paralelo || 0);
    return acc;
  }, {} as Record<string, number>);

  const datosCategoriasMap = gastosDelMes.reduce((acc, tx) => {
    let catName = tx.categoria;
    if (tx.categoria === 'cashea') catName = 'Cashea';
    else if (tx.categoria === 'otro') catName = 'Otros Gastos';
    else {
      const found = categoriasList.find(c => c.valor === tx.categoria);
      if (found) catName = found.label;
    }
    
    acc[catName] = (acc[catName] || 0) + (tx.monto_usd_paralelo || 0);
    return acc;
  }, {} as Record<string, number>);

  const dataGraficoTorta = Object.keys(datosCategoriasMap)
    .map(key => ({ name: key, value: datosCategoriasMap[key] }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'];

  const ingresosMesChart = transaccionesDelMes.filter(tx => tx.tipo === 'ingreso' && tx.categoria !== 'ahorro_meta').reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
  const egresosMesChart = gastosDelMes.reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
  const dataFlujoCaja = [
    { name: 'Este Mes', Ingresos: ingresosMesChart, Egresos: egresosMesChart }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold text-xs mb-1">{payload[0].name || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
              {entry.dataKey}: ${entry.value.toFixed(2)} USDT
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // RENDERIZADO CONDICIONAL DE PESTAÑAS
  const renderTabContent = () => {
    switch (activeTab) {
      case "inicio":
        return (
          <>
            {/* PROGRESO DE META */}
            <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <h2 className="text-sm md:text-xl font-black text-white flex items-center gap-2">
                      Meta: Teléfono de Mari <span className="text-purple-400 text-[10px] md:text-xs font-normal bg-purple-500/10 px-2 py-0.5 rounded-lg">450 USDT</span>
                    </h2>
                    <span className="text-xs md:text-sm font-mono font-bold text-purple-300">
                      {((totalAhorradoMeta / 450) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 md:h-4 w-full bg-black/50 rounded-full border border-purple-500/10 p-0.5 md:p-1">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((totalAhorradoMeta / 450) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-left md:text-right md:border-l border-purple-500/10 md:pl-6">
                  <p className="text-[9px] md:text-[10px] text-purple-400 uppercase font-black tracking-widest">Faltan</p>
                  <p className="text-lg md:text-2xl font-black text-white">${Math.max(450 - totalAhorradoMeta, 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* BALANCES DIVIDIDOS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="col-span-2 md:col-span-1">
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/40 to-[#1a0f2e] border border-purple-400 p-5 md:p-6 rounded-3xl shadow-xl flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-2 md:mb-4">
                    <p className="text-[10px] md:text-xs font-bold text-purple-200 uppercase tracking-widest">Patrimonio Total (USDT)</p>
                    <div className="text-purple-300/80"><Wallet className="w-5 h-5"/></div>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-white">
                    ${patrimonioBrutoUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-purple-500/30 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-purple-400 uppercase font-bold tracking-wider">Equiv. BS</span>
                      <span className="text-xs font-mono text-purple-100">Bs. {equivalenciaBS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-5 w-px bg-purple-500/30"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-purple-400 uppercase font-bold tracking-wider">Equiv. BCV</span>
                      <span className="text-xs font-mono text-purple-100">${equivalenciaUSD_BCV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
              <CardBalance title="Disponible Víctor" amount={disponibleVictor} icon={<Users className="w-4 h-4"/>} color="from-indigo-600/30" small />
              <CardBalance title="Disponible Mari" amount={disponibleMari} icon={<Users className="w-4 h-4"/>} color="from-fuchsia-600/30" small />
            </div>

            {/* DASHBOARD ANALÍTICO (GRÁFICOS) */}
            {transaccionesDelMes.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-6 rounded-3xl shadow-xl flex flex-col">
                  <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-400"/> Distribución de Egresos (Mes Actual)
                  </h3>
                  <div className="h-[250px] w-full">
                    {dataGraficoTorta.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dataGraficoTorta} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                            {dataGraficoTorta.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#c084fc' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] text-purple-400/50 italic">No hay gastos registrados este mes.</div>
                    )}
                  </div>
                </div>

                <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-6 rounded-3xl shadow-xl flex flex-col">
                  <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400"/> Flujo de Caja Libre
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataFlujoCaja} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#6b21a8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b21a8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#2e1065', opacity: 0.4}} />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {/* FORMULARIO DE REGISTRO */}
              <div className="lg:col-span-5 space-y-4 md:space-y-6">
                <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-6 rounded-3xl shadow-xl">
                  <h2 className="text-base md:text-lg font-bold mb-4 md:mb-5 flex items-center gap-2 text-white"><Plus className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /> Nuevo Registro</h2>
                  <form onSubmit={handleManualSubmit} className="space-y-3 md:space-y-4">
                    <div className="flex gap-2 md:gap-3">
                      <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`flex-1 border rounded-xl p-2.5 md:p-3 text-xs md:text-sm font-black outline-none ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                        <option value="egreso">GASTO 💸</option>
                        <option value="ingreso">INGRESO 💰</option>
                      </select>
                      <select value={usuario} onChange={(e) => {setUsuario(e.target.value); localStorage.setItem("pf_usuario", e.target.value)}} className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white font-bold outline-none">
                        <option value="Victor">Víctor</option>
                        <option value="Mari">Mari</option>
                        <option value="Ambos">Ambos</option>
                      </select>
                    </div>

                    {isAddingCat ? (
                      <div className="flex gap-2 w-full">
                        <input type="text" placeholder="Ej: Gimnasio 🏋️" value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white outline-none" />
                        <button type="button" onClick={agregarCategoria} className="bg-emerald-500/20 text-emerald-400 px-3 md:p-3 rounded-xl"><Check className="w-4 h-4 md:w-5 md:h-5"/></button>
                        <button type="button" onClick={() => setIsAddingCat(false)} className="bg-rose-500/20 text-rose-400 px-3 md:p-3 rounded-xl"><X className="w-4 h-4 md:w-5 md:h-5"/></button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-2">
                          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white outline-none">
                            {categoriasList.map(cat => <option key={cat.id} value={cat.valor}>{cat.label}</option>)}
                            <option value="cashea">Cashea</option>
                            <option value="otro">Otro ✍️</option>
                          </select>
                          <button type="button" onClick={() => setIsAddingCat(true)} className="bg-purple-500/20 text-purple-400 px-3 md:p-3 rounded-xl border border-purple-500/30"><Plus className="w-4 h-4 md:w-5 md:h-5"/></button>
                        </div>
                        {/* INPUT DE DESCRIPCIÓN AHORA ES SIEMPRE VISIBLE Y OBLIGATORIO */}
                        <input 
                          type="text" required placeholder="Especifica el detalle (Ej: Zapatos Zara, Delivery KFC)" 
                          value={descripcion} onChange={(e) => setDescripcion(e.target.value)} 
                          className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white outline-none focus:border-purple-400 transition-colors" 
                        />
                      </div>
                    )}

                    <div className="flex gap-2 md:gap-3">
                      <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white font-mono outline-none" />
                      <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-20 md:w-24 bg-black/50 border border-purple-500/30 rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-white outline-none">
                        <option value="usd">USD</option>
                        <option value="bs">BS</option>
                        <option value="usdt">USDT</option>
                      </select>
                    </div>
                    {monto && rates.bcv > 0 && (
                      <div className="flex items-center justify-between bg-black/40 p-3 md:p-4 rounded-xl border border-purple-500/20 w-full mb-2 text-center">
                        <div className="flex-1">
                          <p className="text-[9px] md:text-[10px] uppercase text-purple-400 font-bold mb-0.5 md:mb-1">BCV</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">${calcularMontos(parseFloat(monto), moneda).monto_usd_bcv.toFixed(2)}</p>
                        </div>
                        <div className="h-6 md:h-8 w-px bg-purple-500/30 mx-2"></div>
                        <div className="flex-1">
                          <p className="text-[9px] md:text-[10px] uppercase text-purple-400 font-bold mb-0.5 md:mb-1">Paralelo</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">${calcularMontos(parseFloat(monto), moneda).monto_usd_paralelo.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    <button type="submit" className="w-full font-black py-3 md:py-4 rounded-xl transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95 text-xs md:text-sm">GUARDAR</button>
                  </form>
                </div>
              </div>

              {/* HISTORIAL CON FILTROS */}
              <div className="lg:col-span-7 space-y-4 md:space-y-6">
                <div className="bg-[#1a0f2e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-3 md:p-4 border-b border-purple-500/20 flex flex-col gap-3 bg-black/20">
                    <div className="flex justify-between items-center text-xs md:text-sm font-bold uppercase text-purple-200">
                      <span>Historial Dinámico</span>
                      <input type="month" value={mesActual} onChange={(e) => setMesActual(e.target.value)} className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-1 text-white outline-none text-[10px] md:text-xs" />
                    </div>
                    {/* BOTONES DE FILTRO */}
                    <div className="flex gap-2 p-1 bg-black/50 rounded-xl">
                      {["Todos", "Victor", "Mari", "Ambos"].map(filtro => (
                        <button 
                          key={filtro}
                          onClick={() => setFiltroHistorial(filtro)}
                          className={`flex-1 text-[10px] md:text-xs font-bold py-1.5 rounded-lg transition-colors ${filtroHistorial === filtro ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-purple-900/30'}`}
                        >
                          {filtro}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-purple-500/10 max-h-[500px] overflow-y-auto">
                    {transaccionesFiltradas.length === 0 ? (
                      <div className="p-8 text-center text-purple-400/50 text-sm">No hay registros para mostrar.</div>
                    ) : (
                      transaccionesFiltradas.map((tx) => (
                        <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <div className={`p-1.5 md:p-2 rounded-xl shrink-0 ${tx.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {tx.tipo === 'ingreso' ? <ArrowUpCircle className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowDownCircle className="w-4 h-4 md:w-5 md:h-5" />}
                            </div>
                            <div className="truncate">
                              <p className="text-xs md:text-sm font-bold text-white truncate">{tx.descripcion}</p>
                              <p className="text-[8px] md:text-[10px] text-purple-400/80 uppercase truncate">{tx.usuario} • {new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-4 shrink-0">
                            <div className="text-right">
                              <p className={`text-sm md:text-base font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>${tx.monto_usd_paralelo?.toFixed(2)} USDT</p>
                              <p className="text-[8px] md:text-[10px] text-purple-300/50">Bs. {tx.monto_bs?.toFixed(2)}</p>
                            </div>
                            <button onClick={() => eliminarTransaccion(tx.id)} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      
      case "pagos":
        return (
          <div className="space-y-4 md:space-y-6">
             {/* --- CONTROL PRESUPUESTARIO --- */}
            <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400"/> Control Presupuestario (Base Cero)
                </h3>
                <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/40 rounded-md text-purple-400 transition-colors">
                  {isEditingBudget ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {isEditingBudget && (
                <form onSubmit={guardarPresupuesto} className="flex gap-2 mb-5 p-3 bg-black/40 rounded-xl border border-purple-500/20">
                  <select value={budgetForm.categoria} onChange={e => setBudgetForm({...budgetForm, categoria: e.target.value})} className="flex-1 bg-transparent text-xs md:text-sm text-white outline-none cursor-pointer" required>
                    <option value="" className="bg-[#1a0f2e]">Selecciona Categoría...</option>
                    {categoriasList.map(c => <option key={c.id} value={c.valor} className="bg-[#1a0f2e]">{c.label}</option>)}
                    <option value="cashea" className="bg-[#1a0f2e]">Cashea</option>
                    <option value="otro" className="bg-[#1a0f2e]">Otro</option>
                  </select>
                  <input type="number" step="0.01" placeholder="Límite $" value={budgetForm.monto_limite} onChange={e => setBudgetForm({...budgetForm, monto_limite: e.target.value})} className="w-20 md:w-28 bg-transparent text-xs md:text-sm text-white outline-none font-mono border-l border-purple-500/30 pl-2" required />
                  <button type="submit" className="text-emerald-400 p-1 hover:bg-emerald-500/20 rounded transition-colors"><Check className="w-4 h-4 md:w-5 md:h-5"/></button>
                </form>
              )}

              <div className="space-y-4">
                {presupuestos.length === 0 ? (
                  <p className="text-[10px] md:text-xs text-purple-400/50 italic">No hay topes definidos. Asigna límites mensuales para evitar fugas de capital.</p>
                ) : (
                  presupuestos.map(p => {
                    const gastoActual = gastosPorCategoriaValor[p.categoria] || 0;
                    const porcentaje = Math.min((gastoActual / p.monto_limite) * 100, 100);
                    const isOver = gastoActual > p.monto_limite;
                    const barColor = isOver ? 'bg-rose-600' : porcentaje > 80 ? 'bg-rose-500' : porcentaje > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                    let catLabel = p.categoria === 'cashea' ? 'Cashea' : p.categoria === 'otro' ? 'Otro' : categoriasList.find(c => c.valor === p.categoria)?.label || p.categoria;

                    return (
                      <div key={p.id} className="space-y-1.5 relative group">
                        <div className="flex justify-between text-xs md:text-sm text-white">
                          <span className="font-bold flex items-center gap-2">
                            {catLabel} 
                            <button onClick={() => eliminarPresupuesto(p.id)} className="text-rose-500/0 group-hover:text-rose-500/50 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                          </span>
                          <span className="font-mono">
                            <span className={isOver ? 'text-rose-400 font-black' : ''}>${gastoActual.toFixed(2)}</span> 
                            <span className="text-purple-400/50"> / ${p.monto_limite}</span>
                          </span>
                        </div>
                        <div className="h-2 md:h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-purple-500/10">
                          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${porcentaje}%` }}></div>
                        </div>
                        {isOver && <p className="text-[8px] md:text-[9px] text-rose-400 text-right uppercase tracking-widest mt-0.5">Límite Excedido</p>}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* GASTOS FIJOS */}
              <div className="bg-[#1a0f2e] border border-purple-500/30 p-4 md:p-5 rounded-3xl space-y-2">
                <h3 className="text-xs md:text-sm font-bold text-white mb-3 md:mb-4 flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400"/> Gastos Fijos</h3>
                {gastosFijos.map(gasto => (
                  <div key={gasto.id}>
                    {editingGasto === gasto.id ? (
                      <div className="flex flex-col gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-purple-500 bg-purple-900/20">
                        <input type="text" value={gastoForm.nombre} onChange={e => setGastoForm({...gastoForm, nombre: e.target.value})} className="bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white outline-none" />
                        <div className="flex gap-2">
                          <input type="number" value={gastoForm.monto_estimado_usd} onChange={e => setGastoForm({...gastoForm, monto_estimado_usd: e.target.value})} className="w-1/2 bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" />
                          <input type="number" value={gastoForm.fecha_limite} onChange={e => setGastoForm({...gastoForm, fecha_limite: e.target.value})} className="w-1/2 bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" />
                        </div>
                        <div className="flex justify-end gap-2 mt-1 md:mt-0">
                          <button onClick={cancelarEdicionGasto} className="text-rose-400"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
                          <button onClick={() => guardarEdicionGasto(gasto.id)} className="text-emerald-400"><Check className="w-4 h-4 md:w-5 md:h-5" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className={`group flex items-center justify-between p-2.5 md:p-3 rounded-xl border transition-all ${gasto.pagado ? 'bg-emerald-900/20 border-emerald-500/30 opacity-60' : 'bg-black/40 border-purple-500/20 hover:border-purple-500/50'}`}>
                        <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => toggleGastoFijo(gasto.id, gasto.pagado)}>
                          {gasto.pagado ? <CheckSquare className="text-emerald-400 w-4 h-4 md:w-5 md:h-5"/> : <Square className="text-purple-400 w-4 h-4 md:w-5 md:h-5"/>}
                          <div><p className="text-xs md:text-sm font-bold">{gasto.nombre}</p><p className="text-[9px] md:text-[10px] text-purple-400">Día {gasto.fecha_limite}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs md:text-sm">${gasto.monto_estimado_usd}</span>
                          <button onClick={() => iniciarEdicionGasto(gasto)} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-purple-400 transition-opacity"><Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CASHEA */}
              <div className="bg-[#1a0f2e] border border-fuchsia-500/30 p-4 md:p-5 rounded-3xl">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-fuchsia-400"/> Cashea</h3>
                  <button onClick={() => setIsAddingCashea(!isAddingCashea)} className="p-1 md:p-1.5 bg-fuchsia-500/20 rounded-md text-fuchsia-400"><Plus className="w-3.5 h-3.5 md:w-4 md:h-4"/></button>
                </div>
                {isAddingCashea && (
                  <form onSubmit={agregarCashea} className="flex flex-col gap-2 md:gap-3 p-3 md:p-4 mb-3 md:mb-4 rounded-xl border border-fuchsia-500/50 bg-fuchsia-900/10">
                    <input type="text" placeholder="Artículo" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} className="bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" required />
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="$" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} className="w-1/2 bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" required />
                      <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} className="w-1/2 bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" required />
                    </div>
                    <select value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} className="w-full bg-black/50 border border-fuchsia-500/30 rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-white outline-none">
                      <option value="Victor">Paga: Víctor</option>
                      <option value="Mari">Paga: Mari</option>
                      <option value="Ambos">Pagan: Ambos (Mitad)</option>
                    </select>
                    <button type="submit" className="bg-fuchsia-600 p-1.5 md:p-2 rounded font-bold text-xs md:text-sm">Guardar</button>
                  </form>
                )}
                <div className="space-y-2">
                  {cuotasCashea.map(cuota => (
                    <div key={cuota.id} className={`group flex items-center justify-between p-2.5 md:p-3 rounded-xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-black/40 border-fuchsia-500/20'}`}>
                      <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => toggleCashea(cuota)}>
                        {cuota.pagado ? <CheckSquare className="text-emerald-400 w-4 h-4 md:w-5 md:h-5"/> : <Square className="text-fuchsia-400 w-4 h-4 md:w-5 md:h-5"/>}
                        <div>
                          <p className="text-xs md:text-sm font-bold">
                            {cuota.articulo} <span className="text-[8px] md:text-[10px] text-fuchsia-300 font-normal ml-1 bg-fuchsia-500/20 px-1 md:px-1.5 py-0.5 rounded-md">{cuota.usuario || 'Victor'}</span>
                          </p>
                          <p className="text-[9px] md:text-[10px] text-fuchsia-400">{cuota.fecha_pago}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs md:text-sm">${cuota.monto_cuota}</span>
                        <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar esta cuota de Cashea?")) { await supabase.from('cashea').delete().eq('id', cuota.id); fetchData(); } }} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "avisos":
        return (
          <div className="bg-[#1a0f2e] border border-amber-500/30 p-6 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                 <Bell className="w-6 h-6 text-amber-400 animate-bounce" /> Avisos y Notas
              </h2>
            </div>
            
            <form onSubmit={agregarRecordatorio} className="flex gap-3 mb-6">
              <input 
                type="text" placeholder="Escribe una nota para Mari o Víctor..." value={nuevoRecordatorio} onChange={(e) => setNuevoRecordatorio(e.target.value)}
                className="flex-1 bg-black/40 border border-purple-500/20 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-amber-500/50"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-6 rounded-2xl transition-colors font-bold flex items-center gap-2">
                <Send className="w-5 h-5" /> Enviar
              </button>
            </form>

            <div className="space-y-3">
              {recordatorios.length === 0 ? (
                <p className="text-sm text-purple-400/50 italic text-center py-10">No hay avisos pendientes 🐾</p>
              ) : (
                recordatorios.map(rec => (
                  <div key={rec.id} className={`flex items-center justify-between p-4 rounded-2xl border ${rec.completado ? 'bg-emerald-900/10 border-emerald-500/20 opacity-50' : 'bg-black/30 border-amber-500/20'}`}>
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleRecordatorio(rec.id, rec.completado)}>
                      {rec.completado ? <CheckSquare className="w-6 h-6 text-emerald-400" /> : <Square className="w-6 h-6 text-amber-400" />}
                      <div>
                        <p className={`text-base ${rec.completado ? 'line-through text-emerald-200' : 'text-white font-bold'}`}>{rec.texto}</p>
                        <p className="text-[10px] text-amber-400/80 uppercase mt-1">Enviado por {rec.usuario} • {new Date(rec.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => eliminarRecordatorio(rec.id)} className="text-rose-400/50 hover:text-rose-400 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "calculadora":
        return (
          <div className="bg-[#1a0f2e] border border-purple-500/30 p-6 rounded-[2rem] shadow-xl max-w-md mx-auto mt-10">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 justify-center">
              <Calculator className="w-6 h-6 text-purple-400" /> Calculadora de Compras
            </h2>

            <div className="space-y-6">
              <div className="bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                <label className="text-[10px] uppercase text-purple-400 font-bold tracking-widest block mb-2">Ingresa el Monto</label>
                <div className="flex gap-3">
                  <input 
                    type="number" step="0.01" placeholder="0.00" value={calcMonto} onChange={(e) => setCalcMonto(e.target.value)}
                    className="flex-1 bg-transparent text-3xl font-black text-white outline-none font-mono"
                  />
                  <select 
                    value={calcMoneda} onChange={(e) => setCalcMoneda(e.target.value)}
                    className="bg-[#1a0f2e] border border-purple-500/50 rounded-xl px-3 text-sm text-white font-bold outline-none"
                  >
                    <option value="bs">BS</option>
                    <option value="usd">USD (BCV)</option>
                    <option value="usdt">USDT (Paralelo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-900/20 p-4 rounded-2xl border border-purple-500/10 text-center">
                  <p className="text-[10px] uppercase text-purple-400 font-bold mb-1">Equivalencia BCV</p>
                  <p className="text-xl font-black text-white font-mono">
                    {calcMoneda === 'usd' ? `Bs. ${(parseFloat(calcMonto || "0") * rates.bcv).toFixed(2)}` : `$ ${calcularMontos(parseFloat(calcMonto || "0"), calcMoneda).monto_usd_bcv.toFixed(2)}`}
                  </p>
                </div>
                <div className="bg-purple-900/20 p-4 rounded-2xl border border-purple-500/10 text-center">
                  <p className="text-[10px] uppercase text-purple-400 font-bold mb-1">Equivalencia USDT</p>
                  <p className="text-xl font-black text-white font-mono">
                    {calcMoneda === 'usdt' ? `Bs. ${(parseFloat(calcMonto || "0") * rates.usdt).toFixed(2)}` : `$ ${calcularMontos(parseFloat(calcMonto || "0"), calcMoneda).monto_usd_paralelo.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0714] text-purple-50 p-3 md:p-8 font-sans pb-24 md:pb-8 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* HEADER TASAS (Siempre visible) */}
        <div className="flex items-center justify-between bg-[#1a0f2e] p-3 md:p-5 rounded-[2rem] md:rounded-3xl border border-purple-500/30 shadow-2xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-yellow-400 w-10 h-10 md:w-auto md:h-auto md:p-3 flex items-center justify-center rounded-2xl shadow-lg text-2xl md:text-3xl">🐥</div>
            <div>
              <h1 className="text-base md:text-2xl font-black text-white tracking-wide leading-tight">Pollitos Finanzas</h1>
              <p className="text-purple-300 text-[10px] md:text-sm">Control Mari & Víctor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 bg-black/40 p-2 md:p-4 rounded-2xl border border-purple-500/20">
            <div className="text-right md:text-center">
              <p className="text-[8px] md:text-xs uppercase text-purple-400 font-bold mb-0.5 md:mb-1">Tasa BCV</p>
              <p className="font-mono text-xs md:text-xl text-white">Bs. {rates.bcv.toFixed(2)}</p>
            </div>
            <div className="h-6 md:h-10 w-px bg-purple-500/30"></div>
            <div className="text-left md:text-center">
              <p className="text-[8px] md:text-xs uppercase text-purple-400 font-bold mb-0.5 md:mb-1">Tasa Paralelo</p>
              <p className="font-mono text-xs md:text-xl text-white">Bs. {rates.usdt.toFixed(2)}</p>
            </div>
            <button onClick={fetchRates} disabled={syncing} className="ml-1 md:ml-2 bg-purple-600/20 hover:bg-purple-600 p-1.5 md:p-2 rounded-xl transition-all">
              <RefreshCw className={`w-3.5 h-3.5 md:w-5 md:h-5 text-purple-300 ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL DINÁMICO */}
        {renderTabContent()}

      </div>

      {/* BARRA DE NAVEGACIÓN INFERIOR (Estilo App Nativa) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a0f2e]/90 backdrop-blur-xl border-t border-purple-500/20 p-3 md:hidden z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
          <NavButton icon={<CreditCard />} label="Pagos" active={activeTab === 'pagos'} onClick={() => setActiveTab('pagos')} />
          <NavButton icon={<StickyNote />} label="Avisos" active={activeTab === 'avisos'} onClick={() => setActiveTab('avisos')} />
          <NavButton icon={<Calculator />} label="Calculadora" active={activeTab === 'calculadora'} onClick={() => setActiveTab('calculadora')} />
        </div>
      </nav>

      {/* Navegación para Escritorio */}
      <nav className="hidden md:flex justify-center mt-8 space-x-4">
        <NavButtonDesktop icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
        <NavButtonDesktop icon={<CreditCard />} label="Obligaciones" active={activeTab === 'pagos'} onClick={() => setActiveTab('pagos')} />
        <NavButtonDesktop icon={<StickyNote />} label="Centro de Avisos" active={activeTab === 'avisos'} onClick={() => setActiveTab('avisos')} />
        <NavButtonDesktop icon={<Calculator />} label="Calculadora Rápida" active={activeTab === 'calculadora'} onClick={() => setActiveTab('calculadora')} />
      </nav>

      {/* TOAST NOTIFICACIÓN */}
      {showToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a0f2e] border-2 border-purple-400/50 p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center gap-5 md:gap-6 max-w-md w-full animate-in zoom-in duration-300">
            <div className={`w-16 h-16 md:w-auto md:h-auto md:p-5 flex items-center justify-center rounded-3xl text-4xl md:text-5xl shadow-2xl ${toastType === 'ingreso' ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
              {toastType === 'ingreso' ? '🐥' : '📉'}
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-black text-lg md:text-2xl italic leading-tight">"{mensajeMotivacional}"</p>
              <p className="text-[9px] md:text-xs text-purple-400 font-bold uppercase tracking-[0.2em] pt-3 md:pt-4">Pollitos Finanzas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTES AUXILIARES PARA LA NAVEGACIÓN Y TARJETAS
function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-purple-400 scale-110' : 'text-purple-400/40 hover:text-purple-400/80'}`}>
      <div className={`p-2 rounded-xl ${active ? 'bg-purple-500/20' : ''}`}>{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NavButtonDesktop({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-[#1a0f2e] text-purple-400 border border-purple-500/30 hover:bg-purple-900/30'}`}>
      {icon} {label}
    </button>
  );
}

function CardBalance({ title, amount, icon, color, small = false }: any) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${color} to-[#1a0f2e] border border-purple-500/20 ${small ? 'p-4 rounded-2xl' : 'p-5 md:p-6 rounded-3xl'} shadow-xl flex flex-col justify-between h-full`}>
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <p className={`${small ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-xs'} font-bold text-purple-200 uppercase tracking-widest`}>{title}</p>
        <div className={`${small ? 'w-4 h-4' : ''} text-purple-300/80`}>{icon}</div>
      </div>
      <p className={`${small ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-black ${amount < 0 ? 'text-rose-400' : 'text-white'}`}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}