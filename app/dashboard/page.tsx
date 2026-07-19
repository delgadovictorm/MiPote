"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X, Bell, Send, PieChart as PieChartIcon, Target, Home, CreditCard, Calculator, Lock, Mail, LogIn, UserPlus, Sparkles, ArrowLeft, Shield, Key, Copy, UploadCloud, Phone, Menu, LogOut, Globe, ChevronRight, Loader2,
  DollarSign, TrendingUp, TrendingDown, Rocket, ShoppingCart, Wifi, Dog, Gift, Edit3, ChevronLeft, ArrowRight, ChevronDown, ArrowLeftRight, Layers, Eye, EyeOff, Heart, PartyPopper, ListTodo, MapPin, Landmark
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Drawer } from "vaul";
import { InicioTab } from "@/components/Dashboard/InicioTab";
import { PagosTab } from "@/components/Dashboard/PagosTab";
import { RecordatoriosTab } from "@/components/Dashboard/RecordatoriosTab";
import { EmergenciaTab } from "@/components/Dashboard/EmergenciaTab";
import { CalculadoraTab } from "@/components/Dashboard/CalculadoraTab";
import { MercadoSession } from "@/components/Dashboard/MercadoSession";
import { TASAS_DISPONIBLES, TASAS_DEFECTO, TASAS_STORAGE_KEY, getValorTasa, calcularResultadoTasa, type TasaId } from "@/components/Dashboard/tasasConfig";
import { ESTADOS_VENEZUELA } from "@/lib/venezuelaData";
import OpenAI from "openai";
import { Camera } from "lucide-react"; // Asegúrate de tener este icono
import { motion, AnimatePresence } from "framer-motion"

import { useReactMediaRecorder } from "react-media-recorder-2";
import { TransactionDrawer } from "@/components/TransactionDrawer";
import { TutorialOnboarding } from "@/components/Onboarding/TutorialOnboarding";

// ============================================================================
// CONFIGURACIÓN VISUAL DE GAMIFICACIÓN (ESTILO DUOLINGO/OPAL)
// ============================================================================

const ASSETS_POTES = {
  barro: "/pote-barro.png",
  bronce: "/pote-bronce.png",
  plata: "/pote-plata.png",
  oro: "/pote-oro.png",
  lobo: "/pote-lobo.png",
};

const RECOMPENSAS_RACHA = {
  1: { 
    nombre: "Hábito Iniciado", 
    desc: "¡Felicidades! Tu racha financiera ha comenzado. ¡Sigue así para llegar lejos!", 
    color: "#C2410C", // orange-700
    bgGradient: "from-orange-950/40 to-black"
  },
  3: { 
    nombre: "Consistencia Inicial", 
    desc: "¡Tu constancia te está llevando lejos! ¡Sigue así para mantener el control!", 
    color: "#EA580C", // orange-600
    bgGradient: "from-orange-900/40 to-black"
  },
  7: { 
    nombre: "Semana de Disciplina", 
    desc: "¡Una semana bajo control! Estás demostrando una gran disciplina financiera. ¡Excelente!", 
    color: "#B45309", // amber-700
    bgGradient: "from-amber-950/40 to-black"
  },
  21: { 
    nombre: "Hábito Formado", 
    desc: "¡Hábito formado! Controlar tus finanzas es ahora parte de tu día a día. ¡Excelente trabajo!", 
    color: "#94A3B8", // slate-400
    bgGradient: "from-slate-900/50 to-black"
  },
  50: { 
    nombre: "Dominio Presupuestario", 
    desc: "¡Maestría Presupuestaria! Estás dominando tu presupuesto y futuro financiero. ¡Enhorabuena!", 
    color: "#F59E0B", // amber-500
    bgGradient: "from-yellow-950/50 to-black",
    glow: "shadow-[0_0_60px_rgba(245,158,11,0.35)]"
  },
  100: { 
    nombre: "Consciencia Absoluta", 
    desc: "¡Consciencia Financiera Absoluta! Te has convertido en un verdadero experto en tu dinero. ¡Increíble!", 
    color: "#22D3EE", // cyan-400
    bgGradient: "from-cyan-950/60 to-black",
    glow: "shadow-[0_0_70px_rgba(34,211,238,0.45)]",
    pulse: true
  }
};

// MENSAJES DIARIOS DE RACHA (JERGA VENEZOLANA - 100% ENFOQUE Y MOTIVACIÓN)
// ============================================================================
const MENSAJES_RACHA_DIARIA = [
  // --- BLOQUE 1: COMPROMISO Y ORGANIZACIÓN ---
  "¡Tas activo, mi pana! Cuenta clara conserva la plata y la paz mental.",
  "Mano, organizarse da flojera, pero pelar bola da más. ¡Sigue invicto hoy!",
  "No le dejes tu futuro a la suerte. ¡Tas al mando de tus propios cobres!",
  "El secreto no es cuánto ganas, sino cómo lo organizas. ¡Dale duro!",
  "Cero excusas. Entraste, chequeaste y pusiste orden. ¡Eres un crack!",
  "Tu yo del futuro te va a dar las gracias por la disciplina que metiste hoy.",
  "La plata rinde cuando hay mente clara. ¡Hoy ganaste tú y tu presupuesto!",
  "Ponerle orden a la paca a diario es lo que separa a los duros de los demás.",
  "Querer es poder, pero organizarse es lograr. ¡Vas derechito al éxito!",
  "Cada bolívar y dólar registrado es un parao' a la improvisación. ¡Firme!",
  "Administrar bien no es limitarse, es asegurar el relajo de mañana, mano.",
  "Tas construyendo un imperio bloque por bloque. ¡No le bajes al orden!",
  "Mano, el dinero es una herramienta y hoy demostraste quién es el que manda.",
  "Control total de la liquidez. Que nada te agarre fuera de base, chamo.",
  "El despilfarro se cura con la constancia que tienes hoy. ¡Sigue así!",
  "Pila con los gasticos hormiga. Hoy les pusiste el candado a tiempo.",
  "Llevar las finanzas al día te hace dueño de tus decisiones. ¡No te detengas!",
  "Tu bolsillo necesita estrategia, no milagros. ¡Excelente registro hoy!",
  "Planificar es de cracks. Otro día más dominando el juego del dinero.",
  "Que la quincena no se te vaya como un chisme. ¡Bien jugado hoy, pana!",
  "La tranquilidad financiera no tiene precio. Hoy compraste otro pedazo.",
  "Mucha mente y mucho orden. Así es como se progresa de verdad por aquí.",
  "No gastes lo que no tienes para impresionar a quien no le importas. ¡Firme!",
  "Cada anotación de hoy es un escudo contra la incertidumbre de mañana.",
  "Disciplina pura, mi pana. Estás domando tus finanzas como los grandes.",
  "El orden trae progreso, y tu racha es la prueba viviente de eso. ¡Plomo!",
  "Mano, el que no planifica regala la plata. Tú vas volando con tu plan.",
  "Pilas con las cuentas claras. El mapa lo dibujas tú con cada registro.",
  "Hacer que cada centavo cuente es tremendo superpoder. ¡Tas activo!",
  "Tu constancia es el motor que va a cambiar tu realidad económica. ¡Sigue!",
  "Hoy decidiste no improvisar. Esa es la actitud de los que triunfan, chamo.",
  "El dinero se esfuma si le das la espalda. Tú hoy lo miraste de frente.",
  "La libertad financiera empieza con los registros que haces a diario. ¡Plomo!",

  // --- BLOQUE 2: EL RADAR DEL DÓLAR (PROTECCIÓN DEL PATRIMONIO) ---
  "Mano, el dólar no duerme, pero tu disciplina tampoco. ¡Tas ganando la carrera!",
  "Revisaste la tasa, resguardaste los cobres y sumaste a la racha. ¡Un camión!",
  "Pilas con el paralelo, oficiales y USDT. Monitorear el juego te hace pro.",
  "El dólar vuela, pero tu planificación va más rápido. ¡No te descuadres!",
  "Cada vez que miras el dólar aquí, le pones seriedad a tu esfuerzo, chamo.",
  "Ajustar tus cuentas con el movimiento cambiario: el verdadero arte venezolano.",
  "La inflación aprieta, pero tu orden no afloja ni un milímetro. ¡Mosca ahí!",
  "Ver la tasa te da el mapa; registrar el gasto te da el control absoluto.",
  "Protegiendo el patrimonio a diario. A ti no te agarra la devaluación dormido.",
  "Mano, con esta disciplina le vamos a tener que dar clases al BCV. ¡Sigue así!",
  "Estar pendiente de los monitores te ayuda a estirar los reales como es.",
  "El mercado cambia a diario, pero tu compromiso con proteger tu plata es fijo.",
  "Pilas con el tipo de cambio, pero más pilas con tu presupuesto. ¡Vas sobrao'!",
  "Ahorrar e invertir con cabeza fría es tu mejor escudo en Venezuela.",
  "Chamo, el dólar se mueve, pero tu meta sigue fija en el mismo norte. ¡Pilas!",
  "El que batea en la economía venezolana batea en cualquier liga. ¡Sigue invicto!",
  "Mirar las tasas te mantiene despierto; presupuestar te mantiene libre, pana.",
  "No dejes que el vaivén del mercado te quite el sueño. Tu orden es la respuesta.",
  "Estar un paso adelante del cambio es de gente inteligente. ¡Tas fino!",
  "Cada dólar protegido de la devaluación hoy es una victoria para tu futuro.",
  "Mosca con los precios en la calle. Hoy registraste y aseguraste tu valor.",
  "Mano, el mercado está rudo, pero tu estrategia es más fuerte. ¡Dale con todo!",
  "Saber exactamente cuánto tienes en Bs y en divisas te da el control total.",
  "No le temas a los números de la calle cuando tienes un plan sólido en la app.",
  "Guerra avisada no mata soldado. Al ver tus tasas hoy, blindaste tus cobres.",
  "La economía cambia rápido, pero tu hábito diario es tu mejor garantía.",
  "Ponerle el ojo al dólar y el candado al gasto: jugada maestra del día.",
  "Chamo, tas cuidando tu patrimonio como un verdadero experto. ¡No aflojes!",
  "El dólar sube, pero tu nivel como administrador sube el doble. ¡Tas sobrado!",
  "Hacer valer cada dólar salvado es la meta real en este juego. ¡Activo ahí!",

  // --- BLOQUE 3: MOTIVACIÓN Y VALOR DE LAS METAS (POTES) ---
  "Esa meta no se va a pagar sola, mi pana. ¡Cada día cuenta para coronar!",
  "Tus sueños valen oro, chamo. No dejes que los gusticos locos los desangren.",
  "Echándole pichón al mañana. ¡Ese pote va a reventar de lo gordo!",
  "Tu meta es prioridad. Cada bolívar salvado te acerca más a lo que de verdad importa.",
  "¡Qué molleja de constancia! Con este ritmo vas a comprar tu meta antes de tiempo.",
  "Mano, la racha es el puente de acero entre tus ganas y tus metas. ¡Dale plomo!",
  "Ahorrar con un propósito claro cambia las reglas del juego. ¡Vas a coronar!",
  "Tus potes son sagrados. El esfuerzo que le metes hoy es el relajo de tu mañana.",
  "Esa meta que tienes entre ceja y ceja se lo merece todo. ¡No la dejes morir!",
  "Cada abono o resguardo para tu meta es un frenazo directo a la incertidumbre.",
  "Chamo, qué nota ver que estás remando hacia tus sueños con tanto orden.",
  "Tus metas no son un capricho, son tu próximo nivel de vida. ¡No le bajes!",
  "No dejes que la emoción de un momento te sople los reales de tu meta principal.",
  "Ahorrar con metas es como sembrar: hoy le echas pichón, mañana cosechas sabroso.",
  "Esa meta ya te está guiñando el ojo de lo cerca que está. ¡Mantén la racha!",
  "Qué rico es ver cómo crece tu propio sudor reflejado en tus potes de ahorro.",
  "Trabajar con un norte claro te hace invencible. ¡Fuego con esa meta!",
  "Cada día de racha es un día menos para celebrar que lo lograste, mano.",
  "Tus metas valen cada segundo que pasas planificando y organizando aquí.",
  "Ahorrar es el arte de valorar tu propio trabajo. ¡No regales tus sueños!",
  "Mano, mantén el foco. El pote se llena gotita a gotita, pero sin parar.",
  "No cambies lo que más deseas a largo plazo por un antojo de cinco minutos.",
  "Tu meta no es un imposible, es solo cuestión de tiempo y de esta racha tuya.",
  "Ponerle nombre y monto a tus sueños los hace reales. ¡Hoy los defendiste!",
  "Chamo, ver que te estás moviendo por lo tuyo da tremenda satisfacción. ¡Sigue!",
  "Cada registro te recuerda por qué estás sudando la camiseta. ¡Por esa meta!",
  "El camino es largo, pero con este orden vas a llegar limpiecito a la meta.",
  "Tu pote de ahorros es tu paz mental del mañana. ¡Sigue engordándolo!",
  "No desmayes, pana. Estás invirtiendo en la única persona que lo merece: tú.",
  "Ese sueño grande se divide en días pequeños, y hoy cumpliste con el tuyo.",
  "La racha es el escudo de tus potes. Mientras siga prendida, tus metas están vivas.",
  "¡Plomo con esos objetivos! Estás demostrando que juegas para ganar en grande.",
  "Mano, tu racha diaria es la promesa de que sí vas a lograr todo lo que te propongas.",
  "Tus metas son la recompensa de tu disciplina. ¡Sigue sumando días como un pro!"
];

// ============================================================================
// APP PRINCIPAL
// ============================================================================
export default function MiPoteApp() {
  const [session, setSession] = useState(null as any);
  const [perfil, setPerfil] = useState(null as any); 
  const [isPro, setIsPro] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState('auth'); 

  // Estado para controlar la animación a pantalla completa de Duolingo
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null as any);
  
  const [authStage, setAuthStage] = useState('welcome' as 'welcome'|'login'|'reg1'|'reg2'|'loading'|'forgot'|'reset');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regEstado, setRegEstado] = useState("");
  const [regMunicipio, setRegMunicipio] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const [espacios, setEspacios] = useState([] as any[]);
  const [espacioActivo, setEspacioActivo] = useState(null as any);
  const [isGuest, setIsGuest] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (currentView === 'dashboard') {
      try {
        if (!localStorage.getItem('mipote_tutorial_visto')) setShowTutorial(true);
      } catch {}
    }
  }, [currentView]);


  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");

  const [checkoutPaso, setCheckoutPaso] = useState(1);
  const [metodoPago, setMetodoPago] = useState("pagomovil");
  const [referencia, setReferencia] = useState("");
  const [archivo, setArchivo] = useState(null as File | null);
  const [enviandoPago, setEnviandoPago] = useState(false);
  const [tasaCheckout, setTasaCheckout] = useState(45.00);

  // --- BLOQUEO ANTI DOBLE-CLICK: evita que un tap doble/rápido dispare un registro duplicado ---
  const isMutatingRef = React.useRef(false);
  const conUnSoloClick = <T extends (...args: any[]) => any>(fn: T): T => {
    return (async (...args: Parameters<T>) => {
      const posibleEvento = args[0] as any;
      if (posibleEvento && typeof posibleEvento.preventDefault === 'function') posibleEvento.preventDefault();
      if (isMutatingRef.current) return;
      isMutatingRef.current = true;
      try {
        return await fn(...args);
      } finally {
        isMutatingRef.current = false;
      }
    }) as T;
  };

const abrirCelebracionManual = () => {
    if (!perfil) return;
    
    // Buscamos los datos en tiempo real
    const hitos = Object.keys(RECOMPENSAS_RACHA).map(Number).sort((a, b) => b - a);
    const hitoActual = hitos.find(h => (perfil.racha_actual || 0) >= h) || 1;
    const rangoVisual = RECOMPENSAS_RACHA[hitoActual as keyof typeof RECOMPENSAS_RACHA];
    
    // Elegimos el mensaje basado en la racha actual
    const racha = perfil.racha_actual || 0;
    const mensajeDiario = MENSAJES_RACHA_DIARIA[(racha - 1) % MENSAJES_RACHA_DIARIA.length];

    setCelebrationData({
      dias: racha,
      recompensa: {
        ...rangoVisual,
        desc: mensajeDiario
      }
    });

    setShowStreakCelebration(true);
  };


  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsGuest(false);
        cargarDatosUsuario(session.user.id).then(() => setCurrentView('dashboard'));
      } else {
        setLoadingAuth(false);
        setCurrentView('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setLoadingAuth(false);
        setCurrentView('auth');
        setAuthStage('reset');
        return;
      }
      setSession(session);
      if (session) {
        // Si veníamos del Modo Invitado, hay que apagarlo: si no, la vista sigue
        // leyendo transacciones/potes de localStorage en vez de los datos reales del usuario.
        setIsGuest(false);
        cargarDatosUsuario(session.user.id).then(() => setCurrentView('dashboard'));
      } else {
        setLoadingAuth(false);
        setCurrentView('auth');
      }
    });

    // Tasa BCV para el checkout PRO (Bs. a tasa oficial) - se refresca sola cada minuto
    const cargarTasaCheckout = () => {
      fetch("/api/rates").then(res => res.json()).then(data => { if (data.success && data.bcv) setTasaCheckout(data.bcv); });
    };
    cargarTasaCheckout();
    const intervalTasaCheckout = setInterval(cargarTasaCheckout, 60000);

    return () => { subscription.unsubscribe(); clearInterval(intervalTasaCheckout); };
  }, []);

  const cargarDatosUsuario = async (userId: string) => {
    // OJO: no hacemos setPerfil(null) aquí. Esta función se vuelve a llamar cada vez que
    // Supabase revalida la sesión (ej. al reabrir la app), y poner perfil en null por un
    // instante hacía que la UI creyera brevemente que el usuario ya no era PRO.

    let { data: perfilBd } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (!perfilBd) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newPerfil } = await supabase.from('perfiles').insert([{ id: userId, is_pro: false, estado_pago: 'gratis', email: user?.email }]).select().single();
      perfilBd = newPerfil;
    }

    // --- MOTOR DE RACHAS FINANCIERAS ---
    const hoyStr = new Date().toISOString().slice(0, 10);
    const ultimaConexionStr = perfilBd.ultima_conexion;
    let nuevaRacha = perfilBd.racha_actual || 0;
    let nuevaRachaMax = perfilBd.racha_maxima || 0;

    if (!ultimaConexionStr) {
      nuevaRacha = 1; nuevaRachaMax = 1;
    } else {
      const fechaHoy = new Date(hoyStr);
      const fechaUltima = new Date(ultimaConexionStr);
      const diferenciaDias = Math.floor((fechaHoy.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24));

      if (diferenciaDias === 1) {
        nuevaRacha += 1;
        if (nuevaRacha > nuevaRachaMax) nuevaRachaMax = nuevaRacha;
      } else if (diferenciaDias > 1) {
        nuevaRacha = 1; // Racha rota
      }
    }

  // Actualizar BD silenciosamente si cambió el día
    if (ultimaConexionStr !== hoyStr) {
      // OJO: hay que guardar la racha ANTES de pisar perfilBd.racha_actual con el valor nuevo,
      // si no la comparación de abajo queda comparando nuevaRacha contra sí misma y nunca dispara.
      const rachaAnterior = perfilBd.racha_actual || 0;

      await supabase.from('perfiles').update({
        racha_actual: nuevaRacha, racha_maxima: nuevaRachaMax, ultima_conexion: hoyStr
      }).eq('id', userId);

      perfilBd.racha_actual = nuevaRacha;
      perfilBd.racha_maxima = nuevaRachaMax;
      perfilBd.ultima_conexion = hoyStr;

    ///🟢 GATILLO DE ANIMACIÓN DIARIA (PANTALLA COMPLETA)
      // Solo celebramos si la racha subió respecto al día anterior; si se rompió (se reinició a 1
      // viniendo de un número mayor), esta condición da falso y no se muestra nada.
      if (nuevaRacha > rachaAnterior) {
        
        // 1. Buscamos qué color/brillo le toca según su rango (1, 3, 7, 21...)
        const hitos = Object.keys(RECOMPENSAS_RACHA).map(Number).sort((a, b) => b - a);
        const hitoActual = hitos.find(h => nuevaRacha >= h) || 1;
        const rangoVisual = RECOMPENSAS_RACHA[hitoActual as keyof typeof RECOMPENSAS_RACHA];

        // 2. Elegimos un mensaje rotativo de nuestra jerga venezolana
        const mensajeDiario = MENSAJES_RACHA_DIARIA[(nuevaRacha - 1) % MENSAJES_RACHA_DIARIA.length];

        setCelebrationData({
          dias: nuevaRacha,
          recompensa: {
            ...rangoVisual,
            desc: mensajeDiario // Reemplazamos la descripción seria por la jerga
          }
        });
        
        // Pequeño delay para que cargue el dashboard de fondo y luego ¡BAM!
        setTimeout(() => setShowStreakCelebration(true), 1200); 
      }
    }
    // ------------------------------------

    setIsPro(perfilBd?.is_pro || false);
    setPerfil(perfilBd);

    // Carga de espacios (se mantiene igual...)
    const { data: espaciosData } = await supabase.from('espacios').select('*, espacio_miembros!inner(usuario_id)').eq('espacio_miembros.usuario_id', userId);
    
    if (espaciosData && espaciosData.length > 0) {
      const espaciosCorregidos = await Promise.all(espaciosData.map(async (e) => {
        if (e.tipo !== 'individual' && !e.codigo_invitacion) {
           const nuevoCodigo = generarCodigo();
           await supabase.from('espacios').update({ codigo_invitacion: nuevoCodigo }).eq('id', e.id);
           return { ...e, codigo_invitacion: nuevoCodigo };
        }
        return e;
      }));
      setEspacios(espaciosCorregidos);
      
      const lastSpaceId = localStorage.getItem('mipote_last_space');
      let spaceToSet = espaciosCorregidos.find(e => e.id === lastSpaceId);
      if (!spaceToSet) spaceToSet = espaciosCorregidos.find(e => e.tipo === 'individual');
      if (!spaceToSet) spaceToSet = espaciosCorregidos[0];
      
      setEspacioActivo(spaceToSet);
    } else {
      setEspacios([]);
    }
    
    setLoadingAuth(false);
  };

  const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleLoginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoadingAuth(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); setLoadingAuth(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email.trim()) { setAuthError("Ingresa tu correo electrónico."); return; }
    setLoadingAuth(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    setLoadingAuth(false);
    if (error) setAuthError(error.message);
    else setResetSent(true);
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (newPassword.length < 6) { setAuthError("La contraseña debe tener al menos 6 caracteres."); return; }
    setResettingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setResettingPassword(false);
    if (error) { setAuthError(error.message); return; }
    setNewPassword("");
    alert("✅ Contraseña actualizada con éxito.");
    setCurrentView('dashboard');
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!telefono || !regNombre || !regEstado || !regMunicipio) { setAuthError("Completa todos los campos"); return; }

    setAuthStage('loading');

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      setAuthStage('reg2');
      return;
    }

    if (data.user) {
      await supabase.from('perfiles').insert([{ id: data.user.id, email: data.user.email, telefono: telefono, nombre: regNombre, estado: regEstado, municipio: regMunicipio, is_pro: false, estado_pago: 'gratis' }]);
      const { data: newSpace } = await supabase.from('espacios').insert([{ nombre: 'Mi Billetera', tipo: 'individual', creador_id: data.user.id }]).select().single();
      if (newSpace) await supabase.from('espacio_miembros').insert([{ espacio_id: newSpace.id, usuario_id: data.user.id, rol: 'admin' }]);
      
      setTimeout(() => {
         setCurrentView('dashboard');
      }, 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    setEspacioActivo(null); 
    setEspacios([]); 
    setIsGuest(false); 
    setIsPro(false); 
    setPerfil(null); 
    setAuthStage('welcome');
    setCurrentView('auth');
  };

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !session.user) return;
    
    const { error } = await supabase.from('perfiles').update({ nombre: editNombre }).eq('id', session.user.id);
    if (error) alert("Error al guardar: " + error.message);
    else {
      setPerfil({ ...perfil, nombre: editNombre });
      setShowProfileModal(false);
      alert("✅ Nombre actualizado correctamente.");
    }
  };

  // Comprime la captura antes de subirla (las fotos de cámara pesan varios MB y hacían el reporte lento).
  const comprimirImagen = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1000;
          const scale = Math.min(1, MAX_WIDTH / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo comprimir la imagen")), 'image/jpeg', 0.7);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const procesarPagoPRO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !session.user) return alert("Debes iniciar sesión para pagar.");
    if (!archivo) return alert("Por favor sube la captura de pantalla del pago.");

    setEnviandoPago(true);
    const formData = new FormData();
    try {
      const comprimida = await comprimirImagen(archivo);
      formData.append("photo", comprimida, "comprobante.jpg");
    } catch {
      formData.append("photo", archivo);
    }

    const ordenNumero = (200000 + (parseInt(session.user.id.substring(0, 4), 16) % 90000)).toString();
    const mensaje = `💰 *NUEVO REPORTE DE PAGO MI POTE*\n\n📧 *Usuario:* ${session.user.email}\n🔢 *Orden:* #${ordenNumero}\n💳 *Método:* ${metodoPago.toUpperCase()}\n🧾 *Ref:* ${referencia}\n💲 *Monto:* $2\n\n_Acción: Revisa el panel Admin para aprobar._`;
    formData.append("caption", mensaje);

    try {
      const res = await fetch("/api/pagos", { method: "POST", body: formData });
      if (res.ok) {
        await supabase.from('perfiles').update({ estado_pago: 'pendiente' }).eq('id', session.user.id);
        setPerfil({...perfil, estado_pago: 'pendiente'});
        setCheckoutPaso(3);
      } else {
        alert("Error al enviar el comprobante a Telegram.");
      }
    } catch (err) {
      alert("Error de conexión con la pasarela.");
    }
    setEnviandoPago(false);
  };

  const unirseConCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setLoadingAuth(true);
    const { data: spaceFound } = await supabase.from('espacios').select('*').eq('codigo_invitacion', joinCode.trim().toUpperCase()).single();
    
    if (!spaceFound) {
      alert("❌ Código inválido o espacio no encontrado.");
    } else {
      const yaEsMiembro = espacios.find(e => e.id === spaceFound.id);
      if (yaEsMiembro) {
        alert("Ya eres miembro de este espacio.");
      } else {
        const { count } = await supabase.from('espacio_miembros').select('*', { count: 'exact', head: true }).eq('espacio_id', spaceFound.id);
        
     

        await supabase.from('espacio_miembros').insert([{ espacio_id: spaceFound.id, usuario_id: session.user.id, rol: 'miembro' }]);
        await supabase.from('participantes').insert([{ nombre: (perfil?.nombre || session.user.email.split('@')[0]), espacio_id: spaceFound.id }]);
        
        await cargarDatosUsuario(session.user.id);
        setShowJoinModal(false);
        setJoinCode("");
        setCurrentView('dashboard');
        alert("✅ ¡Te has unido exitosamente al espacio!");
      }
    }
    setLoadingAuth(false);
  };

  const seleccionarModulo = async (tipoModulo: string, eId?: string, opts?: { nombre?: string; monto_objetivo?: number }) => {
    if (!session) {
      if (tipoModulo === 'individual') {
        setIsGuest(true);
        setEspacioActivo({ id: 'guest', nombre: 'Mi Billetera', tipo: 'individual' });
        setCurrentView('dashboard');
      } else {
        setShowPaywall(true);
      }
      return;
    }

    setIsGuest(false);

    // Si pasamos 'NEW', obligamos a crear uno de cero
    if (eId === 'NEW') {
      const titulos: Record<string, string> = { 'pote': 'Nuevo Pote', 'vaca': 'Nueva Vaca' };
      const { data: newSpace } = await supabase.from('espacios').insert([{
        nombre: opts?.nombre?.trim() || titulos[tipoModulo],
        tipo: tipoModulo,
        creador_id: session.user.id,
        codigo_invitacion: generarCodigo()
      }]).select().single();

      if (newSpace) {
        await supabase.from('espacio_miembros').insert([{ espacio_id: newSpace.id, usuario_id: session.user.id, rol: 'admin' }]);
        // El creador entra como participante automáticamente (igual que quien se une por código),
        // así el Pote/Vaca arranca con al menos un miembro sin pasos manuales.
        await supabase.from('participantes').insert([{ nombre: (perfil?.nombre || session.user.email.split('@')[0]), espacio_id: newSpace.id }]);
        // Una Vaca es un plan con una sola meta: la reunimos desde el arranque para que la billetera se construya en función de ella.
        if (tipoModulo === 'vaca' && opts?.monto_objetivo && opts.monto_objetivo > 0) {
          await supabase.from('metas').insert([{ nombre: newSpace.nombre, monto_objetivo: opts.monto_objetivo, espacio_id: newSpace.id }]);
        }
        await cargarDatosUsuario(session.user.id);
        setEspacioActivo(newSpace);
        localStorage.setItem('mipote_last_space', newSpace.id);
        setCurrentView('dashboard');
      }
      return;
    }

    // Lógica normal de selección
    let espacioEncontrado = eId ? espacios.find(e => e.id === eId) : espacios.find(e => e.tipo === tipoModulo);
    
    if (espacioEncontrado) {
      setEspacioActivo(espacioEncontrado);
      localStorage.setItem('mipote_last_space', espacioEncontrado.id);
      setCurrentView('dashboard');
    }
  };

  if (loadingAuth) return ( <div className="min-h-screen bg-[#0d0714] flex items-center justify-center" suppressHydrationWarning><Loader2 className="w-8 h-8 text-purple-500 animate-spin"/></div> );

  if (currentView === 'auth') {
    if (authStage === 'welcome') {
      return (
        <div className="min-h-screen bg-[#0d0714] flex flex-col relative overflow-hidden animate-in fade-in duration-500">
           <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
           <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

           <div className="flex-1 flex flex-col justify-end p-8 z-10 relative mb-10 max-w-md mx-auto w-full">
              <div className="flex justify-center mb-10">
                 <div className="relative">
                    <div className="absolute inset-0 bg-fuchsia-500/30 blur-[40px] rounded-full animate-pulse"></div>
                    <img src="/pote.png" alt="Mi Pote" className="w-40 h-40 object-contain relative z-10 drop-shadow-[0_0_35px_rgba(192,38,211,0.5)] hover:scale-105 transition-transform" />
                 </div>
              </div>
              <h1 className="text-[40px] md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                Domina <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">tus finanzas.</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base mb-10 max-w-sm">
                Cuentas claras conservan amistades (y parejas). Organiza, divide y ahorra sin estrés.
              </p>
              
              <div className="space-y-4">
                <button onClick={() => setAuthStage('reg1')} className="w-full bg-white text-black font-black py-4 rounded-2xl text-base shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all">Comenzar ahora</button>
                <button onClick={() => setAuthStage('login')} className="w-full bg-[#1a0f2e] border border-white/10 text-white font-bold py-4 rounded-2xl text-base hover:bg-white/5 active:scale-95 transition-all">Ya tengo cuenta</button>
              </div>
              <button onClick={() => { setIsGuest(true); setCurrentView('dashboard'); setEspacioActivo({ id: 'guest', nombre: 'Mi Billetera', tipo: 'individual' }); }} className="mt-8 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto active:scale-95 transition-transform">
                <Sparkles className="w-4 h-4"/> Entrar como Invitado
              </button>
           </div>
        </div>
      );
    }

    if (authStage === 'login') {
       return (
        <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
           <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
              <button onClick={() => setAuthStage('welcome')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white mb-8 transition-colors"><ArrowLeft className="w-5 h-5"/></button>
              <h2 className="text-3xl font-black text-white mb-2">Bienvenido de vuelta</h2>
              <p className="text-white/50 text-sm mb-10">Ingresa tus datos para continuar</p>

              <form onSubmit={conUnSoloClick(handleLoginUser)} className="space-y-5 flex-1">
                {authError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{authError}</p>}
                <div>
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                  <button type="button" onClick={() => { setAuthError(""); setResetSent(false); setAuthStage('forgot'); }} className="text-purple-400 text-xs font-bold mt-3 hover:text-purple-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="pt-8">
                  <button type="submit" className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    Iniciar Sesión <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </form>
           </div>
        </div>
       );
    }

    if (authStage === 'forgot') {
      return (
        <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
           <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
              <button onClick={() => setAuthStage('login')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white mb-8 transition-colors"><ArrowLeft className="w-5 h-5"/></button>

              {resetSent ? (
                <div className="py-8 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-10 h-10 text-emerald-400" /></div>
                  <h3 className="text-2xl font-black text-white mb-2">Revisa tu correo</h3>
                  <p className="text-white/50 text-sm mb-6">Te enviamos un enlace a <span className="text-white font-bold">{email}</span> para restablecer tu contraseña.</p>
                  <button onClick={() => setAuthStage('login')} className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all">Volver a iniciar sesión</button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2">¿Olvidaste tu contraseña?</h2>
                  <p className="text-white/50 text-sm mb-10">Ingresa tu correo y te enviamos un enlace para restablecerla.</p>

                  <form onSubmit={conUnSoloClick(handleForgotPassword)} className="space-y-5 flex-1">
                    {authError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{authError}</p>}
                    <div>
                      <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                      </div>
                    </div>
                    <div className="pt-8">
                      <button type="submit" disabled={loadingAuth} className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                        {loadingAuth ? "Enviando..." : "Enviar enlace"} <ChevronRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </form>
                </>
              )}
           </div>
        </div>
      );
    }

    if (authStage === 'reset') {
      return (
        <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
           <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
              <h2 className="text-3xl font-black text-white mb-2">Nueva contraseña</h2>
              <p className="text-white/50 text-sm mb-10">Escribe tu nueva contraseña para tu cuenta.</p>

              <form onSubmit={conUnSoloClick(handleSetNewPassword)} className="space-y-5 flex-1">
                {authError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{authError}</p>}
                <div>
                  <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>
                <div className="pt-8">
                  <button type="submit" disabled={resettingPassword} className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                    {resettingPassword ? "Guardando..." : "Guardar contraseña"} <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </form>
           </div>
        </div>
      );
    }

    if (authStage === 'reg1') {
      return (
       <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
             <div className="flex items-center justify-between mb-8">
               <button onClick={() => setAuthStage('welcome')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></button>
               <div className="flex gap-2">
                  <div className="h-1.5 w-8 bg-purple-500 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-white/10 rounded-full"></div>
               </div>
               <div className="w-10"></div>
             </div>
             
             <h2 className="text-3xl font-black text-white mb-2">Crea tu cuenta</h2>
             <p className="text-white/50 text-sm mb-10">Ingresa tu correo y crea una contraseña segura</p>

             <form onSubmit={(e) => { e.preventDefault(); setAuthStage('reg2'); }} className="space-y-5 flex-1">
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Correo Electrónico</label>
                 <div className="relative">
                   <Mail className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Contraseña</label>
                 <div className="relative">
                   <Lock className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                   <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                     {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                   </button>
                 </div>
               </div>
               <div className="pt-8">
                 <button type="submit" className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                   Siguiente <ChevronRight className="w-4 h-4"/>
                 </button>
               </div>
             </form>
          </div>
       </div>
      );
    }

    if (authStage === 'reg2') {
      return (
       <div className="min-h-screen bg-[#0d0714] flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col pt-10">
             <div className="flex items-center justify-between mb-8">
               <button onClick={() => setAuthStage('reg1')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5"/></button>
               <div className="flex gap-2">
                  <div className="h-1.5 w-8 bg-purple-500 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-purple-500 rounded-full"></div>
               </div>
               <div className="w-10"></div>
             </div>
             
             <h2 className="text-3xl font-black text-white mb-2">Información personal</h2>
             <p className="text-white/50 text-sm mb-10">¿Cómo quieres que te llamen en tus potes?</p>

             <form onSubmit={conUnSoloClick(handleRegisterUser)} className="space-y-5 flex-1">
               {authError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{authError}</p>}
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Nombre o Apodo</label>
                 <div className="relative">
                   <UserPlus className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="Ej: Pedro Peréz" value={regNombre} onChange={e => setRegNombre(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">WhatsApp (Teléfono)</label>
                 <div className="relative">
                   <Phone className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input type="tel" placeholder="Ej: 04121234567" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Estado</label>
                 <div className="relative">
                   <MapPin className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                   <select
                     value={regEstado}
                     onChange={e => { setRegEstado(e.target.value); setRegMunicipio(""); }}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                     required
                   >
                     <option value="" className="bg-[#1a0f2e]">Selecciona tu estado...</option>
                     {ESTADOS_VENEZUELA.map(e => (
                       <option key={e.estado} value={e.estado} className="bg-[#1a0f2e]">{e.estado}</option>
                     ))}
                   </select>
                 </div>
               </div>
               <div>
                 <label className="text-[10px] text-white/50 uppercase font-bold tracking-widest pl-1 mb-2 block">Municipio</label>
                 <div className="relative">
                   <MapPin className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                   <select
                     value={regMunicipio}
                     onChange={e => setRegMunicipio(e.target.value)}
                     disabled={!regEstado}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                     required
                   >
                     <option value="" className="bg-[#1a0f2e]">{regEstado ? "Selecciona tu municipio..." : "Primero elige un estado"}</option>
                     {ESTADOS_VENEZUELA.find(e => e.estado === regEstado)?.municipios.map(m => (
                       <option key={m} value={m} className="bg-[#1a0f2e]">{m}</option>
                     ))}
                   </select>
                 </div>
               </div>
               <div className="pt-8">
                 <button type="submit" className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                   Finalizar Registro <Check className="w-4 h-4"/>
                 </button>
               </div>
             </form>
          </div>
       </div>
      );
    }

    if (authStage === 'loading') {
      return (
        <div className="min-h-screen bg-[#0d0714] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500/30 blur-[30px] rounded-full animate-pulse"></div>
              <img src="/pote.png" alt="Mi Pote" className="w-24 h-24 object-contain relative z-10 animate-bounce" />
           </div>
           <h2 className="text-2xl font-black text-white mb-2">Armando tu Pote...</h2>
           <p className="text-white/50 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Ya casi estamos listos</p>
        </div>
      );
    }
  }

  if (currentView === 'calculadora-libre') {
    return (
      // 🔴 FIJADO: Agregamos fixed, inset-0 y overflow-y-auto para forzar el scroll 🔴
      <div 
        className="fixed inset-0 w-full h-[100dvh] bg-[#0d0714] overflow-y-auto overflow-x-hidden flex flex-col items-center p-0 md:p-4 scroll-smooth" 
        style={{ pointerEvents: 'auto' }}
      >

        {/* Eliminamos el botón "Volver" viejo porque la nueva calculadora ya trae el suyo */}
        <div className="w-full max-w-5xl relative">
          <FinanzasDashboardContent 
            session={session} 
            espacios={espacios} 
            setEspacios={setEspacios} 
            espacioActivo={espacioActivo} 
            setEspacioActivo={setEspacioActivo} 
            onSelectModule={seleccionarModulo} 
            handleLogout={handleLogout} 
            openJoinModal={() => setShowJoinModal(true)} 
            openProfileModal={() => setShowProfileModal(true)} 
            isGuest={isGuest} 
            perfil={perfil} 
            forceTab="calculadora" 
            onChangeView={setCurrentView} 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full h-[100dvh] bg-[#0d0714] overflow-y-auto overflow-x-hidden flex flex-col items-center p-0 md:p-4 scroll-smooth" 
      style={{ pointerEvents: 'auto' }}
    >
      {/* MODAL INGRESAR CÓDIGO */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={conUnSoloClick(unirseConCodigo)} className="bg-[#1a0f2e] border border-blue-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] max-w-sm w-full text-center relative">
            <button type="button" onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20"><Key className="w-8 h-8 text-blue-400" /></div>
            <h3 className="text-xl font-black text-white mb-2">Unirse a un Espacio</h3>
            <p className="text-sm text-blue-300 mb-6">Ingresa el código de invitación que te compartió tu pareja o amigo.</p>
            <input type="text" value={joinCode} onChange={(e)=>setJoinCode(e.target.value.toUpperCase())} placeholder="EJ: X7K9P2" className="w-full bg-black/50 border border-blue-500/30 rounded-xl p-4 text-center text-xl font-bold text-white mb-4 outline-none focus:border-blue-400 uppercase tracking-widest tabular-nums font-sans" required maxLength={6} />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">VERIFICAR CÓDIGO</button>
          </form>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={conUnSoloClick(guardarPerfil)} className="bg-[#1a0f2e] border border-purple-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.2)] max-w-sm w-full text-center relative">
            <button type="button" onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20"><UserPlus className="w-8 h-8 text-purple-400" /></div>
            <h3 className="text-xl font-black text-white mb-2">Tu Perfil</h3>
            <p className="text-sm text-purple-300 mb-6">¿Cómo quieres que te llamen en tus potes y vacas?</p>
            <input type="text" value={editNombre} onChange={(e)=>setEditNombre(e.target.value)} placeholder="Ej: Pedro Peréz" className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-4 text-center text-lg font-bold text-white mb-4 outline-none focus:border-purple-400" required />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">GUARDAR NOMBRE</button>
          </form>
        </div>
      )}

      {/* EL MODAL DEL PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-[#1a0f2e] border border-amber-500/50 p-6 md:p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-md w-full text-center relative my-8">
            <button onClick={() => {setShowPaywall(false); setCheckoutPaso(1);}} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6"/></button>
            
            {!session ? (
              <>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Sparkles className="w-8 h-8 text-amber-400" /></div>
                <h3 className="text-xl font-black text-white mb-2">Desbloquea Mi Pote PRO</h3>
                <p className="text-sm text-white/70 mb-6">Crea una cuenta para pagar tu suscripción ($2/mes) y desbloquear Potes en pareja/familia, Vacas entre amigos y Hacer Mercado.</p>
                <button onClick={() => {setShowPaywall(false); setCurrentView('auth');}} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3.5 rounded-xl shadow-lg mb-3 hover:scale-105 transition-transform">CREAR CUENTA GRATIS</button>
              </>
            ) : perfil?.estado_pago === 'pendiente' ? (
               <div className="py-8">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><RefreshCw className="w-10 h-10 text-blue-400" /></div>
                 <h3 className="text-2xl font-black text-white mb-2">Pago en Revisión</h3>
                 <p className="text-blue-200 text-sm">Ya enviamos tu pago. Un administrador lo aprobará pronto y se te habilitará el acceso.</p>
               </div>
            ) : checkoutPaso === 1 ? (
              <div className="text-left">
                <div className="flex items-center justify-between mb-5">
                  <span className="bg-amber-500/15 text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-500/30">Mi Pote Pro</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$2</span>
                    <span className="text-white/40 text-xs font-bold">/mes</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white mb-4">Todo lo que desbloqueas</h3>

                <div className="space-y-2 mb-6">
                  {[
                    { icon: <Heart className="w-4 h-4 text-fuchsia-400" />, bg: "bg-fuchsia-500/10", label: "Potes compartidos", desc: "Finanzas en pareja o en familia" },
                    { icon: <PartyPopper className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10", label: "Las Vacas", desc: "Planes y metas entre amigos" },
                    { icon: <ShoppingCart className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/10", label: "Hacer Mercado", desc: "Lista de compras en vivo con total al instante" },
                    { icon: <Camera className="w-4 h-4 text-amber-400" />, bg: "bg-amber-500/10", label: "Escaneos con IA ilimitados", desc: "Sin el tope de 15 fotos al mes" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                      <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>{f.icon}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-tight">{f.label}</p>
                        <p className="text-[10px] text-white/40 leading-tight mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={()=>setCheckoutPaso(2)} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-colors active:scale-95 text-sm uppercase tracking-widest">
                  Continuar al pago
                </button>
              </div>
            ) : checkoutPaso === 2 ? (
              <form onSubmit={conUnSoloClick(procesarPagoPRO)} className="text-left space-y-4">
                <h3 className="text-xl font-black text-white text-center mb-4 border-b border-white/10 pb-4">Realizar Pago</h3>
                
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={()=>setMetodoPago('pagomovil')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'pagomovil' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-white/50 border-white/10'}`}>Pago Móvil</button>
                  <button type="button" onClick={()=>setMetodoPago('binance')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'binance' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-white/50 border-white/10'}`}>Binance Pay</button>
                </div>

                <div className="bg-black/50 border border-white/5 p-4 rounded-xl text-sm text-white/80 space-y-2 font-mono">
                  {metodoPago === 'binance' ? (
                    <>
                      <p className="text-[10px] text-amber-400 uppercase font-bold font-sans">Enviar exactamente:</p>
                      <p className="text-2xl font-black text-white font-sans">$2 USDT</p>
                      <p className="mt-2 text-xs font-sans text-white/50">Correo Binance Pay:</p>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded"><span>dmvictorbalboa@gmail.com</span> <Copy className="w-4 h-4 cursor-pointer hover:text-white" onClick={()=>navigator.clipboard.writeText("dmvictorbalboa@gmail.com")}/></div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-blue-400 uppercase font-bold font-sans">Monto a Pagar en Bs (Tasa BCV):</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl font-black text-white font-sans">Bs. {(2 * tasaCheckout).toFixed(2)}</p>
                        <Copy className="w-4 h-4 text-white/40 cursor-pointer hover:text-white shrink-0" onClick={() => navigator.clipboard.writeText((2 * tasaCheckout).toFixed(2))} />
                      </div>
                      <p className="mt-2 text-xs font-sans text-white/50">Datos del Pago Móvil:</p>
                      <div className="bg-white/5 p-3 rounded space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span>📱 Teléfono: <strong>0412-301-6936</strong></span>
                          <Copy className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white shrink-0" onClick={() => navigator.clipboard.writeText("04123016936")} />
                        </div>
                        <p>🏦 Banco: <strong>Bancamiga (0172)</strong></p>
                        <div className="flex items-center justify-between gap-2">
                          <span>🪪 C.I: <strong>27.531.901</strong></span>
                          <Copy className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white shrink-0" onClick={() => navigator.clipboard.writeText("27531901")} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Referencia / Alias</label>
                  <input type="text" required value={referencia} onChange={e=>setReferencia(e.target.value)} placeholder="Ej: Pago de Carlos o 1459" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none mt-1 focus:border-amber-500 transition-colors" />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Capture (Recibo)</label>
                  <label className="flex items-center justify-center w-full bg-black/50 border border-dashed border-white/20 rounded-xl p-4 cursor-pointer hover:border-amber-500 mt-1 transition-colors">
                    <input type="file" required accept="image/*" className="hidden" onChange={e => setArchivo(e.target.files?.[0] || null)} />
                    {archivo ? <span className="text-emerald-400 text-xs font-bold flex items-center gap-2"><Check className="w-4 h-4"/> {archivo.name}</span> : <span className="text-white/50 text-xs flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Subir Imagen</span>}
                  </label>
                </div>

                <button type="submit" disabled={enviandoPago} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg mt-6 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {enviandoPago ? 'ENVIANDO REPORTE...' : 'REPORTAR PAGO'}
                </button>
              </form>
            ) : (
               <div className="py-8">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-10 h-10 text-emerald-400" /></div>
                 <h3 className="text-2xl font-black text-white mb-2">¡Pago Enviado!</h3>
                 <p className="text-emerald-200 text-sm mb-6">Estamos verificando tu pago. Te daremos acceso pro en los próximos minutos.</p>
                 <button onClick={()=>{setShowPaywall(false); setCheckoutPaso(1);}} className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all">Entendido</button>
               </div>
            )}
          </div>
       </div>
      )}

      {showTutorial && <TutorialOnboarding onClose={() => setShowTutorial(false)} />}

      {/* 🟢 AQUÍ PONES EL MODAL DE CELEBRACIÓN */}
      <StreakCelebrationModal
        isOpen={showStreakCelebration}
        onClose={() => setShowStreakCelebration(false)}
        dias={celebrationData?.dias}
        recompensa={celebrationData?.recompensa}
      />

      <div className="w-full max-w-5xl relative">
        <FinanzasDashboardContent
          key={`${session?.user?.id || 'guest'}-${espacioActivo?.id || 'none'}`}
          session={session} 
          espacios={espacios}
          setEspacios={setEspacios}
          espacioActivo={espacioActivo} 
          setEspacioActivo={setEspacioActivo}
          onSelectModule={seleccionarModulo}
          handleLogout={handleLogout}
          openJoinModal={() => setShowJoinModal(true)}
          openProfileModal={() => { setEditNombre(perfil?.nombre || session?.user?.email?.split('@')[0]); setShowProfileModal(true); }}
          isGuest={isGuest}
          perfil={perfil}
          onTriggerPaywall={() => setShowPaywall(true)}
          onChangeView={setCurrentView}
          onShowCelebration={(data: any) => { setCelebrationData(data); setShowStreakCelebration(true); }}
        />
      </div>
    </div>
  );
}


// ============================================================================
// 3. DASHBOARD PRINCIPAL - NÚCLEO DINÁMICO
// ============================================================================
function FinanzasDashboardContent({ 
  session, espacios, setEspacioActivo, espacioActivo, onSelectModule, handleLogout, openProfileModal, openJoinModal, isGuest = false, perfil, onTriggerPaywall, forceTab, onChangeView, onShowCelebration // <- AGREGADO AQUÍ AL FINAL
}: any) {
const getTheme = (tipo: string) => {
    switch(tipo) {
      case 'pote': return { primary: 'bg-[#C026D3]', text: 'text-[#E879F9]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#c026d3', lightBg: 'bg-fuchsia-500/10' };
      case 'vaca': return { primary: 'bg-[#059669]', text: 'text-[#34D399]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#059669', lightBg: 'bg-emerald-500/10' };
      default: return { primary: 'bg-[#7C3AED]', text: 'text-[#A78BFA]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#7C3AED', lightBg: 'bg-[#7C3AED]/10' };
    }
  };
  const theme = getTheme(espacioActivo?.tipo || 'individual');

  const getIdentidadEspacio = (tipo: string) => {
    switch (tipo) {
      case 'pote': return { Icono: Heart, etiqueta: 'Pote en pareja/familia' };
      case 'vaca': return { Icono: PartyPopper, etiqueta: 'Vaca grupal' };
      default: return { Icono: Wallet, etiqueta: 'Billetera personal' };
    }
  };
  const identidadEspacio = getIdentidadEspacio(espacioActivo?.tipo || 'individual');


// 1. Calculador de rango visual
  const obtenerRangoActual = (diasRacha: number) => {
    const hitos = Object.keys(RECOMPENSAS_RACHA).map(Number).sort((a, b) => b - a);
    const hitoActual = hitos.find(h => diasRacha >= h) || 1;
    return RECOMPENSAS_RACHA[hitoActual as keyof typeof RECOMPENSAS_RACHA];
  };

  // 2. Registrador de hitos al finalizar un pote
  const registrarMetaCumplida = async (poteId: string) => {
    if (isGuest || !session?.user?.id) return;
    try {
      const nuevoContador = (perfil?.metas_cumplidas || 0) + 1;
      await supabase.from('perfiles').update({ metas_cumplidas: nuevoContador }).eq('id', session.user.id);
      
      const hitoLogrado = RECOMPENSAS_METAS.find(h => h.requeridas === nuevoContador);
      if (hitoLogrado) triggerToast("ingreso", `Logro Desbloqueado: ¡${hitoLogrado.nombre}!`);
      
      await eliminarPote(poteId); // Llama a tu función original para borrar el pote
      triggerToast("ingreso", "¡Felicidades! Meta completada e historial actualizado.");
    } catch (err) {
      console.error(err);
    }
  };
const RECOMPENSAS_METAS = [
  { requeridas: 1, nombre: "Primer Ahorro", desc: "Meta inicial completada" },
  { requeridas: 3, nombre: "Planificador Eficiente", desc: "3 metas ejecutadas con éxito" },
  { requeridas: 10, nombre: "Inversionista Disciplinado", desc: "10 metas fondeadas por completo" }
];

  const eliminarEspacio = async (e: React.MouseEvent, idEspacio: string, tipo: string, nombre: string) => {
    e.stopPropagation();
    const misBilleteras = espacios.filter((esp: any) => esp.tipo === 'individual');
    
    if (tipo === 'individual' && misBilleteras.length <= 1) {
      return alert("🚨 No puedes eliminar tu única billetera principal.");
    }
    
    if (!confirm(`¿Seguro que deseas eliminar "${nombre}"?`)) return;

    await supabase.from('espacios').delete().eq('id', idEspacio);
    alert("✅ Espacio eliminado. Recargando...");
    window.location.reload();
  };

  const eliminarTransaccion = async (id: string) => {
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    if (isGuest) {
      const updatedTx = transactions.filter(t => t.id !== id);
      setTransactions(updatedTx);
      localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
      const { error } = await supabase.from("transacciones_saas").delete().eq("id", id);
      if (error) alert("Error: " + error.message);
    }
  };

  const reiniciarMovimientos = async () => {
    if (!confirm("🚨 Esto borrará TODO el historial de movimientos de este espacio (todos los meses, no solo el actual) y tu Patrimonio Neto quedará en $0.00. Las metas, presupuestos y gastos fijos no se tocan. ¿Deseas continuar?")) return;
    if (!confirm("Última confirmación: esta acción no se puede deshacer. ¿Reiniciar todos los movimientos?")) return;

    if (isGuest) {
      setTransactions([]);
      localStorage.removeItem('mipote_guest_tx');
    } else {
      if (!espacioActivo) return;
      const { error } = await supabase.from("transacciones_saas").delete().eq("espacio_id", espacioActivo.id);
      if (error) { alert("🚨 Error al reiniciar: " + error.message); return; }
      fetchData();
    }
    triggerToast("ingreso", "Movimientos reiniciados. ¡Empecemos de cero! 🔄");
  };

  const [activeTab, setActiveTab] = useState(forceTab || "inicio");
  // 🔴 LLAVE MAESTRA: Quita cualquier bloqueo de Vaul y React al cambiar de pestaña
  useEffect(() => {
    document.body.style.overflow = 'unset';
    document.body.style.pointerEvents = 'auto';
    document.body.removeAttribute('data-scroll-locked');
    document.documentElement.style.overflow = 'unset';
  }, [activeTab]);
  
  // NAV STATES
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isRatesDrawerOpen, setIsRatesDrawerOpen] = useState(false);
  const [isSpacesMenuOpen, setIsSpacesMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('mipote_balance_hidden') === 'true';
  });
  const toggleBalanceHidden = () => {
    setIsBalanceHidden(prev => {
      const next = !prev;
      localStorage.setItem('mipote_balance_hidden', String(next));
      return next;
    });
  };

  const [activeWallet, setActiveWallet] = useState('usdt' as 'usdt'|'bs'|'cash'); 
  const [patrimonioRate, setPatrimonioRate] = useState('paralelo' as 'paralelo' | 'bcv');
  const [filtroHistorial, setFiltroHistorial] = useState("Todos");

  const [rates, setRates] = useState({ bcv: 0, usdt: 0, eur_bcv: 0, eur_paralelo: 0, cop_usd: 0, mxn_usd: 0 });
  const [activeRates, setActiveRates] = useState<TasaId[]>(TASAS_DEFECTO);
  const [showAddTasa, setShowAddTasa] = useState(false);
  const [showAddMonedaLiquidez, setShowAddMonedaLiquidez] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TASAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setActiveRates(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(TASAS_STORAGE_KEY, JSON.stringify(activeRates)); } catch {}
  }, [activeRates]);
  const [transactions, setTransactions] = useState([] as any[]);
  const [cuotasCashea, setCuotasCashea] = useState([] as any[]);
  const [presupuestos, setPresupuestos] = useState([] as any[]);
  const [potes, setPotes] = useState([] as any[]);
  const [participantes, setParticipantes] = useState([] as any[]);
  const [gastosFijos, setGastosFijos] = useState([] as any[]);
  
  const [isAddingPote, setIsAddingPote] = useState(false);
  const [isCreatingVaca, setIsCreatingVaca] = useState(false);
  const [nuevaVacaForm, setNuevaVacaForm] = useState({ nombre: "", monto_objetivo: "" });
  const POTE_OPCIONES = espacioActivo?.tipo === 'vaca'
    ? ["La rumba 🪩", "Pa' la caña 🍻", "El viaje ✈️", "La nave 🚗", "Personalizado ✍️"]
    : ["La nave 🚗", "Los estrenos 👕", "El gustico 🍔", "El semestre 📚", "Teléfono 📱", "Viaje ✈️", "Hogar 🏠", "Personalizado ✍️"];
  
  const [poteForm, setPoteForm] = useState({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });

  // Hoja de acción "Abonar / Retirar" al tocar una meta
  const [metaAccion, setMetaAccion] = useState<{ id: string; nombre: string; ahorrado: number; objetivo: number; modo: 'abonar' | 'retirar' } | null>(null);
  const [metaAccionMonto, setMetaAccionMonto] = useState("");
  const [metaAccionMoneda, setMetaAccionMoneda] = useState("usdt");

  const [nuevoPart, setNuevoPart] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // Renombrar un participante del Pote/Vaca (personalizar el nombre con el que se le identifica)
  const [editandoParticipanteId, setEditandoParticipanteId] = useState(null as string | null);
  const [editandoParticipanteNombre, setEditandoParticipanteNombre] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().toISOString().slice(0, 7));

  const [isAddingEmergencia, setIsAddingEmergencia] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [isAddingFijo, setIsAddingFijo] = useState(false);
  const [isNotasOpen, setIsNotasOpen] = useState(false);

  const [comercio, setComercio] = useState("");
const [metadatosFactura, setMetadatosFactura] = useState(null as any);
  
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
  const [isMercadoOpen, setIsMercadoOpen] = useState(false);

  // --- ESTADOS PARA REDISEÑO Y VISION IA ---
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = React.useRef(null as HTMLInputElement | null);

  // --- BLOQUEO ANTI DOBLE-CLICK: evita que un tap doble/rápido dispare un registro duplicado ---
  const isMutatingRef = React.useRef(false);
  const conUnSoloClick = <T extends (...args: any[]) => any>(fn: T): T => {
    return (async (...args: Parameters<T>) => {
      const posibleEvento = args[0] as any;
      if (posibleEvento && typeof posibleEvento.preventDefault === 'function') posibleEvento.preventDefault();
      if (isMutatingRef.current) return;
      isMutatingRef.current = true;
      try {
        return await fn(...args);
      } finally {
        isMutatingRef.current = false;
      }
    }) as T;
  };

  const [showAITerms, setShowAITerms] = useState(false);
  const [hasAcceptedAI, setHasAcceptedAI] = useState(false);

  // Al cargar, revisamos si ya las había aceptado antes
  React.useEffect(() => {
    if (localStorage.getItem('mipote_ai_accepted') === 'true') {
      setHasAcceptedAI(true);
    }
  }, []);

  // --- LÍMITE DE ESCANEOS IA (15/mes para cuentas gratis) ---
  const LIMITE_ESCANEOS_MES = 15;
  const getScanKey = () => `mipote_scans_${perfil?.id || 'invitado'}_${new Date().toISOString().slice(0, 7)}`;
  const getEscaneosUsados = () => parseInt(localStorage.getItem(getScanKey()) || '0', 10);
  const puedeEscanear = () => !!perfil?.is_pro || getEscaneosUsados() < LIMITE_ESCANEOS_MES;
  const registrarEscaneo = () => {
    if (!perfil?.is_pro) localStorage.setItem(getScanKey(), String(getEscaneosUsados() + 1));
  };

  // Recuerda qué escaneo se quería abrir, para retomarlo justo después de aceptar los términos de IA
  const [scanPendienteTerminos, setScanPendienteTerminos] = useState<'factura' | 'estado_cuenta'>('factura');

  // Función interceptora: En vez de abrir la cámara directo, verifica las políticas
  const handleTryScan = () => {
    if (!hasAcceptedAI) {
      setScanPendienteTerminos('factura');
      setShowAITerms(true);
      return;
    }

    if (!puedeEscanear()) {
      setIsFABMenuOpen(false);
      setTimeout(() => onTriggerPaywall?.(), 300);
      return;
    }

    fileInputRef.current?.click();
  };

  const acceptAITerms = () => {
    localStorage.setItem('mipote_ai_accepted', 'true');
    setHasAcceptedAI(true);
    setShowAITerms(false);
    // Abrimos la cámara automáticamente después de aceptar, retomando el escaneo que la disparó
    const inputRef = scanPendienteTerminos === 'estado_cuenta' ? estadoCuentaInputRef : fileInputRef;
    setTimeout(() => inputRef.current?.click(), 300);
  };

  // --- ESTADOS PARA CAMBIO P2P ---
  const [isP2POpen, setIsP2POpen] = useState(false);
  const [p2pForm, setP2pForm] = useState({ monedaDe: 'usdt', monedaPara: 'bs', monto: '', tasa: '', usuario: '' });

  useEffect(() => {
    if (isP2POpen && !p2pForm.tasa) setP2pForm(prev => ({ ...prev, tasa: rates.usdt.toFixed(2) }));
  }, [isP2POpen, rates.usdt]);



  // Cuando se abra el modal, le precargamos la tasa paralelo por defecto para ayudar al usuario
  useEffect(() => {
    if (isP2POpen && !p2pForm.tasa) {
      setP2pForm(prev => ({ ...prev, tasa: rates.usdt.toFixed(2) }));
    }
  }, [isP2POpen, rates.usdt]);

  // NUEVO: ESTADO PARA EDITAR NOMBRE DEL ESPACIO
  const [isEditingSpaceName, setIsEditingSpaceName] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState(espacioActivo?.nombre || "");

  // NUEVO: ESTADO PARA RECORDATORIOS (LISTA DE TAREAS)
  const [recordatorios, setRecordatorios] = useState([] as any[]);
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");

  const DEFAULT_CATEGORIES = [
    { valor: "salario", label: "Ingreso / Salario 💰" },
    { valor: "comida", label: "Comida 🍔" },
    { valor: "mercado", label: "Mercado 🛒" },
    { valor: "internet", label: "Internet / Servicios 🌐" },
    { valor: "mascotas", label: "Mascotas 🐾" },
    { valor: "cashea", label: "Cashea 🛍️" },
    { valor: "otro", label: "Otro (Personalizado) ✍️" }
  ];
  const [categoriasList, setCategoriasList] = useState(DEFAULT_CATEGORIES as any[]);
  // NUEVO: CATEGORÍAS PERSONALIZADAS POR ESPACIO (ocultar defaults / agregar propias)
  const [categoriasOcultas, setCategoriasOcultas] = useState(new Set<string>());
  const [categoriasCustom, setCategoriasCustom] = useState([] as any[]);

  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "" });
  const [budgetForm, setBudgetForm] = useState({ categoria: "", monto_limite: "" });
  const [isScanningCashea, setIsScanningCashea] = useState(false);
  const [cuotasEscaneadas, setCuotasEscaneadas] = useState([] as any[]);
  const casheaScanInputRef = React.useRef(null as HTMLInputElement | null);
  const [isScanningEstadoCuenta, setIsScanningEstadoCuenta] = useState(false);
  const [transaccionesEscaneadas, setTransaccionesEscaneadas] = useState([] as any[]);
  const estadoCuentaInputRef = React.useRef(null as HTMLInputElement | null);
  const [fijoForm, setFijoForm] = useState({ descripcion: "", monto: "", dia_pago: "1" });

  const [showToast, setShowToast] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState("");
  const [toastType, setToastType] = useState("ingreso");
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- MINI SIMULADOR EMBEBIDO EN INICIO ---
  const [miniSimMoneda, setMiniSimMoneda] = useState('usd' as 'usd'|'bs');
  const [miniSimTasa, setMiniSimTasa] = useState('paralelo' as 'bcv'|'paralelo'|'eur');
  const [miniSimMonto, setMiniSimMonto] = useState("");

  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("bs");
  const [tipo, setTipo] = useState("egreso");
 const [categoria, setCategoria] = useState("comida");
  const [customCategoria, setCustomCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [usuario, setUsuario] = useState("");

  const [pagoFijoActivo, setPagoFijoActivo] = useState(null as any);
  const [monedaFijo, setMonedaFijo] = useState('bs');
  
  // NUEVO: DESTINO DE LA TRANSFERENCIA
  const [destinoTransferencia, setDestinoTransferencia] = useState("");

  const formatMiniNum = (num: number, monedaResultado: 'bs' | 'usd' | 'eur' = 'bs') => {
    if (!num || isNaN(num)) return "0";
    // Bs se muestra como entero (montos grandes); $ y € necesitan decimales o los montos chicos se ven como "0"
    const decimales = monedaResultado === 'bs' ? 0 : 2;
    return num.toLocaleString('es-VE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  };

  const miniSimNum = parseFloat(miniSimMonto) || 0;
  const miniSimResultado = miniSimTasa === 'eur'
    ? (miniSimMoneda === 'usd'
        ? (rates.eur_bcv > 0 ? (miniSimNum * rates.bcv) / rates.eur_bcv : 0)
        : (rates.eur_bcv > 0 ? miniSimNum / rates.eur_bcv : 0))
    : (() => {
        const tasaValor = miniSimTasa === 'bcv' ? rates.bcv : rates.usdt;
        return miniSimMoneda === 'usd' ? miniSimNum * tasaValor : (tasaValor > 0 ? miniSimNum / tasaValor : 0);
      })();
  // La moneda del resultado depende de la dirección: si el origen es $ el resultado es Bs (o € en modo EUR), y viceversa
  const miniSimMonedaResultado: 'bs' | 'usd' | 'eur' = miniSimTasa === 'eur' ? 'eur' : (miniSimMoneda === 'usd' ? 'bs' : 'usd');
  const miniSimSimbolo = miniSimMonedaResultado === 'eur' ? '€' : (miniSimMonedaResultado === 'usd' ? '$' : 'Bs');

  const handleSwapMiniSim = () => {
    setMiniSimMonto(miniSimResultado > 0 ? miniSimResultado.toFixed(0) : "");
    setMiniSimMoneda(prev => prev === 'usd' ? 'bs' : 'usd');
  };

  const getMensajes = (tipoApp: string, tipoTx: string) => {
    if (tipoApp === 'pote') {
      return tipoTx === 'ingreso' ? [
        "¡Epa! Ese pote está engordando, family. 🍯💰", 
        "¡Poniendo pa' lo nuestro! ❤️", 
        "Gotita a gotita llenamos el tobo. 🪣", 
        "¡Así se construye nuestro imperio! 🏰", 
        "No sé ustedes pero en mi familia hacemos un bailecito 💃", 
        "Juntos somos invencibles con la plata. 💪👫", 
        "Echándole pichón pa' cumplir esa meta. 🚀", 
        "¡Este equipo no lo para nadie! 🥇", 
        "A este paso nos compramos Caracas. 🏙️", 
        "Pote lleno, corazón contento. ❤️🍯", 
        "Trabajando juntos por ese sueño. 🌟", 
        "Sumando bloques a nuestra casita de ahorros. 🧱", 
        "Esa meta ya nos está guiñando el ojo. 😉", 
        "¡Dinero asegurado! 🔒", 
        "Qué rico ver cómo crece nuestro sudor ahí reflejado. 💦💰"
      ] : [
        "¿De pana necesitábamos gastar en esto? 🤨", 
        "Mosca con la tarjeta, que nos descuadramos. 💳", 
        "Gastico hormiga detectado, pila ahí. 🐜", 
        "Pilas que ese gustico nos aleja de la meta. 📉", 
        "este gasto dolió en el alma (y en el bolsillo). 💔", 
        "Nos salimos del presupuesto, arropate hasta donde llegue la cobija. 🛏️", 
        "Cuidado con los antojos que nos dejan limpios. 🍔🚫", 
        "Pelando bola en 3, 2, 1... si seguimos así. 📉", 
        "Este mes nos toca comer arepa con mantequilla. 🫓", 
        "No dejes que la emoción nos vacíe el pote. 🍯🥄", 
        "Pendiente con el despilfarro. 💸", 
        "Mosca con las compras nerviosas. 🛍️", 
        "Si le seguimos sacando al pote, no vamos a llegar nunca. 🐌", 
        "Administra bien que la cosa no está fácil. 🇻🇪", 
        "recuerda la meta... no nos desviemos. 🎯"
      ];
    } else if (tipoApp === 'vaca') {
      return tipoTx === 'ingreso' ? [
        "¡Cayó la plata pa' las frías! 🍻", 
        "¡Coronamos! La vaca va engordando. 🐄💰", 
        "Epa mis panas, esta vaca ya huele a playa. 🏖️", 
        "¡Aportando pa'l desastre! 🎉", 
        "¡Con esta vaca armamos la rumba! 🪩", 
        "Llegó el de los reales. 💸😎", 
        "Esta gente si está responsable vale, pagando a tiempo. 👏", 
        "¡Vaca gorda, desastre seguro! 🐄💥", 
        "Sumando pa' la curda y la gozadera. 🥃", 
        "Se armó el bonche, ya hay presupuesto. 🎊", 
        "La vaca dice: ¡Muuuuucho billete! 🐄💸", 
        "¡Nadie se queda por fuera de esta rumba! 🥳", 
        "Transferencia confirmada, el pana va pendiente. ✅", 
        "Panas que pagan a tiempo = Panas de verdad. 🫂", 
        "¡Plata lista! Ahora a planear a dónde vamos. 📍"
      ] : [
        "¡Coño, nos bajaron los fondos! 📉", 
        "¿Quién autorizó este gasto loco? 🤨", 
        "Aflojando la plata... más vale que valga la pena. 💸", 
        "Epa, controlen el gasto que no llegamos a la fecha. 🛑", 
        "¡Se nos fue una luca de la vaca! 🐄💸", 
        "Gastando los reales, mosca que nos quedamos limpios. 🧹", 
        "Si nos seguimos gastando la plata, nos toca tomar agua de chorro. 🚰", 
        "Rindiendo la plata como si fuéramos economistas. 🤓", 
        "Mosca con los gastos fantasmas que nos desfalcan. 👻", 
        "Pila ahí con esos 'gusticos' con plata ajena. 👀", 
        "¡Agarren mínimo que nos quedamos sin vaca! 🐄🚫", 
        "Un tarjetazo menos en la vaca. 💳", 
        "Esa factura dolió más que ratón de cocuy. 🥃🤕", 
        "Pidan descuento pa' la próxima, no sean botaratas. 🏷️", 
        "Ajustando las cuentas del desastre. 📊"
      ];
    } else {
      return tipoTx === 'ingreso' ? [
        "¡Cayó la quincena, papá! 🤑", 
        "¡Coronamos! Platica pa' la cuenta. 💰", 
        "Un paso más pa' comprarnos Caracas. 🏙️", 
        "Echándole pichón y viendo los frutos. 💪", 
        "Plata en mano, sonrisa en la cara. 😁", 
        "Resolviendo como todo un guerrero. 🛡️", 
        "Esa cuenta engordando sabroso. 🐷💸", 
        "¡Llegó el de los reales! 😎", 
        "Billete llama billete. 💵", 
        "Coronando otro tigrito. 🐯", 
        "Sumando pa' no pelar bola. ➕", 
        "Ese saldo pa' rriba como la espuma. 🫧", 
        "Así se construye el imperio, mi pana. 🏰", 
        "Hoy se come rico, entró platica. 🍔", 
        "¡Chinga! Sonó la caja registradora. 🎰"
      ] : [
        "Coño, ese tarjetazo dolió. 💳💥", 
        "Chao billete, te extrañaremos. 💸👋", 
        "Mosca con la gastadera que te pega la patria. 🇻🇪", 
        "¿De pana necesitabas comprar eso? 🤨", 
        "El bolsillo está pidiendo cacao. 🏳️", 
        "Otro gustico y comemos arepa sola. 🫓", 
        "Se nos fue una luca ahí. 📉", 
        "Ajusta el cinturón que nos quedamos limpios. 👖", 
        "Esa platica voló más rápido que un chisme. 🦅", 
        "Pila con los gastos hormiga que nos matan. 🐜", 
        "Pagando y llorando. 😭", 
        "¡Agárrate que la cuenta bajó! 🎢", 
        "Menos mal que hay salud, porque plata... 🏥", 
        "Ese gasto no estaba en los planes, mi pana. 📝❌", 
        "Gastando como si fuéramos enchufados. 🔌😅"
      ];
    }
  };

  const triggerToast = (tipoTransaccion: string, mensajeForzado?: string) => {
    if (mensajeForzado) {
      setMensajeMotivacional(mensajeForzado);
    } else {
      const lista = getMensajes(espacioActivo?.tipo || 'individual', tipoTransaccion);
      setMensajeMotivacional(lista[Math.floor(Math.random() * lista.length)]);
    }
    setToastType(tipoTransaccion);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 4500);
  };

  const cerrarToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setShowToast(false);
  };

  const fetchRates = async () => {
    setSyncing(true);
    try {
      // 1. Traer Dólar (Tu API) - Con manejo de errores suave (igual que el resto de fuentes)
      let dataUsd: any = null;
      try {
        const resUsd = await fetch("/api/rates");
        if (resUsd.ok) dataUsd = await resUsd.json();
        else console.warn("API Tasas falló, se mantienen las tasas BCV/Paralelo anteriores");
      } catch (err) {
        console.warn("API Tasas no respondió, se mantienen las tasas BCV/Paralelo anteriores");
      }

      // 2. Traer Euro (DolarAPI) - Con manejo de errores suave
      let eurOficial = 0;
      let eurParalelo = 0;

      try {
        const resEur = await fetch("https://ve.dolarapi.com/v1/euros");
        if (resEur.ok) {
           const dataEur = await resEur.json();
           eurOficial = dataEur.find((e: any) => e.fuente === "oficial")?.promedio || 0;
           eurParalelo = dataEur.find((e: any) => e.fuente === "paralelo")?.promedio || 0;
        }
      } catch (err) {
        console.warn("DolarAPI falló, usando valores por defecto para el Euro");
      }

      // 2.1 Traer Peso Colombiano (DolarAPI Colombia) - Con manejo de errores suave
      let copUsd = 0;
      try {
        const resCop = await fetch("https://co.dolarapi.com/v1/cotizaciones");
        if (resCop.ok) {
           const dataCop = await resCop.json();
           const usdCop = dataCop.find((c: any) => c.moneda === "USD");
           if (usdCop) copUsd = ((usdCop.compra || 0) + (usdCop.venta || 0)) / 2;
        }
      } catch (err) {
        console.warn("DolarAPI Colombia falló, usando valores por defecto para el Peso");
      }

      // 2.2 Traer Peso Mexicano (DolarAPI México) - Con manejo de errores suave
      let mxnUsd = 0;
      try {
        const resMxn = await fetch("https://mx.dolarapi.com/v1/cotizaciones");
        if (resMxn.ok) {
           const dataMxn = await resMxn.json();
           const usdMxn = dataMxn.find((c: any) => c.moneda === "USD");
           if (usdMxn) mxnUsd = ((usdMxn.compra || 0) + (usdMxn.venta || 0)) / 2;
        }
      } catch (err) {
        console.warn("DolarAPI México falló, usando valores por defecto para el Peso Mexicano");
      }

      // 3. Guardar tasas: si el dólar (BCV/Paralelo) falló, mantenemos las últimas conocidas
      // en vez de resetear a 0 (el resto de la app asume rates.bcv > 0 para varios cálculos).
      setRates(prev => ({
        bcv: (dataUsd && dataUsd.success) ? (dataUsd.bcv || prev.bcv) : prev.bcv,
        usdt: (dataUsd && dataUsd.success) ? (dataUsd.usdt || prev.usdt) : prev.usdt,
        eur_bcv: eurOficial || prev.eur_bcv,
        eur_paralelo: eurParalelo || prev.eur_paralelo,
        cop_usd: copUsd || prev.cop_usd,
        mxn_usd: mxnUsd || prev.mxn_usd
      }));
    } catch (e) {
      console.error("Error crítico trayendo tasas:", e);
    } finally {
      setSyncing(false);
    }
  };

  const fetchData = useCallback(async () => {
    setTransactions([]); setCuotasCashea([]); setPresupuestos([]); setPotes([]); setParticipantes([]); setRecordatorios([]); setGastosFijos([]);

    if (!espacioActivo) return;
    setLoading(true);
    
    try {
      // CARGAR GASTOS FIJOS DESDE LOCALSTORAGE (Fallback seguro)
      const savedFijos = localStorage.getItem(`gastos_fijos_${espacioActivo.id}`);
      if (savedFijos) setGastosFijos(JSON.parse(savedFijos));

      if (isGuest) {
        setTransactions(JSON.parse(localStorage.getItem('mipote_guest_tx') || '[]'));
        setPotes(JSON.parse(localStorage.getItem('mipote_guest_potes') || '[]'));
      } else if (espacioActivo) {
        const { data: txData } = await supabase.from("transacciones_saas").select("*").eq("espacio_id", espacioActivo.id).order("created_at", { ascending: false });
        if (txData) setTransactions(txData);
        
        const { data: partData } = await supabase.from("participantes").select("*").eq("espacio_id", espacioActivo.id);
        if (partData) setParticipantes(partData);

        const { data: casheaData } = await supabase.from("cashea").select("*").eq("espacio_id", espacioActivo.id).order("fecha_pago", { ascending: true });
        if (casheaData) setCuotasCashea(casheaData);
        
       const { data: catData } = await supabase.from("categorias").select("*").eq("espacio_id", espacioActivo.id);

        const ocultasSet = new Set((catData || []).filter((c: any) => c.oculta).map((c: any) => c.valor)) as Set<string>;
        const customCatsDb = (catData || []).filter((c: any) => !c.oculta);
        setCategoriasOcultas(ocultasSet);
        setCategoriasCustom(customCatsDb);

        // El sistema escanea tu historial y extrae las categorías nuevas que inventaste
        const customCats = Array.from(new Set(txData?.map(tx => tx.categoria).filter(cat =>
            cat &&
            !cat.startsWith('pote_') &&
            cat !== 'emergencia' &&
            cat !== 'transferencia_salida' &&
            cat !== 'transferencia_entrada' &&
            !DEFAULT_CATEGORIES.some(c => c.valor === cat)
        ) || []));

        const dynamicCategorias = customCats.map(cat => ({ valor: cat, label: cat }));

        const combined = [...DEFAULT_CATEGORIES.filter(c => !ocultasSet.has(c.valor)), ...customCatsDb, ...dynamicCategorias];
        const uniqueCats = Array.from(new Map(combined.map(item => [item.valor, item])).values());
        setCategoriasList(uniqueCats);

        const { data: presData } = await supabase.from("presupuestos").select("*").eq("espacio_id", espacioActivo.id);
        if (presData) setPresupuestos(presData);

        const { data: metasData } = await supabase.from("metas").select("*").eq("espacio_id", espacioActivo.id).order("created_at", { ascending: true });
        if (metasData) setPotes(metasData);

        const { data: recData } = await supabase.from("recordatorios").select("*").eq("espacio_id", espacioActivo.id).order("created_at", { ascending: false });
        if (recData) setRecordatorios(recData);
      }
    } catch (err) { console.error("Error fetch:", err); } finally { setLoading(false); }
  }, [espacioActivo, isGuest]);

  // NUEVO: GESTIÓN DE CATEGORÍAS PERSONALIZADAS (agregar propias / ocultar las de por defecto)
  const slugCategoria = (label: string) => label
    .trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const agregarCategoriaPersonalizada = async (label: string, tipoCat: string) => {
    if (!espacioActivo || isGuest) return;
    const valor = slugCategoria(label);
    if (!valor) return;
    const { error } = await supabase.from("categorias").insert([{ valor, label: label.trim(), tipo: tipoCat, espacio_id: espacioActivo.id, oculta: false }]);
    if (error) { alert("No se pudo agregar la categoría: " + error.message); return; }
    fetchData();
  };

  const ocultarCategoriaDefault = async (valor: string, tipoCat: string) => {
    if (!espacioActivo || isGuest) return;
    const { error } = await supabase.from("categorias").upsert([{ valor, tipo: tipoCat, espacio_id: espacioActivo.id, oculta: true }], { onConflict: 'espacio_id,valor' });
    if (error) { alert("No se pudo ocultar la categoría: " + error.message); return; }
    fetchData();
  };

  const eliminarCategoriaCustom = async (id: string) => {
    if (!espacioActivo || isGuest) return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) { alert("No se pudo eliminar la categoría: " + error.message); return; }
    fetchData();
  };

  const categoriasApi = {
    ocultas: categoriasOcultas,
    custom: categoriasCustom,
    agregar: agregarCategoriaPersonalizada,
    ocultar: ocultarCategoriaDefault,
    eliminar: eliminarCategoriaCustom,
    disponible: !isGuest,
  };

  useEffect(() => { fetchRates(); fetchData(); }, [fetchData]);

  useEffect(() => {
    let interval: any;
    if (activeTab === 'calculadora' || forceTab === 'calculadora') {
      fetchRates(); interval = setInterval(fetchRates, 10000); 
    }
    return () => clearInterval(interval);
  }, [activeTab, forceTab]);

  useEffect(() => {
    if (!espacioActivo) return;
    if (espacioActivo.tipo === 'individual') {
      setUsuario((perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú");
    } else {
      // En Pote/Vaca precargamos a quien está registrando como "quién" por defecto,
      // para no obligar a elegirse a sí mismo cada vez. Solo si ya figura como participante
      // (se auto-agrega al crear o unirse al espacio); si no hay match, dejamos que elija a mano.
      const miNombre = perfil?.nombre || session?.user?.email?.split('@')[0] || "";
      const yaSoyParticipante = participantes.some((p: any) => p.nombre === miNombre);
      setUsuario(yaSoyParticipante ? miNombre : "");
    }
  }, [espacioActivo, session, perfil, participantes]);

  const nombresParticipantes = participantes.map(p => p.nombre);
  const filterOptions = ["Todos", ...nombresParticipantes];
  if (espacioActivo?.tipo !== 'individual' && !filterOptions.includes("Ambos")) filterOptions.push(espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)');

  const calcularMontos = (montoInput: number, monedaInput: string) => {
    let monto_bs = 0, monto_usd_bcv = 0, monto_usd_paralelo = 0;
    if (monedaInput === 'bs') {
      monto_bs = montoInput; 
      monto_usd_bcv = rates.bcv > 0 ? montoInput / rates.bcv : 0; 
      monto_usd_paralelo = rates.usdt > 0 ? montoInput / rates.usdt : 0;
    } else if (monedaInput === 'usdt' || monedaInput === 'usd') {
      monto_usd_paralelo = montoInput; monto_usd_bcv = montoInput; monto_bs = montoInput * rates.usdt;
    } else if (monedaInput === 'cash') {
      monto_usd_paralelo = montoInput; monto_usd_bcv = montoInput; monto_bs = montoInput * rates.bcv;
    } else {
      // Monedas extranjeras "editables" (ej. Peso Colombiano, Peso Mexicano) definidas en tasasConfig.ts
      const tasaForanea = TASAS_DISPONIBLES.find(t => t.id === monedaInput && t.kind === 'foreign_per_usd');
      if (tasaForanea) {
        const tasaValor = getValorTasa(tasaForanea.id, rates);
        const usdEquiv = tasaValor > 0 ? montoInput / tasaValor : 0;
        monto_usd_paralelo = usdEquiv; monto_usd_bcv = usdEquiv; monto_bs = usdEquiv * rates.usdt;
      }
    }
    return { monto_bs, monto_usd_bcv, monto_usd_paralelo };
  };

  const getPoteAhorrado = (poteId: string, poteNombre: string) => {
    if (espacioActivo?.tipo === 'vaca') {
      const saldos = getSaldosAislados('ALL');
      return saldos.usdt + saldos.cash + (rates.usdt > 0 ? saldos.bs / rates.usdt : 0);
    }
    return transactions.filter(tx => tx.categoria === `pote_${poteId}`).reduce((acc, tx) => tx.tipo === "ingreso" ? acc + (tx.monto_usd_paralelo || 0) : acc - (tx.monto_usd_paralelo || 0), 0);
  };


// 📸 MOTOR DE IA: ESCANEO DE FACTURAS (VÍA BACKEND PROPIO PARA EVITAR BLOQUEO DE APPLE)
  const handleScanInvoice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    triggerToast("ingreso", "Procesando factura... 📸");

    try {
      // 1. Compresión de imagen (¡Se mantiene igual!)
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000; 
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

      // 2. LLAMADA A NUESTRO PROPIO SERVIDOR (Vercel) EN VEZ DE OPENAI DIRECTO
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en el servidor de Vercel");
      }

      const dataResult = await response.json();
      const aiResponse = dataResult.result;
      
      if (aiResponse) {
        const jsonString = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        setTipo("egreso");
        setMonto(data.monto_total?.toString() || "");
        setMoneda(data.moneda?.toLowerCase() === 'bs' ? 'bs' : 'usdt');
        setDescripcion(`${data.comercio || 'Comercio'} (${data.hora || ''})`);
        setCategoria(categoriasList.some(c => c.valor === data.categoria_sugerida) ? data.categoria_sugerida : "otro");

        setComercio(data.comercio || "");
        setMetadatosFactura({
           fecha: data.fecha,
           hora: data.hora,
           iva: data.iva_total,
           productos: data.productos || []
        });

        registrarEscaneo();

        setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 500);
      }
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert("Error técnico de IA: " + (error?.message || JSON.stringify(error) || "Error desconocido"));
    } finally {
      setIsScanning(false);
      if (event.target) event.target.value = '';
    }
  };

  // 🔥 LÓGICA DE REGISTRO Y TRANSFERENCIAS
const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);

    let finalCategoria = categoria;
    if (categoria === 'otro') {
       if (!customCategoria.trim()) return alert("Por favor ingresa el nombre de tu categoría.");
       finalCategoria = customCategoria.trim();
    }

    if (tipo === 'transferencia') {
      if (!destinoTransferencia) return alert("Selecciona el espacio destino");
      const destSpace = espacios.find((sp:any) => sp.id === destinoTransferencia);
      if (!isGuest) {
        await supabase.from("transacciones_saas").insert([{ descripcion: `Transferencia a: ${destSpace?.nombre}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_salida', usuario: usuario || "Tú", tipo: 'egreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
        await supabase.from("transacciones_saas").insert([{ descripcion: `Transferencia recibida de: Billetera`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_entrada', usuario: usuario || "Tú", tipo: 'ingreso', espacio_id: destinoTransferencia, usuario_id: session.user.id }]);
      }
      fetchData(); triggerToast("egreso", "¡Transferencia enviada con éxito! 💸"); 
      setCustomCategoria(""); return;
    }

    if (finalCategoria === 'retiro_pote') {
      if (!destinoTransferencia) return alert("Selecciona la meta");
      await retirarMeta(destinoTransferencia, valorMonto, moneda);
      setCustomCategoria(""); return;
    }

    if (finalCategoria === 'abono_pote') {
      if (!destinoTransferencia) return alert("Selecciona la meta");
      await abonarMeta(destinoTransferencia, valorMonto, moneda);
      setCustomCategoria(""); return;
    }

    const isValidDesc = (tipo === 'ingreso' || finalCategoria === 'abono_pote') ? true : descripcion.trim() !== "";
    const isValidUser = usuario.trim() !== "" || espacioActivo?.tipo === 'individual';
    if (!isValidDesc || !isValidUser || !finalCategoria) return alert("Verifica la categoría, el detalle y quién pagó."); 

    if (finalCategoria === 'cashea') {
      const montoTotal = parseFloat(monto);
      const nCuotas = (window as any).numCuotasCashea || 3; 
      const montoCuota = montoTotal / nCuotas;
      const cuotasParaInsertar = [];
      const { addDays, format } = require('date-fns');

      for (let i = 1; i <= nCuotas; i++) {
        cuotasParaInsertar.push({ articulo: descripcion, monto_cuota: montoCuota, fecha_pago: format(addDays(new Date(), i * 14), 'yyyy-MM-dd'), usuario: usuario || "Tú", espacio_id: espacioActivo.id, pagado: false });
      }
      const { error } = await supabase.from("cashea").insert(cuotasParaInsertar);
      if (error) alert("🚨 Error Cashea: " + error.message);
      else { fetchData(); triggerToast("egreso", `Programadas ${nCuotas} cuotas de $${montoCuota.toFixed(2)}`); }
      setCustomCategoria(""); return;
    }

    let retirosDeMetas: { poteId: string; monto: number }[] = [];
    if (tipo === 'egreso') {
      const { ok, retiros } = await verificarFondosSuficientes(monto_usd_paralelo, usuario);
      if (!ok) return;
      retirosDeMetas = retiros;
    }

    let descFinal = descripcion; let msjAlertaEspecial = null;
    if (finalCategoria.startsWith("pote_")) {
       const poteId = finalCategoria.split("_")[1];
       const poteRelacionado = potes.find((p:any) => p.id.toString() === poteId);
       if (poteRelacionado) descFinal = `Pote: ${poteRelacionado.nombre} - ${descripcion}`;
    } else {
       let labelCategoria = categoriasList.find(c => c.valor === finalCategoria)?.label || finalCategoria;
       descFinal = tipo === 'ingreso' && !descripcion ? labelCategoria : `${labelCategoria} - ${descripcion}`;
    }

    if (isGuest) {
      const newTx = { id: Date.now().toString(), descripcion: descFinal, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: finalCategoria, usuario: usuario || "Tú", tipo, created_at: new Date().toISOString() };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx); localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
      triggerToast(tipo, msjAlertaEspecial || undefined);
    } else {
      // 🎯 AQUÍ ES EL CAMBIO EXACTO: Insert general para gastos comunes de la calle
      const { error } = await supabase.from("transacciones_saas").insert([{
        descripcion: descFinal,
        monto_original: valorMonto,
        moneda_original: moneda,
        monto_bs,
        monto_usd_bcv,
        monto_usd_paralelo,
        categoria: finalCategoria,
        usuario: usuario || "Tú",
        tipo,
        espacio_id: espacioActivo.id,
        usuario_id: session.user.id,
        comercio: comercio || null,          // <-- Guardamos el comercio extraído por la IA
        metadatos: metadatosFactura || null  // <-- Guardamos el JSON completo con productos e IVA
      }]);

      if (error) alert("🚨 Error: " + error.message);
      else {
        // Si no alcanzaba la liquidez, descontamos automáticamente de las metas que cubrieron la diferencia.
        for (const r of retirosDeMetas) await retirarMeta(r.poteId, r.monto, 'usdt');
        fetchData(); triggerToast(tipo, msjAlertaEspecial || undefined);
      }
    }
    setCustomCategoria("");
  };

  // P2P CORREGIDO (IDENTIDAD Y MATEMÁTICA)
  const realizarCambioP2P = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoDe = parseFloat(p2pForm.monto);
    const tasaUsada = parseFloat(p2pForm.tasa);
    
    if (!montoDe || !tasaUsada || p2pForm.monedaDe === p2pForm.monedaPara) return alert("Verifica los montos.");
    if (!p2pForm.usuario) return alert("Selecciona el responsable del cambio.");

    let montoRecibe = 0;
    if (p2pForm.monedaDe === 'usdt' && p2pForm.monedaPara === 'bs') montoRecibe = montoDe * tasaUsada;
    else if (p2pForm.monedaDe === 'bs' && p2pForm.monedaPara === 'usdt') montoRecibe = montoDe / tasaUsada;

    const safeDiv = (num: number, divisor: number) => divisor > 0 ? num / divisor : 0;
    const desc = `Cambio P2P: ${p2pForm.monedaDe.toUpperCase()} a ${p2pForm.monedaPara.toUpperCase()} (Tasa: ${tasaUsada})`;
    const usuarioTx = p2pForm.usuario;

    const txSalida = { descripcion: desc, monto_original: montoDe, moneda_original: p2pForm.monedaDe, monto_bs: p2pForm.monedaDe === 'bs' ? montoDe : montoDe * rates.usdt, monto_usd_bcv: p2pForm.monedaDe === 'usdt' ? montoDe : safeDiv(montoDe, rates.bcv), monto_usd_paralelo: p2pForm.monedaDe === 'usdt' ? montoDe : safeDiv(montoDe, rates.usdt), categoria: 'cambio_p2p', usuario: usuarioTx, tipo: 'egreso', created_at: new Date().toISOString() };
    const txEntrada = { descripcion: desc, monto_original: montoRecibe, moneda_original: p2pForm.monedaPara, monto_bs: p2pForm.monedaPara === 'bs' ? montoRecibe : montoRecibe * rates.usdt, monto_usd_bcv: p2pForm.monedaPara === 'usdt' ? montoRecibe : safeDiv(montoRecibe, rates.bcv), monto_usd_paralelo: p2pForm.monedaPara === 'usdt' ? montoRecibe : safeDiv(montoRecibe, rates.usdt), categoria: 'cambio_p2p', usuario: usuarioTx, tipo: 'ingreso', created_at: new Date().toISOString() };

    if (!isGuest) {
      await supabase.from("transacciones_saas").insert([ { ...txSalida, espacio_id: espacioActivo.id, usuario_id: session.user.id }, { ...txEntrada, espacio_id: espacioActivo.id, usuario_id: session.user.id } ]);
      fetchData(); triggerToast("ingreso", "P2P Completado 💱");
      setIsP2POpen(false); setP2pForm({ monedaDe: 'usdt', monedaPara: 'bs', monto: '', tasa: rates.usdt.toString(), usuario: '' });
    }
  };

  const unirseConCodigoInterno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    
    const { data: spaceFound } = await supabase.from('espacios').select('*').eq('codigo_invitacion', joinCodeInput.trim().toUpperCase()).single();
    if (!spaceFound) { alert("❌ Código inválido."); return; }
    
    const yaEsMiembro = espacios?.find((e:any) => e.id === spaceFound.id);
    if (yaEsMiembro) { alert("Ya eres miembro de este espacio."); return; }

    const { count } = await supabase.from('espacio_miembros').select('*', { count: 'exact', head: true }).eq('espacio_id', spaceFound.id);
    

    await supabase.from('espacio_miembros').insert([{ espacio_id: spaceFound.id, usuario_id: session.user.id, rol: 'miembro' }]);
    await supabase.from('participantes').insert([{ nombre: (perfil?.nombre || session.user.email.split('@')[0]), espacio_id: spaceFound.id }]);
    
    alert("✅ ¡Te has unido exitosamente!");
    window.location.reload();
  };



  const guardarNombreEspacio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || isGuest) return;
    
    const { error } = await supabase.from('espacios').update({ nombre: newSpaceName }).eq('id', espacioActivo.id);
    if (error) {
      alert("Error al actualizar el nombre");
    } else {
      setEspacioActivo({...espacioActivo, nombre: newSpaceName});
      setIsEditingSpaceName(false);
    }
  };

  const agregarRecordatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoRecordatorio.trim() || isGuest) return;

    const { error } = await supabase.from('recordatorios').insert([{
      texto: nuevoRecordatorio,
      espacio_id: espacioActivo.id,
      usuario_id: session.user.id
    }]);

    if (!error) {
      setNuevoRecordatorio("");
      fetchData();
    }
  };

  const toggleRecordatorio = async (id: string, estadoActual: boolean) => {
    if (isGuest) return;
    await supabase.from('recordatorios').update({ completado: !estadoActual }).eq('id', id);
    fetchData();
  };

  const eliminarRecordatorio = async (id: string) => {
    if (isGuest) return;
    await supabase.from('recordatorios').delete().eq('id', id);
    fetchData();
  };

  const verificarLimiteInvitado = () => {
    return true; 
  };

  const agregarCashea = async (e: React.FormEvent) => {
    e.preventDefault(); if(!verificarLimiteInvitado()) return;
    if (!casheaForm.articulo || !casheaForm.monto_cuota || !casheaForm.fecha_pago) return;
    await supabase.from("cashea").insert([{ articulo: casheaForm.articulo, monto_cuota: parseFloat(casheaForm.monto_cuota), fecha_pago: casheaForm.fecha_pago, usuario: casheaForm.usuario || "Tú", espacio_id: espacioActivo.id }]);
    setIsAddingCashea(false); setCasheaForm({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "" }); fetchData();
  };

  // Escanea una captura de la app de Cashea con la lista de cuotas pendientes y las prepara para revisión.
  const handleScanCashea = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!puedeEscanear()) { setTimeout(() => onTriggerPaywall?.(), 300); if (event.target) event.target.value = ''; return; }

    setIsScanningCashea(true);
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageUrl = base64Image.split(',')[1];
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, mode: "cashea" }),
      });
      if (!response.ok) throw new Error("Error procesando imagen");

      const dataResult = await response.json();
      const jsonString = (dataResult.result || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonString);
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) throw new Error("No se detectaron cuotas en la imagen");

      registrarEscaneo();
      setCuotasEscaneadas(items.map((it: any, idx: number) => ({
        seleccionado: true,
        clave: `${idx}-${Date.now()}`,
        articulo: it.articulo || "Cuota Cashea",
        monto_cuota: it.monto_cuota || 0,
        fecha_pago: it.fecha_pago || new Date().toISOString().slice(0, 10),
        cuota_actual: it.cuota_actual,
        cuota_total: it.cuota_total,
      })));
    } catch (error) {
      console.error(error);
      alert("No pude leer las cuotas de la imagen. Intenta con otra captura o agrégalas manual.");
    } finally {
      setIsScanningCashea(false);
      if (event.target) event.target.value = '';
    }
  };

  const confirmarCuotasEscaneadas = async () => {
    const seleccionadas = cuotasEscaneadas.filter(c => c.seleccionado);
    if (seleccionadas.length === 0) { setCuotasEscaneadas([]); return; }

    const nombreUsuario = (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú";
    const registros = seleccionadas.map(c => ({
      articulo: c.articulo,
      monto_cuota: parseFloat(c.monto_cuota),
      fecha_pago: c.fecha_pago,
      usuario: nombreUsuario,
      espacio_id: espacioActivo.id,
    }));

    const { data, error } = await supabase.from("cashea").insert(registros).select();
    if (error) { alert("🚨 Error registrando cuotas: " + error.message); return; }
    if (data) setCuotasCashea(prev => [...prev, ...data]);
    triggerToast("egreso", `${seleccionadas.length} cuota${seleccionadas.length === 1 ? '' : 's'} de Cashea registrada${seleccionadas.length === 1 ? '' : 's'} 🛍️`);
    setCuotasEscaneadas([]);
  };

  // Convierte montos como "1.250,50" (formato venezolano) o strings con símbolos a un número JS válido.
  // Sin esto, si la IA responde el monto como string con coma decimal, el <input type="number"> lo recibe
  // como valor inválido y el navegador lo muestra en blanco (aunque el dato "existe" en el estado).
  const normalizarMontoIA = (valor: any): number => {
    if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
    if (!valor) return 0;
    let str = String(valor).trim().replace(/[^\d,.-]/g, '');
    const ultimaComa = str.lastIndexOf(',');
    const ultimoPunto = str.lastIndexOf('.');
    if (ultimaComa > ultimoPunto) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Función interceptora: valida términos de IA y límite de escaneos antes de abrir la cámara para el estado de cuenta
  const handleTryScanEstadoCuenta = () => {
    if (!hasAcceptedAI) {
      setScanPendienteTerminos('estado_cuenta');
      setShowAITerms(true);
      return;
    }
    if (!puedeEscanear()) {
      setIsFABMenuOpen(false);
      setTimeout(() => onTriggerPaywall?.(), 300);
      return;
    }
    estadoCuentaInputRef.current?.click();
  };

  // Escanea una captura del estado de cuenta bancario y detecta todos los movimientos (ingresos y egresos) para revisión.
  const handleScanEstadoCuenta = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!puedeEscanear()) { setTimeout(() => onTriggerPaywall?.(), 300); if (event.target) event.target.value = ''; return; }

    setIsScanningEstadoCuenta(true);
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageUrl = base64Image.split(',')[1];
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, mode: "estado_cuenta" }),
      });
      if (!response.ok) throw new Error("Error procesando imagen");

      const dataResult = await response.json();
      const jsonString = (dataResult.result || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonString);
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) throw new Error("No se detectaron movimientos en la imagen");

      registrarEscaneo();
      setTransaccionesEscaneadas(items.map((it: any, idx: number) => ({
        seleccionado: true,
        clave: `${idx}-${Date.now()}`,
        tipo: it.tipo === 'ingreso' ? 'ingreso' : 'egreso',
        descripcion: it.descripcion || "Movimiento bancario",
        monto: normalizarMontoIA(it.monto),
        moneda: it.moneda === 'bs' ? 'bs' : 'usdt',
        categoria: categoriasList.some(c => c.valor === it.categoria_sugerida) ? it.categoria_sugerida : "otro",
        fecha: it.fecha || null,
      })));
    } catch (error) {
      console.error(error);
      alert("No pude leer los movimientos de la imagen. Intenta con otra captura o regístralos manual.");
    } finally {
      setIsScanningEstadoCuenta(false);
      if (event.target) event.target.value = '';
    }
  };

  const actualizarTransaccionEscaneada = (idx: number, patch: Partial<any>) => {
    setTransaccionesEscaneadas(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const confirmarTransaccionesEscaneadas = async () => {
    const seleccionadas = transaccionesEscaneadas.filter(t => t.seleccionado);
    if (seleccionadas.length === 0) { setTransaccionesEscaneadas([]); return; }

    const nombreUsuario = (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú";

    const registros = seleccionadas.map(t => {
      const valorMonto = parseFloat(t.monto) || 0;
      const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, t.moneda);
      const labelCategoria = categoriasList.find(c => c.valor === t.categoria)?.label || t.categoria;
      const descFinal = t.tipo === 'ingreso' ? (t.descripcion || labelCategoria) : `${labelCategoria} - ${t.descripcion}`;
      return {
        descripcion: descFinal,
        monto_original: valorMonto,
        moneda_original: t.moneda,
        monto_bs, monto_usd_bcv, monto_usd_paralelo,
        categoria: t.categoria,
        usuario: nombreUsuario,
        tipo: t.tipo,
        created_at: t.fecha ? new Date(`${t.fecha}T12:00:00`).toISOString() : new Date().toISOString(),
      };
    });

    if (isGuest) {
      const nuevasTx = registros.map((r, i) => ({ ...r, id: (Date.now() + i).toString() }));
      const updatedTx = [...nuevasTx, ...transactions];
      setTransactions(updatedTx);
      localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
    } else {
      const { error } = await supabase.from("transacciones_saas").insert(
        registros.map(r => ({ ...r, espacio_id: espacioActivo.id, usuario_id: session.user.id }))
      );
      if (error) { alert("🚨 Error registrando movimientos: " + error.message); return; }
      fetchData();
    }

    triggerToast("ingreso", `${seleccionadas.length} movimiento${seleccionadas.length === 1 ? '' : 's'} registrado${seleccionadas.length === 1 ? '' : 's'} 🏦`);
    setTransaccionesEscaneadas([]);
  };

  const guardarPresupuesto = async (e: React.FormEvent) => { 
    e.preventDefault(); if(!verificarLimiteInvitado()) return;
    if (!budgetForm.categoria || !budgetForm.monto_limite) return;
    const existente = presupuestos.find(p => p.categoria === budgetForm.categoria);
    if (existente) await supabase.from("presupuestos").update({ monto_limite: parseFloat(budgetForm.monto_limite) }).eq("id", existente.id);
    else await supabase.from("presupuestos").insert([{ categoria: budgetForm.categoria, monto_limite: parseFloat(budgetForm.monto_limite), espacio_id: espacioActivo.id }]);
    setIsEditingBudget(false); setBudgetForm({ categoria: "", monto_limite: "" }); fetchData();
  };

  const eliminarPresupuesto = async (id: string) => {
    if(!confirm("¿Eliminar este tope presupuestario?")) return;
    setPresupuestos(prev => prev.filter(p => p.id !== id));
    await supabase.from("presupuestos").delete().eq("id", id);
  };

  const guardarGastoFijo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fijoForm.descripcion || !fijoForm.monto) return;
    const newFijo = { id: Date.now().toString(), pagado: false, ...fijoForm };
    const updated = [...gastosFijos, newFijo];
    setGastosFijos(updated);
    localStorage.setItem(`gastos_fijos_${espacioActivo.id}`, JSON.stringify(updated));
    setIsAddingFijo(false);
    setFijoForm({ descripcion: "", monto: "", dia_pago: "1" });
  };

  const confirmarPagoFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagoFijoActivo || !espacioActivo) return;

    const costo_usd = parseFloat(pagoFijoActivo.monto);
    const costo_bs = costo_usd * rates.usdt; // Asumimos tasa paralelo para gastos fijos
    const desc = `Pago Fijo: ${pagoFijoActivo.descripcion}`;

    // Modificamos el estado local para marcarlo como pagado
    const updated = gastosFijos.map((gf:any) => gf.id === pagoFijoActivo.id ? { ...gf, pagado: true } : gf);
    setGastosFijos(updated);
    localStorage.setItem(`gastos_fijos_${espacioActivo.id}`, JSON.stringify(updated));

    if (!isGuest) {
      await supabase.from("transacciones_saas").insert([{ 
        descripcion: desc, 
        monto_original: monedaFijo === 'bs' ? costo_bs : costo_usd, 
        moneda_original: monedaFijo, 
        monto_bs: costo_bs, 
        monto_usd_bcv: costo_usd, 
        monto_usd_paralelo: costo_usd, 
        categoria: "internet", // Categoría genérica para fijos
        usuario: perfil?.nombre || session?.user?.email?.split('@')[0] || "Tú", 
        tipo: "egreso", 
        espacio_id: espacioActivo.id, 
        usuario_id: session.user.id 
      }]);
    }
    
    fetchData();
    triggerToast("egreso", "Gasto Fijo descontado de tu liquidez.");
    setPagoFijoActivo(null);
  };

  const toggleGastoFijo = (id: string) => {
    const updated = gastosFijos.map(gf => gf.id === id ? { ...gf, pagado: !gf.pagado } : gf);
    setGastosFijos(updated);
    localStorage.setItem(`gastos_fijos_${espacioActivo.id}`, JSON.stringify(updated));
  };

  const eliminarGastoFijo = (id: string) => {
    if(!confirm("¿Eliminar este gasto fijo?")) return;
    const updated = gastosFijos.filter(gf => gf.id !== id);
    setGastosFijos(updated);
    localStorage.setItem(`gastos_fijos_${espacioActivo.id}`, JSON.stringify(updated));
  };

  const toggleCashea = async (cuota: any) => {
    const nuevoEstado = !cuota.pagado;
    await supabase.from("cashea").update({ pagado: nuevoEstado }).eq("id", cuota.id);
    if (nuevoEstado) {
      const costo_bs = cuota.monto_cuota * rates.bcv;
      if (confirm(`¿Descontar Bs. ${costo_bs.toFixed(2)} (Equivalente a $${cuota.monto_cuota}) del balance en Bolívares de ${cuota.usuario} por el pago de Cashea?`)) {
        const costo_real_usdt = rates.usdt > 0 ? costo_bs / rates.usdt : cuota.monto_cuota;
        
        await supabase.from("transacciones_saas").insert([{ 
          descripcion: `Pago Cashea: ${cuota.articulo}`, 
          monto_original: costo_bs,       // <-- AHORA EL MONTO PRINCIPAL ES EN BS
          moneda_original: "bs",          // <-- AHORA DESCUENTA DE LA BILLETERA DE BOLÍVARES
          monto_bs: costo_bs, 
          monto_usd_bcv: cuota.monto_cuota, 
          monto_usd_paralelo: costo_real_usdt, 
          categoria: "cashea", 
          usuario: cuota.usuario, 
          tipo: "egreso", 
          espacio_id: espacioActivo.id, 
          usuario_id: session.user.id 
        }]);
        triggerToast("egreso");
      } else { 
        await supabase.from("cashea").update({ pagado: false }).eq("id", cuota.id); 
      }
    }
    fetchData();
  };

  const guardarPote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificarLimiteInvitado()) return;

    const nombreFinal = poteForm.tipo === "Personalizado ✍️" ? poteForm.nombreCustom : poteForm.tipo;
    if (!nombreFinal || !poteForm.monto_objetivo) return;

    if (isGuest) {
      const newPote = { id: Date.now().toString(), nombre: nombreFinal, monto_objetivo: parseFloat(poteForm.monto_objetivo) };
      const updatedPotes = [...potes, newPote];
      setPotes(updatedPotes);
      localStorage.setItem('mipote_guest_potes', JSON.stringify(updatedPotes));
    } else {
      if (poteForm.id) await supabase.from("metas").update({ nombre: nombreFinal, monto_objetivo: parseFloat(poteForm.monto_objetivo) }).eq("id", poteForm.id);
      else await supabase.from("metas").insert([{ nombre: nombreFinal, monto_objetivo: parseFloat(poteForm.monto_objetivo), espacio_id: espacioActivo.id }]);
      fetchData();
    }
    setIsAddingPote(false);
    setPoteForm({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
  };

  const eliminarPote = async (id: string) => {
    setPotes(prev => prev.filter(p => p.id !== id));
    await supabase.from("metas").delete().eq("id", id);
  };

  // Abona plata a una meta: sale de la liquidez (transferencia_salida) y entra al pote (pote_<id>).
  const abonarMeta = async (poteId: string, monto: number, moneda: string) => {
    if (!espacioActivo || !poteId || !monto) return;
    const poteDestino = potes.find((p: any) => p.id === poteId);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(monto, moneda);
    if (!isGuest) {
      if (espacioActivo.tipo === 'individual') {
        await supabase.from("transacciones_saas").insert([{ descripcion: `Abono a meta: ${poteDestino?.nombre}`, monto_original: monto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_salida', usuario: usuario || "Tú", tipo: 'egreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
      }
      await supabase.from("transacciones_saas").insert([{ descripcion: `Abono recibido`, monto_original: monto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: `pote_${poteId}`, usuario: usuario || "Tú", tipo: 'ingreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
    }
    fetchData(); triggerToast("ingreso", "¡Abono sumado a tu meta! 🍯");
  };

  // Retira plata de una meta: sale del pote (pote_<id>) y vuelve a la liquidez (transferencia_entrada).
  const retirarMeta = async (poteId: string, monto: number, moneda: string) => {
    if (!espacioActivo || !poteId || !monto) return;
    const poteDestino = potes.find((p: any) => p.id === poteId);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(monto, moneda);
    if (!isGuest) {
      if (espacioActivo.tipo === 'individual') {
        await supabase.from("transacciones_saas").insert([{ descripcion: `Retiro de meta: ${poteDestino?.nombre}`, monto_original: monto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_entrada', usuario: usuario || "Tú", tipo: 'ingreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
      }
      await supabase.from("transacciones_saas").insert([{ descripcion: `Retiro realizado`, monto_original: monto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: `pote_${poteId}`, usuario: usuario || "Tú", tipo: 'egreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
    }
    fetchData(); triggerToast("egreso", "Retiro de meta realizado 📉");
  };

  // Al cerrar una sesión de "Hacer Mercado" se crea UNA sola transacción de egreso con el
  // total (real si lo dieron, estimado si no); el detalle de productos vive en items_mercado.
  const finalizarSesionMercado = async ({ totalUsd, cantidadItems }: { totalUsd: number; cantidadItems: number }) => {
    if (!espacioActivo || isGuest) return;
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(totalUsd, 'usdt');
    const usuarioNombre = (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú";

    const { error } = await supabase.from("transacciones_saas").insert([{
      descripcion: `Mercado (${cantidadItems} producto${cantidadItems === 1 ? '' : 's'})`,
      monto_original: totalUsd,
      moneda_original: 'usd',
      monto_bs,
      monto_usd_bcv,
      monto_usd_paralelo,
      categoria: 'mercado',
      usuario: usuarioNombre,
      tipo: 'egreso',
      espacio_id: espacioActivo.id,
      usuario_id: session.user.id,
    }]);

    if (error) alert("🚨 Error registrando el mercado: " + error.message);
    else fetchData();
  };

  const handleEmergenciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || (!usuario.trim() && espacioActivo?.tipo !== 'individual')) { 
      alert("Completa el detalle y quién aportó/retiró."); 
      return; 
    }

    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);
    
    if (isGuest) {
      const newTx = { id: Date.now().toString(), descripcion: `Emergencia - ${descripcion}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'emergencia', usuario: usuario || "Tú", tipo, created_at: new Date().toISOString() };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx); localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
      setMonto(""); setDescripcion(""); triggerToast(tipo);
    } else {
      const { error } = await supabase.from("transacciones_saas").insert([{
        descripcion: `Emergencia - ${descripcion}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'emergencia', usuario: usuario || "Tú", tipo, espacio_id: espacioActivo.id, usuario_id: session.user.id
      }]);
      if (error) alert("🚨 Error: " + error.message);
      else { setMonto(""); setDescripcion(""); fetchData(); triggerToast(tipo); }
    }
    setIsAddingEmergencia(false);
  };

  const handleEmergenciaAction = async (monto: number, tipoMovimiento: 'ingreso' | 'egreso', descripcionMovimiento: string) => {
    if (!espacioActivo) return;
    const usuarioNombre = perfil?.nombre || session?.user?.email?.split('@')[0] || "Tú";
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(monto, 'usd');

    if (isGuest) {
      const newTx = {
        id: Date.now().toString(),
        descripcion: `Emergencia - ${descripcionMovimiento}`,
        monto_original: monto,
        moneda_original: 'usd',
        monto_bs,
        monto_usd_bcv,
        monto_usd_paralelo,
        categoria: 'emergencia',
        usuario: usuarioNombre,
        tipo: tipoMovimiento,
        created_at: new Date().toISOString(),
      };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
      triggerToast?.(tipoMovimiento, 'Movimiento registrado');
    } else {
      const { error } = await supabase.from('transacciones_saas').insert([{
        descripcion: `Emergencia - ${descripcionMovimiento}`,
        monto_original: monto,
        moneda_original: 'usd',
        monto_bs,
        monto_usd_bcv,
        monto_usd_paralelo,
        categoria: 'emergencia',
        usuario: usuarioNombre,
        tipo: tipoMovimiento,
        espacio_id: espacioActivo.id,
        usuario_id: session?.user?.id,
      }]);
      if (error) alert("🚨 Error: " + error.message);
      else { fetchData(); triggerToast?.(tipoMovimiento, 'Movimiento registrado'); }
    }
  };

  const agregarParticipante = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoPart.trim() || !espacioActivo) return;
    const { error } = await supabase.from("participantes").insert([{ nombre: nuevoPart.trim(), espacio_id: espacioActivo.id }]);
    if (error) { alert("🚨 Error al guardar participante: " + error.message); return; }
    setNuevoPart(""); fetchData(); 
  };

  const eliminarParticipante = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre} de este espacio?`)) return;
    await supabase.from("participantes").delete().eq("id", id);
    fetchData();
  };

  const renombrarParticipante = async (id: string, nombreNuevo: string) => {
    const nombreLimpio = nombreNuevo.trim();
    if (!nombreLimpio || isGuest) { setEditandoParticipanteId(null); return; }
    const { error } = await supabase.from("participantes").update({ nombre: nombreLimpio }).eq("id", id);
    if (error) { alert("🚨 Error al renombrar: " + error.message); return; }
    setEditandoParticipanteId(null);
    fetchData();
  };

  const getSaldosAislados = (userName?: string, incluirMetas: boolean = false) => {
    let bs = 0, usdt = 0, cash = 0;
    const extra: Record<string, number> = {};
    transactions.forEach(tx => {
      // Si NO incluimos metas y la transacción es de una meta, la ignoramos
      if (!incluirMetas && (tx.categoria.startsWith("pote_") || tx.categoria === 'emergencia')) return; 
      
      let fraction = 0;
      const txUser = tx.usuario?.trim();
      const targetUser = userName?.trim();

      if (!userName || userName === 'ALL' || espacioActivo?.tipo === 'individual') fraction = 1;
      else {
          if (txUser === targetUser || (txUser === 'Tú' && targetUser === (perfil?.nombre || session?.user?.email?.split('@')[0]))) fraction = 1;
          else if (txUser === 'Ambos' || txUser === 'Todos (Div)') fraction = 1 / (espacioActivo?.tipo === 'vaca' ? Math.max(participantes.length, 1) : 2);
      }

      if (fraction > 0) {
        const montoNominal = tx.monto_original || tx.monto_usd_paralelo || 0;
        const signo = tx.tipo === "ingreso" ? 1 : -1;
        const valorReal = montoNominal * signo * fraction;
        const monedaEstricta = tx.moneda_original || (montoNominal > 1000 ? 'bs' : 'usd');

        if (monedaEstricta === 'bs') bs += valorReal;
        else if (monedaEstricta === 'cash') cash += valorReal;
        else if (monedaEstricta === 'usdt' || monedaEstricta === 'usd') usdt += valorReal;
        else extra[monedaEstricta] = (extra[monedaEstricta] || 0) + valorReal;
      }
    });
    return { bs, usdt, cash, extra };
  };

  // Liquidez real disponible para gastar (excluye lo guardado en metas/potes), en USD.
  // userName sigue las mismas reglas que getSaldosAislados: 'ALL'/undefined = todo el espacio.
  const getLiquidezTotal = (userName?: string) => {
    const s = getSaldosAislados(userName, false);
    const usdtMasCash = s.usdt + s.cash;
    const extraEnUsd = Object.entries(s.extra || {}).reduce((acc, [id, val]) => {
      const tasaValor = getValorTasa(id as TasaId, rates);
      return acc + (tasaValor > 0 ? (val as number) / tasaValor : 0);
    }, 0);
    return {
      paralelo: usdtMasCash + (rates.usdt > 0 ? s.bs / rates.usdt : 0) + extraEnUsd,
      bcv: usdtMasCash + (rates.bcv > 0 ? s.bs / rates.bcv : 0) + extraEnUsd,
    };
  };

const getPatrimonioNeto = () => {
    let totalEnBolivaresVirtuales = 0;

    // 🔥 FILTRAMOS SOLO LAS TRANSACCIONES DEL ESPACIO ACTIVO
    // Y EXCLUIMOS CATEGORÍAS QUE NO SON PATRIMONIO REAL
    const transaccionesValidas = transactions.filter(tx => {
      // Excluir transferencias entre espacios (se duplic​an)
      if (tx.categoria === 'transferencia_salida' || tx.categoria === 'transferencia_entrada') return false;
      // Excluir transacciones que son simplemente movimientos internos
      if (tx.categoria === 'cambio_p2p') return false;
      // Excluir abonos/retiros de metas: su contrapartida (transferencia_salida/entrada)
      // ya está excluida arriba, así que sin esto un abono "inventaba" patrimonio y un
      // retiro lo "borraba", cuando en realidad solo es plata que cambia de bolsillo.
      if (tx.categoria.startsWith('pote_')) return false;
      return true;
    });

    transaccionesValidas.forEach(tx => {
      const signo = tx.tipo === "ingreso" ? 1 : -1;
      const montoOriginal = tx.monto_original || 0;
      const moneda = tx.moneda_original || (montoOriginal > 1000 ? 'bs' : 'usd');

      if (moneda === 'bs') {
        // Si ya son bolívares, los sumamos directo
        totalEnBolivaresVirtuales += (montoOriginal * signo);
      } else {
        // Monedas extranjeras "editables" (ej. Peso Colombiano/Mexicano): primero a USD con su propia tasa
        const tasaForanea = TASAS_DISPONIBLES.find(t => t.id === moneda && t.kind === 'foreign_per_usd');
        const montoEnUsd = tasaForanea
          ? (getValorTasa(tasaForanea.id, rates) > 0 ? montoOriginal / getValorTasa(tasaForanea.id, rates) : 0)
          : montoOriginal; // USDT/CASH ya están en USD 1:1

        // Y de ahí a Bs. usando la tasa PARALELO para saber cuánta "plata real" representan en la calle.
        totalEnBolivaresVirtuales += (montoEnUsd * signo * rates.usdt);
      }
    });

    // Ahora, esa "montaña de bolívares" la expresamos en la moneda que elijas
    return {
      // Valor en dólares reales (mercado paralelo)
      paralelo: rates.usdt > 0 ? totalEnBolivaresVirtuales / rates.usdt : 0,
      
      // Valor en dólares oficiales (BCV) -> AQUÍ ES DONDE EL MONTO VA A SUBIR
      bcv: rates.bcv > 0 ? totalEnBolivaresVirtuales / rates.bcv : 0
    };
  };

  // Antes de registrar un egreso mayor a la liquidez disponible, avisamos y (si hay plata
  // guardada en metas que cubra la diferencia) ofrecemos retirarla automáticamente de ahí,
  // en vez de dejar al usuario en saldo negativo sin darse cuenta.
  const verificarFondosSuficientes = async (montoUsdParalelo: number, usuarioObjetivo?: string): Promise<{ ok: boolean; retiros: { poteId: string; monto: number }[] }> => {
    const liquidez = getLiquidezTotal(usuarioObjetivo).paralelo;
    if (montoUsdParalelo <= liquidez + 0.01) return { ok: true, retiros: [] };

    const faltante = montoUsdParalelo - liquidez;
    const patrimonio = getPatrimonioNeto().paralelo;

    if (montoUsdParalelo <= patrimonio + 0.01) {
      // No alcanza en liquidez, pero sí en el patrimonio total: hay plata guardada en metas.
      const metasConSaldo = potes
        .map((p: any) => ({ id: p.id, nombre: p.nombre, ahorrado: getPoteAhorrado(p.id, p.nombre) }))
        .filter((p: any) => p.ahorrado > 0.01)
        .sort((a: any, b: any) => b.ahorrado - a.ahorrado);

      const retiros: { poteId: string; monto: number }[] = [];
      let restante = faltante;
      for (const m of metasConSaldo) {
        if (restante <= 0.01) break;
        const aRetirar = Math.min(m.ahorrado, restante);
        retiros.push({ poteId: m.id, monto: aRetirar });
        restante -= aRetirar;
      }

      if (restante <= 0.01) {
        const detalle = retiros.map(r => {
          const nombre = metasConSaldo.find(m => m.id === r.poteId)?.nombre || 'meta';
          return `${nombre}: $${r.monto.toFixed(2)}`;
        }).join(', ');
        const confirmado = confirm(`No tienes suficiente liquidez para este gasto (te faltan $${faltante.toFixed(2)}), pero sí lo tienes ahorrado en tus metas.\n\nSe retirará automáticamente de: ${detalle}.\n\n¿Continuar con el registro?`);
        return confirmado ? { ok: true, retiros } : { ok: false, retiros: [] };
      }
    }

    // No alcanza ni sumando lo guardado en metas: esto te dejaría en saldo negativo.
    const confirmado = confirm(`⚠️ No tienes fondos suficientes para este gasto (te faltan $${faltante.toFixed(2)}, ni siquiera contando tus metas). Vas a quedar en saldo negativo.\n\n¿Deseas continuar de todas formas?`);
    return confirmado ? { ok: true, retiros: [] } : { ok: false, retiros: [] };
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold text-xs mb-1">{payload[0].name}</p>
          <p className="text-xs font-sans tabular-nums text-purple-400">
            ${payload[0].value.toFixed(2)} USDT
          </p>
        </div>
      );
    }
    return null;
  };

  const renderTabContent = () => {
    const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));
    const transaccionesFiltradas = transaccionesDelMes.filter(tx => filtroHistorial === "Todos" || tx.usuario === filtroHistorial);
    // Los retiros de metas (categoria pote_<id>) no son un gasto real: es plata que vuelve
    // a tu liquidez, así que no deben inflar el gráfico de gastos del mes.
    const gastosDelMesCalculados = transaccionesDelMes.filter(tx => tx.tipo === 'egreso' && tx.categoria !== 'transferencia_salida' && tx.categoria !== 'cambio_p2p' && !tx.categoria.startsWith('pote_'));
 // 🔥 MAPEO DE GASTOS PARA GRÁFICO SEGURO
    const gastosPorCategoriaValor = gastosDelMesCalculados.reduce((acc, tx) => {
      let catName = tx.categoria === 'emergencia' ? 'Emergencias 🚨' :
                    (categoriasList.find(c => c.valor === tx.categoria)?.label || tx.categoria);
      
      // Si es cashea descuenta a tasa BCV, sino a Paralelo
      const montoAUsar = tx.categoria === 'cashea' ? (tx.monto_usd_bcv || 0) : (tx.monto_usd_paralelo || 0);
      acc[catName] = (acc[catName] || 0) + montoAUsar;
      
      return acc;
    }, {} as Record<string, number>);

    const dataGraficoTorta = Object.keys(gastosPorCategoriaValor).map(key => ({ name: key, value: gastosPorCategoriaValor[key] })).sort((a, b) => b.value - a.value);
    const COLORS = [theme.stroke, '#ec4899', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'];
    
    if (activeTab === 'recordatorios') {
      return (
        <RecordatoriosTab
          espacioActivo={espacioActivo}
          recordatorios={recordatorios}
          theme={theme}
          onAgregarRecordatorio={async (texto: string) => {
            if (!texto.trim() || isGuest || !espacioActivo) return;
            const { error } = await supabase.from('recordatorios').insert([{ texto, espacio_id: espacioActivo.id, usuario_id: session?.user?.id }]);
            if (!error) fetchData();
          }}
          onToggleRecordatorio={async (id: string, completado: boolean) => {
            if (isGuest) return;
            await supabase.from('recordatorios').update({ completado: !completado }).eq('id', id);
            fetchData();
          }}
          onEliminarRecordatorio={async (id: string) => {
            if (isGuest) return;
            await supabase.from('recordatorios').delete().eq('id', id);
            fetchData();
          }}
          triggerToast={triggerToast}
        />
      );
    }

    if (activeTab === 'calculadora' || forceTab === 'calculadora') {
      return (
        <CalculadoraTab
          rates={rates}
          activeRates={activeRates}
          setActiveRates={setActiveRates}
          theme={theme}
          triggerToast={triggerToast}
          onBack={() => { onChangeView('dashboard'); setActiveTab('inicio'); }}
          puedeEscanear={puedeEscanear}
          registrarEscaneo={registrarEscaneo}
          onTriggerPaywall={onTriggerPaywall}
          onRegistrarGasto={(montoValue: number, monedaOrigenCalc: 'usd' | 'bs' | 'eur') => {
            // El monto entra en la moneda que se sostiene de verdad (usdt/bs); el € solo existe
            // como referencia de cálculo, así que lo convertimos a su equivalente en Bs (tasa BCV).
            const monedaForm = monedaOrigenCalc === 'usd' ? 'usdt' : 'bs';
            const montoForm = monedaOrigenCalc === 'eur' ? montoValue * (rates.eur_bcv || 0) : montoValue;
            if (!montoForm || montoForm <= 0) return;
            setTipo("egreso");
            setCategoria("");
            setMoneda(monedaForm);
            setMonto(montoForm.toFixed(2));
            onChangeView('dashboard');
            setActiveTab('inicio');
            setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 200);
          }}
        />
      );
    }

    if (activeTab === 'emergencia') {
      return (
        <EmergenciaTab
          espacioActivo={espacioActivo}
          perfil={perfil}
          session={session}
          transactions={transactions}
          theme={theme}
          onAgregarEmergencia={conUnSoloClick(handleEmergenciaAction)}
          onEliminarTransaccion={eliminarTransaccion}
          triggerToast={triggerToast}
        />
      );
    }

    if (activeTab === 'pagos') {
      const presupuestosPorCategoria = presupuestos.map(p => {
        const gastoActual = gastosPorCategoriaValor[p.categoria] || 0;
        const porcentaje = p.monto_limite > 0 ? Math.min((gastoActual / p.monto_limite) * 100, 100) : 0;
        const isOver = gastoActual > p.monto_limite;
        const barColor = isOver ? 'bg-rose-600' : porcentaje > 80 ? 'bg-rose-500' : porcentaje > 50 ? 'bg-amber-500' : 'bg-emerald-500';
        let catLabel = p.categoria === 'cashea' ? 'Cashea' : p.categoria === 'otro' ? 'Otro' : categoriasList.find(c => c.valor === p.categoria)?.label || p.categoria;
        return { ...p, gastoActual, porcentaje, isOver, barColor, catLabel };
      });

      return (
        <div className="space-y-4 md:space-y-6 mt-6">
          
          {transaccionesDelMes.length > 0 && (
            <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col min-h-[300px]">
              <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className={`w-4 h-4 ${theme.text}`}/> Distribución Egresos
              </h3>
              <div className="flex-1 w-full min-h-[250px]">
                {dataGraficoTorta.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <PieChart>
                      <Pie data={dataGraficoTorta} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {dataGraficoTorta.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : ( <div className="h-full flex items-center justify-center text-[10px] text-white/50 italic">No hay gastos en este mes.</div> )}
              </div>
            </div>
          )}

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400"/> Control Presupuestario
              </h3>
              <button onClick={() => setIsEditingBudget(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}>
                <Plus className="w-3 h-3" /> Nuevo Tope
              </button>
            </div>

            <Drawer.Root open={isEditingBudget} onOpenChange={setIsEditingBudget}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-rose-500">
                  <Drawer.Title className="sr-only">Nuevo Límite</Drawer.Title>
                  <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Fijar Límite Mensual</h3>
                    <form onSubmit={conUnSoloClick(guardarPresupuesto)} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Categoría a limitar</label>
                        <select value={budgetForm.categoria} onChange={e => setBudgetForm({...budgetForm, categoria: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer appearance-none focus:border-rose-500" required>
                          <option value="" className="bg-[#1a0f2e]">Selecciona Categoría...</option>
                          {categoriasList.map(c => <option key={c.id || c.valor} value={c.valor} className="bg-[#1a0f2e]">{c.label}</option>)}
                        </select>
                      </div>
                      <div className="min-h-[80px]">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Máximo ($)</label>
                        <input type="number" step="0.01" placeholder="0.00" value={budgetForm.monto_limite} onChange={e => setBudgetForm({...budgetForm, monto_limite: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums tracking-tight outline-none focus:border-rose-500`} required />
                      </div>
                      <button type="submit" className="w-full bg-rose-500 text-black font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] mt-6 active:scale-95 transition-transform">Guardar Límite</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <div className="space-y-4">
              {presupuestosPorCategoria.length === 0 ? (
                <div className="border border-dashed border-rose-500/20 rounded-2xl p-5 text-center">
                  <Target className="w-8 h-8 text-rose-400/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white/70 mb-1">Aún no tienes límites de gasto</p>
                  <p className="text-[10px] text-white/40 mb-4">Fija un tope mensual por categoría para no pasarte.</p>
                  <button onClick={() => setIsEditingBudget(true)} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors">
                    + Crear mi primer tope
                  </button>
                </div>
              ) : (
                presupuestosPorCategoria.map(p => (
                  <div key={p.id} className="space-y-1.5 relative group">
                    <div className="flex justify-between text-xs md:text-sm text-white">
                      <span className="font-bold flex items-center gap-2">
                        {p.catLabel}
                        <button onClick={() => eliminarPresupuesto(p.id)} className="p-1 -m-1 text-white/40 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                      </span>
                      <span className="font-sans tabular-nums tracking-tight">
                        <span className={p.isOver ? 'text-rose-400 font-black' : ''}>$<AnimatedNum value={p.gastoActual} /></span> 
                        <span className="text-white/50"> / ${p.monto_limite}</span>
                      </span>
                    </div>
                    <div className="h-2 md:h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${p.barColor}`} style={{ width: `${p.porcentaje || 0}%` }}></div>
                    </div>
                    {p.isOver && <p className="text-[8px] md:text-[9px] text-rose-400 text-right uppercase tracking-widest mt-0.5">Límite Excedido</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><Home className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`}/> Gastos Fijos</h3>
              <button onClick={() => setIsAddingFijo(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}><Plus className="w-3 h-3"/> Nuevo Fijo</button>
            </div>

            <Drawer.Root open={isAddingFijo} onOpenChange={setIsAddingFijo}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-white/5">
                  <Drawer.Title className="sr-only">Registrar Gasto Fijo</Drawer.Title>
                  <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Gasto Fijo</h3>
                    
                    <form onSubmit={conUnSoloClick(guardarGastoFijo)} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Descripción (Ej: Condominio, Internet)</label>
                        <input type="text" placeholder="Ej: Condominio Mensual" value={fijoForm.descripcion} onChange={e => setFijoForm({...fijoForm, descripcion: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500" required />
                      </div>
                      <div className="flex gap-4 items-start min-h-[80px]">
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto ($)</label>
                          <input type="number" step="0.01" placeholder="0.00" value={fijoForm.monto} onChange={e => setFijoForm({...fijoForm, monto: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-emerald-500`} required />
                        </div>
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Día de Pago (1 al 31)</label>
                          <input type="number" min="1" max="31" value={fijoForm.dia_pago} onChange={e => setFijoForm({...fijoForm, dia_pago: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-emerald-500`} required />
                        </div>
                      </div>
                      <button type="submit" className={`w-full bg-emerald-500 text-black font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 active:scale-95 transition-transform`}>Guardar Fijo</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            {/* DRAWER PARA CONFIRMAR PAGO DE GASTO FIJO */}
            <Drawer.Root open={!!pagoFijoActivo} onOpenChange={(open) => !open && setPagoFijoActivo(null)}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-auto fixed bottom-0 left-0 right-0 z-[250] border-t border-emerald-500 pb-8">
                  <Drawer.Title className="sr-only">Pagar Gasto Fijo</Drawer.Title>
                  <div className="p-6">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-2 text-center">Pagar Gasto Fijo</h3>
                    <p className="text-center text-white/50 text-sm mb-6">{pagoFijoActivo?.descripcion}</p>
                    
                    <form onSubmit={conUnSoloClick(confirmarPagoFijo)} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿De qué cuenta salió el dinero?</label>
                        <select value={monedaFijo} onChange={e => setMonedaFijo(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-emerald-500 appearance-none">
                          <option value="bs">Bolívares (Pago Móvil / Banco)</option>
                          <option value="usdt">USDT (Zinli / Binance)</option>
                          <option value="cash">Efectivo (Cash)</option>
                        </select>
                      </div>
                      
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mt-2">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1 font-bold">Monto a descontar</p>
                        <p className="text-2xl font-black text-emerald-400 font-sans tabular-nums">${parseFloat(pagoFijoActivo?.monto || '0').toFixed(2)}</p>
                      </div>

                      <button type="submit" className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg mt-4 active:scale-95 transition-transform">
                        Confirmar y Descontar
                      </button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <div className="space-y-2">
              {gastosFijos.length === 0 ? (
                <div className={`border border-dashed ${theme.border} rounded-2xl p-5 text-center`}>
                  <Home className={`w-8 h-8 ${theme.text} opacity-60 mx-auto mb-2`} />
                  <p className="text-xs font-bold text-white/70 mb-1">No tienes gastos fijos registrados</p>
                  <p className="text-[10px] text-white/40 mb-4">Agrega tus pagos recurrentes (renta, internet, condominio) para no olvidarlos.</p>
                  <button onClick={() => setIsAddingFijo(true)} className={`text-[10px] font-black uppercase tracking-widest ${theme.text} hover:text-white transition-colors`}>
                    + Agregar gasto fijo
                  </button>
                </div>
              ) : gastosFijos.map((gf:any) => (
                <div key={gf.id} className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${gf.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : `bg-black/40 ${theme.border}`}`}>
                  <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => {
    if (gf.pagado) {
        // Si ya estaba pagado, lo desmarcamos sin devolver el dinero (para evitar duplicados)
        const updated = gastosFijos.map((g:any) => g.id === gf.id ? { ...g, pagado: false } : g);
        setGastosFijos(updated); localStorage.setItem(`gastos_fijos_${espacioActivo.id}`, JSON.stringify(updated));
    } else {
        // Abrir el modal de pago
        setPagoFijoActivo(gf);
    }
}}>
                    {gf.pagado ? <CheckSquare className="text-emerald-400 w-5 h-5"/> : <Square className={`${theme.text} w-5 h-5`}/>}
                    <div>
                      <p className="text-xs md:text-sm font-bold text-white">{gf.descripcion}</p>
                      <p className={`text-[10px] text-white/40 mt-0.5`}>Se paga los días {gf.dia_pago}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-sans tabular-nums tracking-tight font-black ${gf.pagado ? 'text-emerald-400/50' : 'text-rose-400'}`}>${parseFloat(gf.monto).toFixed(2)}</span>
                    <button onClick={(e) => { e.stopPropagation(); eliminarGastoFijo(gf.id); }} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`}/> Cashea</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (!puedeEscanear()) { onTriggerPaywall?.(); return; } casheaScanInputRef.current?.click(); }}
                  disabled={isScanningCashea}
                  className="flex items-center gap-1 bg-white/5 text-white/70 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors disabled:opacity-50"
                >
                  {isScanningCashea ? <Loader2 className="w-3 h-3 animate-spin"/> : <Camera className="w-3 h-3"/>} Escanear Cuotas
                </button>
                <input type="file" accept="image/*" ref={casheaScanInputRef} onChange={handleScanCashea} className="hidden" />
                <button onClick={() => setIsAddingCashea(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}><Plus className="w-3 h-3"/> Nuevo Pago</button>
              </div>
            </div>

            <Drawer.Root open={isAddingCashea} onOpenChange={setIsAddingCashea}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
                  <Drawer.Title className="sr-only">Registrar Cuota Cashea</Drawer.Title>
                  <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Cuota Cashea</h3>
                    
                    <form onSubmit={conUnSoloClick(agregarCashea)} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Qué compraste?</label>
                        <input type="text" placeholder="Ej: Zapatos Nike" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500" required />
                      </div>
                      <div className="flex gap-4 items-start min-h-[80px]">
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Cuota ($)</label>
                          <input type="number" step="0.01" placeholder="0.00" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white font-sans tabular-nums tracking-tight font-black outline-none focus:border-purple-500`} required />
                        </div>
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Fecha de Pago</label>
                          <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500 h-[64px]`} required />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Responsable</label>
                        <select required value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer appearance-none focus:border-purple-500`}>
                          <option value="">¿Quién debe pagar?</option>
                          {espacioActivo?.tipo === 'individual' ? <option value={(perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado"}>Tú</option> : nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <button type="submit" className={`w-full bg-purple-600 text-white font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-6 active:scale-95 transition-transform`}>Guardar Cuota</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            {/* DRAWER DE REVISIÓN: CUOTAS DETECTADAS POR IA EN LA CAPTURA DE CASHEA */}
            <Drawer.Root open={cuotasEscaneadas.length > 0} onOpenChange={(open) => !open && setCuotasEscaneadas([])}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
                  <Drawer.Title className="sr-only">Confirmar Cuotas Detectadas</Drawer.Title>
                  <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-2 text-center">Cuotas Detectadas</h3>
                    <p className="text-center text-white/50 text-xs mb-6">Revisa y desmarca las que no quieras registrar.</p>

                    <div className="space-y-2 mb-6">
                      {cuotasEscaneadas.map((c, idx) => (
                        <button
                          key={c.clave}
                          type="button"
                          onClick={() => setCuotasEscaneadas(prev => prev.map((it, i) => i === idx ? { ...it, seleccionado: !it.seleccionado } : it))}
                          className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition-colors ${c.seleccionado ? 'bg-purple-500/10 border-purple-500/40' : 'bg-black/40 border-white/5 opacity-50'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {c.seleccionado ? <CheckSquare className="text-purple-400 w-5 h-5 shrink-0"/> : <Square className="text-white/40 w-5 h-5 shrink-0"/>}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{c.articulo}</p>
                              <p className="text-[10px] text-white/40">
                                {c.cuota_actual && c.cuota_total ? `Cuota ${c.cuota_actual} de ${c.cuota_total} · ` : ''}Vence: {c.fecha_pago}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-white tabular-nums shrink-0">${Number(c.monto_cuota).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={conUnSoloClick(confirmarCuotasEscaneadas)}
                      className="w-full bg-purple-600 text-white font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 transition-transform"
                    >
                      Registrar {cuotasEscaneadas.filter(c => c.seleccionado).length} cuota{cuotasEscaneadas.filter(c => c.seleccionado).length === 1 ? '' : 's'}
                    </button>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <div className="space-y-2">
              {cuotasCashea.length === 0 ? (
                <div className="border border-dashed border-purple-500/20 rounded-2xl p-5 text-center">
                  <button
                    type="button"
                    onClick={() => { if (!puedeEscanear()) { onTriggerPaywall?.(); return; } casheaScanInputRef.current?.click(); }}
                    disabled={isScanningCashea}
                    className="w-full flex flex-col items-center gap-2 disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      {isScanningCashea ? <Loader2 className="w-6 h-6 text-purple-400 animate-spin" /> : <Camera className="w-6 h-6 text-purple-400" />}
                    </div>
                    <p className="text-xs font-bold text-white/70">No tienes cuotas registradas</p>
                    <p className="text-[10px] text-white/40 -mt-1">Escanea una captura de tus cuotas de Cashea y las cargamos por ti.</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Escanear captura</span>
                  </button>
                  <button type="button" onClick={() => setIsAddingCashea(true)} className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mt-3">
                    o agrégala a mano
                  </button>
                </div>
              ) : cuotasCashea.map(cuota => (
                <div key={cuota.id} className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : `bg-black/40 ${theme.border}`}`}>
                  <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={conUnSoloClick(() => toggleCashea(cuota))}>
                    {cuota.pagado ? <CheckSquare className="text-emerald-400 w-5 h-5"/> : <Square className={`${theme.text} w-5 h-5`}/>}
                    <div>
                      <p className="text-xs md:text-sm font-bold text-white">
                        {cuota.articulo} <span className={`text-[8px] md:text-[10px] ${theme.text} font-normal ml-1 ${theme.lightBg} px-2 py-0.5 rounded-md`}>{cuota.usuario || 'Usuario'}</span>
                      </p>
                      <p className={`text-[10px] text-white/40 mt-0.5`}>Vence: {cuota.fecha_pago}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-sans tabular-nums tracking-tight font-black ${cuota.pagado ? 'text-emerald-400/50' : 'text-rose-400'}`}>${cuota.monto_cuota}</span>
                    <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar esta cuota de Cashea?")) { setCuotasCashea(prev => prev.filter(c => c.id !== cuota.id)); await supabase.from('cashea').delete().eq('id', cuota.id); } }} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col">
             <div className={`p-3 border-b border-white/5 bg-black/20 flex flex-col gap-3`}>
                <div className={`flex justify-between items-center text-xs font-bold uppercase text-white/70`}>
                  <span>Historial del Mes</span>
                  <div className="flex items-center gap-2">
                    <input type="month" value={mesActual} onChange={(e) => setMesActual(e.target.value)} className={`bg-black/50 border ${theme.border} rounded-lg p-1 text-white outline-none text-[10px]`} />
                    <button
                      onClick={reiniciarMovimientos}
                      title="Reiniciar todos los movimientos"
                      className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg text-[10px] font-black normal-case tracking-normal transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Reiniciar Todo
                    </button>
                  </div>
                </div>
                {espacioActivo?.tipo !== 'individual' && filterOptions.length > 1 && (
                  <div className="flex flex-wrap gap-2 p-1 bg-black/50 rounded-xl">
                    {filterOptions.map(filtro => (
                      <button 
                        key={filtro}
                        onClick={() => setFiltroHistorial(filtro)}
                        className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg transition-colors ${filtroHistorial === filtro ? `${theme.primary} text-white` : `text-white/50 hover:${theme.lightBg}`}`}
                      >
                        {filtro}
                      </button>
                    ))}
                  </div>
                )}
             </div>
             <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                {transaccionesFiltradas.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-sm">No hay registros en este mes.</div>
                ) : transaccionesFiltradas.map((tx) => (
                  <div key={tx.id} className="p-3 flex justify-between hover:bg-white/5 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-1.5 rounded-xl shrink-0 ${tx.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.tipo === 'ingreso' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{tx.descripcion}</p>
                        <p className="text-[8px] text-white/40 uppercase truncate">{tx.usuario} • {new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-black font-sans tabular-nums tracking-tight ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          $<AnimatedNum value={tx.monto_usd_paralelo || 0} format="usd" />
                        </p>
                        {tx.moneda_original === 'bs' && (
                          <p className="text-[9px] text-white/30 font-sans tabular-nums font-medium">Bs. {(tx.monto_original || 0).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        )}
                      </div>
                      <button onClick={() => eliminarTransaccion(tx.id)} className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      );
    }

    if (activeTab === 'inicio') {
      const patrimonioTotal = getPatrimonioNeto();
      const saldoPrincipal = getSaldosAislados((perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado");
      const participantesVisibles = espacioActivo?.tipo !== 'individual' && participantes.length > 0;
      const metasActivas = potes.length > 0;

      // Churupito = liquidez real disponible para gastar (excluye lo que está guardado en metas/potes)
      const liquidezTotal = getLiquidezTotal((perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado");

      return (
        <div className="space-y-6">
          <div className="relative flex flex-col items-center justify-center py-10 text-center overflow-hidden">
            <div
              className={`absolute -top-10 w-64 h-64 rounded-full ${theme.primary} opacity-20 blur-3xl pointer-events-none`}
              aria-hidden="true"
            ></div>

            <div className={`relative w-11 h-11 rounded-2xl ${theme.lightBg} border ${theme.border} flex items-center justify-center mb-4`}>
              <identidadEspacio.Icono className={`w-5 h-5 ${theme.text}`} />
            </div>

            <div className="relative flex items-center gap-2 mb-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Churupitos</p>
              <button
                data-tutorial="ojito"
                onClick={toggleBalanceHidden}
                className="text-white/30 hover:text-white transition-colors"
                title={isBalanceHidden ? "Mostrar saldo" : "Ocultar saldo"}
              >
                {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              data-tutorial="patrimonio"
              onClick={() => setIsBalanceModalOpen(true)}
              className="relative flex flex-col items-center active:scale-95 transition-transform cursor-pointer"
            >
              <p className="text-6xl md:text-7xl font-black text-white tabular-nums leading-none">
                {isBalanceHidden ? "••••••" : (<>$<AnimatedNum value={patrimonioRate === 'paralelo' ? liquidezTotal.paralelo : liquidezTotal.bcv} format="usd" /></>)}
              </p>
            </button>
            <p className="relative text-sm text-white/50 mt-4 max-w-xl">
              {espacioActivo?.tipo === 'individual' ? 'Toca el monto para ver el desglose.' : `${identidadEspacio.etiqueta} · toca el monto para ver el desglose.`}
            </p>
            <div className="relative mt-8 inline-flex rounded-full bg-white/5 p-1 shadow-inner shadow-black/20">
              <button onClick={() => setPatrimonioRate('paralelo')} className={`px-5 py-2 text-[10px] font-black rounded-full transition ${patrimonioRate === 'paralelo' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                PARALELO
              </button>
              <button onClick={() => setPatrimonioRate('bcv')} className={`px-5 py-2 text-[10px] font-black rounded-full transition ${patrimonioRate === 'bcv' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                BCV OFICIAL
              </button>
            </div>
          </div>

          <Drawer.Root open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[55vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t-2" style={{ borderTopColor: theme.stroke }}>
                <Drawer.Title className="sr-only">Detalle de Liquidez</Drawer.Title>
                <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <h3 className="text-xl font-black text-white mb-6 text-center">Detalle de Liquidez</h3>
                  
               {espacioActivo?.tipo === 'individual' ? (
                    // VISTA DE LISTA MINIMALISTA (Basado en tu diseño de iOS)
                    <div className="space-y-3 px-1 mt-2">
                      
                      {/* Fila 1: Dólares Digitales */}
                      <div className="bg-[#1C1C1E] p-4 md:p-5 rounded-[1.25rem] flex justify-between items-center border border-white/5 transition-colors hover:border-purple-500/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <DollarSign className="text-purple-400 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Dólares Digitales</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">ZINLI, BINANCE, ETC.</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-white font-sans tabular-nums tracking-tight">
                          $<AnimatedNum value={saldoPrincipal.usdt} format="usd" />
                        </p>
                      </div>

                      {/* Fila 2: Bolívares */}
                      <div className="bg-[#1C1C1E] p-4 md:p-5 rounded-[1.25rem] flex justify-between items-center border border-white/5 transition-colors hover:border-blue-500/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Wallet className="text-blue-400 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Bolívares</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">PAGO MÓVIL, BANCOS</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white font-sans tabular-nums tracking-tight">
                            Bs. <AnimatedNum value={saldoPrincipal.bs} format="bs" />
                          </p>
                          <p className="text-[10px] text-blue-400 font-bold mt-0.5">
                            Eqv: $<AnimatedNum value={rates.bcv > 0 ? saldoPrincipal.bs / rates.bcv : 0} format="usd" />
                          </p>
                        </div>
                      </div>

                      {/* Fila 3: Efectivo */}
                      <div className="bg-[#1C1C1E] p-4 md:p-5 rounded-[1.25rem] flex justify-between items-center border border-white/5 transition-colors hover:border-amber-500/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <CheckSquare className="text-amber-400 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Efectivo</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">CASH FÍSICO</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-white font-sans tabular-nums tracking-tight">
                          $<AnimatedNum value={saldoPrincipal.cash} format="usd" />
                        </p>
                      </div>

                      {/* Filas de saldo real en monedas extranjeras editables (ej. Peso Colombiano, Peso Mexicano) */}
                      {TASAS_DISPONIBLES.filter(t => t.kind === 'foreign_per_usd' && activeRates.includes(t.id)).map(t => {
                        const saldoForaneo = saldoPrincipal.extra?.[t.id] || 0;
                        const tasaValor = getValorTasa(t.id, rates);
                        const usdEquiv = tasaValor > 0 ? saldoForaneo / tasaValor : 0;
                        return (
                          <div key={t.id} className={`bg-[#1C1C1E] p-4 md:p-5 rounded-[1.25rem] flex justify-between items-center border ${t.classes.border} transition-colors`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full ${t.classes.badgeBg} flex items-center justify-center border ${t.classes.border}`}>
                                <Globe className={`${t.classes.text} w-5 h-5`} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{t.label}</p>
                                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">EFECTIVO / SALDO</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xl font-black text-white font-sans tabular-nums tracking-tight">
                                  {saldoForaneo.toLocaleString(t.locale, { maximumFractionDigits: 0 })}
                                </p>
                                <p className={`text-[10px] ${t.classes.text} font-bold mt-0.5`}>
                                  Eqv: $<AnimatedNum value={usdEquiv} format="usd" />
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveRates(prev => prev.filter(id => id !== t.id))}
                                className="text-white/20 hover:text-rose-400 transition-colors"
                                title="Quitar moneda"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Filas extra: monedas de referencia elegidas por el usuario (solo vista, no son saldos reales) */}
                      {TASAS_DISPONIBLES.filter(t => t.id !== 'bcv' && t.id !== 'usdt' && t.kind !== 'foreign_per_usd' && activeRates.includes(t.id)).map(t => {
                        const valorConvertido = calcularResultadoTasa(t, 'usd', patrimonioTotal.paralelo, rates);
                        return (
                          <div key={t.id} className={`bg-[#1C1C1E] p-4 md:p-5 rounded-[1.25rem] flex justify-between items-center border ${t.classes.border} transition-colors`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full ${t.classes.badgeBg} flex items-center justify-center border ${t.classes.border}`}>
                                <Globe className={`${t.classes.text} w-5 h-5`} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{t.label}</p>
                                <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Referencia · patrimonio total</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className={`text-lg font-black ${t.classes.text} font-sans tabular-nums tracking-tight`}>
                                {valorConvertido.toLocaleString(t.locale, { maximumFractionDigits: 0 })}
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveRates(prev => prev.filter(id => id !== t.id))}
                                className="text-white/20 hover:text-rose-400 transition-colors"
                                title="Quitar moneda"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {TASAS_DISPONIBLES.some(t => !activeRates.includes(t.id)) && (
                        <div className="pt-1">
                          {!showAddMonedaLiquidez ? (
                            <button
                              type="button"
                              onClick={() => setShowAddMonedaLiquidez(true)}
                              className="w-full bg-[#1C1C1E] border border-dashed border-white/15 hover:border-emerald-500/40 p-3 rounded-2xl flex items-center justify-center gap-2 text-white/50 hover:text-emerald-400 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-[11px] font-bold uppercase tracking-widest">Agregar moneda de referencia</span>
                            </button>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {TASAS_DISPONIBLES.filter(t => !activeRates.includes(t.id)).map(t => (
                                <button
                                  type="button"
                                  key={t.id}
                                  onClick={() => { setActiveRates(prev => [...prev, t.id]); setShowAddMonedaLiquidez(false); }}
                                  className={`bg-[#1C1C1E] border ${t.classes.border} hover:bg-[#242424] p-3 rounded-xl text-[11px] font-bold text-white/70 hover:text-white transition-colors flex items-center gap-1.5`}
                                >
                                  <Plus className="w-3 h-3" /> {t.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-3 mt-1 border-t border-white/5 flex items-center justify-between px-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/30">Patrimonio (todo lo que tienes)</p>
                        <p className="text-xs font-bold text-white/40 font-sans tabular-nums">
                          $<AnimatedNum value={patrimonioRate === 'paralelo' ? patrimonioTotal.paralelo : patrimonioTotal.bcv} format="usd" />
                        </p>
                      </div>

                    </div>
                  ) : (
                    // VISTA PARA POTES Y VACAS COMPARTIDAS
                    <div className="space-y-3">
                      <div className="bg-emerald-900/20 p-4 rounded-2xl flex justify-between items-center border border-emerald-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><Globe className="text-emerald-400 w-5 h-5"/></div>
                          <div>
                            <p className="text-sm font-bold text-emerald-400">Balance Global</p>
                            <p className="text-[10px] text-emerald-400/50 uppercase">Total en este espacio</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-emerald-400 font-sans">${patrimonioTotal.paralelo.toFixed(2)}</p>
                      </div>

                      {participantes.map((p: any) => {
                        const saldoP = getSaldosAislados(p.nombre, true);
                        const totalP = saldoP.usdt + saldoP.cash + (rates.usdt > 0 ? saldoP.bs / rates.usdt : 0);
                        return (
                          <div key={p.id} className="bg-[#1a1a1a] p-4 rounded-2xl flex justify-between items-center border border-white/5 transition-colors hover:border-purple-500/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Users className="text-purple-400 w-5 h-5"/></div>
                              <div>
                                <p className="text-sm font-bold text-white">{p.nombre}</p>
                                <p className="text-[9px] text-white/40 uppercase mt-0.5 tracking-wider">
                                  USDT: ${saldoP.usdt.toFixed(2)} • BS: {saldoP.bs.toFixed(2)} • CASH: ${saldoP.cash.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <p className="text-xl font-black text-white font-sans">${totalP.toFixed(2)}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* ========================================================= */}
          {/* SIMULADOR RÁPIDO EMBEBIDO (CONVERSIÓN INSTANTÁNEA $ <-> BS/€) */}
          {/* ========================================================= */}
          <div data-tutorial="simulador" className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-5 mx-2">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onChangeView('calculadora-libre'); setActiveTab('calculadora'); }}
                  title="Abrir simulador completo"
                  className={`w-7 h-7 rounded-lg ${theme.lightBg} flex items-center justify-center ${theme.text} hover:brightness-125 transition-colors shrink-0 active:scale-90`}
                >
                  <Calculator className="w-4 h-4" />
                </button>
                <h3 className="font-black text-sm text-white">Simulador al instante</h3>
              </div>
            </div>

            <div className="flex gap-1.5 mb-4 flex-wrap">
              <button onClick={() => setMiniSimTasa('bcv')} className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-colors ${miniSimTasa === 'bcv' ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                BCV {rates.bcv.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </button>
              <button onClick={() => setMiniSimTasa('paralelo')} className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-colors ${miniSimTasa === 'paralelo' ? 'bg-white text-black' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                USDT {rates.usdt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </button>
              <button onClick={() => setMiniSimTasa('eur')} className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-colors ${miniSimTasa === 'eur' ? 'bg-white text-black' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}>
                EUR {rates.eur_bcv.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/30 border border-white/10 rounded-full px-4 py-3 transition-colors">
                <span className="text-[9px] text-white/40 font-bold uppercase block mb-0.5">Monto en {miniSimMoneda === 'usd' ? '$' : 'Bs'}</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-white/40">{miniSimMoneda === 'usd' ? '$' : 'Bs'}</span>
                  <input type="number" placeholder="0" value={miniSimMonto} onChange={(e) => setMiniSimMonto(e.target.value)} className="w-full bg-transparent text-lg font-black text-white outline-none tabular-nums" />
                </div>
              </div>
              <button
                onClick={handleSwapMiniSim}
                title="Cambiar moneda de origen"
                className={`w-9 h-9 rounded-full ${theme.lightBg} border ${theme.border} flex items-center justify-center shrink-0 hover:brightness-125 transition-colors active:scale-90`}
              >
                <ArrowLeftRight className={`w-4 h-4 ${theme.text}`} />
              </button>
              <div className={`flex-1 ${theme.lightBg} border ${theme.border} rounded-full px-4 py-3`}>
                <span className={`text-[9px] ${theme.text} opacity-70 font-bold uppercase block mb-0.5`}>
                  {miniSimTasa === 'eur' ? 'Equivale en €' : (miniSimMoneda === 'usd' ? 'Pagas en Bs' : 'Recibes en $')}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`text-lg font-black ${theme.text} opacity-50`}>{miniSimSimbolo}</span>
                  <span className={`text-lg font-black ${theme.text} tabular-nums`}>{formatMiniNum(miniSimResultado, miniSimMonedaResultado)}</span>
                </div>
              </div>
            </div>

            {miniSimNum > 0 && (
              <button
                onClick={() => {
                  setTipo("egreso");
                  setCategoria("");
                  setMoneda(miniSimMoneda === 'usd' ? 'usdt' : 'bs');
                  setMonto(miniSimMonto);
                  document.getElementById('nuevo-registro-trigger')?.click();
                }}
                className={`w-full mt-3 ${theme.primary} text-white font-black text-xs uppercase tracking-widest py-3 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform`}
              >
                <Plus className="w-4 h-4" /> Registrar este gasto
              </button>
            )}
          </div>

          {/* ========================================================= */}
          {/* TARJETAS DE ACCESO RÁPIDO REBRANDING */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between gap-3 px-4 mt-6 mb-8">

            {/* BOTÓN ESCANEAR */}
            <button
              onClick={handleTryScan}
              disabled={isScanning}
              className="flex-1 flex flex-col items-center gap-3 py-4 rounded-[2rem] bg-[#1C1C1E] border border-white/10 hover:bg-[#27272a] transition-all active:scale-95"
            >
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Camera className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Escanear Factura</span>
            </button>

            {/* BOTÓN META / VACA */}
            {espacioActivo && (
              <button
                onClick={() => {
                  if (espacioActivo.tipo === 'vaca' && potes.length > 0) {
                    // Una vaca tiene una sola meta: este botón edita el monto necesario, no crea otra.
                    const metaActual = potes[0];
                    const opcionCoincide = POTE_OPCIONES.includes(metaActual.nombre);
                    setPoteForm({
                      id: metaActual.id,
                      tipo: opcionCoincide ? metaActual.nombre : "Personalizado ✍️",
                      nombreCustom: opcionCoincide ? "" : metaActual.nombre,
                      monto_objetivo: String(metaActual.monto_objetivo ?? ""),
                    });
                  } else {
                    setPoteForm({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
                  }
                  setIsAddingPote(true);
                }}
                className="flex-1 flex flex-col items-center gap-3 py-4 rounded-[2rem] bg-[#1C1C1E] border border-white/10 hover:bg-[#27272a] transition-all active:scale-95"
              >
                <div className={`w-14 h-14 rounded-3xl ${theme.lightBg} border ${theme.border} flex items-center justify-center`}>
                  <Target className={`w-7 h-7 ${theme.text}`} />
                </div>
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                  {espacioActivo.tipo === 'vaca' ? (potes.length > 0 ? 'Editar Meta' : 'Nueva Vaca') : 'Nueva Meta'}
                </span>
              </button>
            )}
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleScanInvoice} className="hidden" />
          <input type="file" accept="image/*" ref={estadoCuentaInputRef} onChange={handleScanEstadoCuenta} className="hidden" />

          {/* ========================================================= */}
          {/* INTEGRANTES DEL ESPACIO (VACA O POTE COMPARTIDO) */}
          {/* ========================================================= */}
          {participantesVisibles && (
            <div className="space-y-4 px-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Participantes</p>
                <span className="text-[10px] text-white/30">{participantes.length} miembro{participantes.length === 1 ? '' : 's'}</span>
              </div>
              <div className="space-y-3">
                {participantes.map((p: any) => {
                  const saldoP = getSaldosAislados(p.nombre, true);
                  const totalP = saldoP.usdt + saldoP.cash + (rates.usdt > 0 ? saldoP.bs / rates.usdt : 0);
                  const estaEditando = editandoParticipanteId === p.id;
                  return (
                    <div key={p.id} className="border border-white/5 rounded-3xl p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                      {estaEditando ? (
                        <form
                          onSubmit={conUnSoloClick((e: React.FormEvent) => { e.preventDefault(); renombrarParticipante(p.id, editandoParticipanteNombre); })}
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          <input
                            autoFocus
                            value={editandoParticipanteNombre}
                            onChange={(e) => setEditandoParticipanteNombre(e.target.value)}
                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:border-purple-500"
                          />
                          <button type="submit" className="p-1.5 text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setEditandoParticipanteId(null)} className="p-1.5 text-white/30 hover:text-rose-400"><X className="w-4 h-4" /></button>
                        </form>
                      ) : (
                        <>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                              {p.nombre}
                              <button
                                onClick={() => { setEditandoParticipanteId(p.id); setEditandoParticipanteNombre(p.nombre); }}
                                className="text-white/20 hover:text-purple-400 transition-colors"
                                title="Renombrar"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </p>
                            <p className="text-[9px] text-white/40 mt-1">
                              USDT: ${saldoP.usdt.toFixed(2)} · BS: {saldoP.bs.toFixed(2)} · CASH: ${saldoP.cash.toFixed(2)}
                            </p>
                          </div>
                          <p className="text-lg font-black text-white tabular-nums shrink-0">${totalP.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {metasActivas && (
            <div className="space-y-4 px-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Metas activas</p>
              </div>
              <div className="space-y-3">
                {potes.map((pote) => {
                  const ahorrado = getPoteAhorrado(pote.id, pote.nombre);
                  const objetivo = Number(pote.monto_objetivo || 0);
                  const porcentaje = objetivo > 0 ? Math.min((ahorrado / objetivo) * 100, 100) : 0;

                  const esIndividual = espacioActivo?.tipo === 'individual';
                  return (
                    <div
                      key={pote.id}
                      onClick={() => { if (esIndividual) { setMetaAccion({ id: pote.id, nombre: pote.nombre, ahorrado, objetivo, modo: 'abonar' }); setMetaAccionMonto(""); } }}
                      className={`border border-white/5 rounded-3xl p-5 hover:border-emerald-500/30 transition-colors flex items-center gap-4 ${esIndividual ? 'cursor-pointer active:scale-[0.99]' : ''}`}
                    >
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-white/5" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-emerald-400" strokeWidth="4" strokeDasharray={`${porcentaje}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-xs font-black text-white tabular-nums">{porcentaje.toFixed(0)}%</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-white truncate">{pote.nombre}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Ahorrado ${ahorrado.toFixed(2)} de ${pote.monto_objetivo}</p>
                        <p className="text-[10px] text-emerald-400/70 mt-0.5 font-semibold">Falta ${Math.max(objetivo - ahorrado, 0).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar la meta "${pote.nombre}"? Esto no borra las transacciones ya registradas.`)) eliminarPote(pote.id); }}
                        className="p-2 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Eliminar meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CÓDIGOS DE INVITACIÓN (AQUÍ ESTÁ CERRADO CORRECTAMENTE) */}
          {/* ========================================================= */}
          {espacioActivo?.tipo !== 'individual' && espacioActivo?.codigo_invitacion && (
             <div className={`bg-transparent border ${theme.border} p-4 rounded-3xl mb-6 flex flex-row items-center justify-between gap-4 mt-8`}>
                <div className="flex-1">
                  <p className={`text-[9px] ${theme.text} font-bold uppercase tracking-widest flex items-center gap-1.5 mb-0.5`}><Key className="w-3 h-3"/> Código del Espacio</p>
                  <p className="text-[10px] text-white/40">Comparte para añadir miembros.</p>
                </div>
                <button onClick={() => {navigator.clipboard.writeText(espacioActivo.codigo_invitacion); alert("Código copiado");}} className="bg-[#1a0f2e] border border-white/5 py-2 px-4 rounded-xl text-sm text-white font-black tracking-[0.2em] transition-colors flex items-center justify-center gap-2 font-sans tabular-nums cursor-pointer hover:bg-white/5 active:scale-95">
                  {espacioActivo.codigo_invitacion} <Copy className="w-3 h-3 text-white/30 ml-1"/>
                </button>
             </div>
          )}

          {espacioActivo?.tipo === 'individual' && !isGuest && (
             <div className="bg-transparent border border-white/5 p-4 rounded-3xl mb-6 flex flex-row items-center justify-between gap-4 mt-8">
                <div className="flex-1">
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><Users className="w-3 h-3"/> ¿Tienes un código?</p>
                  <p className="text-[10px] text-white/30">Únete a un Pote o Vaca.</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={joinCodeInput} onChange={(e)=>setJoinCodeInput(e.target.value.toUpperCase())} placeholder="EJ: X7K9P2" className="w-24 bg-[#1a0f2e] border border-white/5 rounded-xl px-2 py-2 text-xs text-center text-white font-bold outline-none uppercase tracking-widest" maxLength={6} />
                  <button onClick={unirseConCodigoInterno} className={`px-3 py-2 rounded-xl ${theme.primary} text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform`}>Unirse</button>
                </div>
             </div>
          )}

          <div className="h-28 w-full"></div>
        </div>
      );
    }

    return <div className="p-10 text-center text-white/50">Selecciona otra pestaña</div>;
  }

  return (
    <div className="w-full pb-20 md:pb-0">
      {isGuest && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 text-center mb-4 rounded-xl flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4"/> Modo Invitado: Prueba gratuita activada.
        </div>
      )}

      {/* HEADER DINÁMICO (TÍTULO CLICKABLE COMO MENÚ DE PERFIL) */}
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileMenuOpen(true)}>
             <div className="text-xl font-black text-white tracking-wide leading-tight flex items-center gap-2">
                 {isEditingSpaceName ? (
                   <form onSubmit={conUnSoloClick(guardarNombreEspacio)} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <input type="text" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} className="bg-black/50 border border-purple-500/50 rounded px-2 py-1 outline-none text-sm w-32" autoFocus />
                     <button type="submit" className="bg-emerald-500 text-black p-1 rounded"><Check size={14}/></button>
                     <button type="button" onClick={() => setIsEditingSpaceName(false)} className="bg-rose-500 text-black p-1 rounded"><X size={14}/></button>
                   </form>
                 ) : (
                   <>
                     {espacioActivo?.nombre || "Mi Billetera"}
                     <ChevronDown className="w-5 h-5 text-white/40" />
                     {espacioActivo && !isGuest && (
                       <button
                         data-tutorial="editar-nombre"
                         onClick={(e) => { e.stopPropagation(); setNewSpaceName(espacioActivo.nombre); setIsEditingSpaceName(true); }}
                         className="text-white/20 hover:text-white/60 transition-colors"
                         title="Editar nombre"
                       >
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                     )}
                   </>
                 )}
             </div>
            <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] uppercase tracking-widest ${theme.text} ${theme.lightBg} px-2 py-0.5 rounded-md font-bold`}>{espacioActivo?.tipo || "Individual"}</span>
                
              {/* MEDALLA DE RACHA SÚPER LIMPIA (Sin cajas, sin fondos, sin resplandor) */}
                 {perfil && (
                    <button
                      data-tutorial="racha"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Usamos onShowCelebration directamente, que ya viene como prop
                        onShowCelebration({
                          dias: perfil.racha_actual || 0,
                          recompensa: {
                            ...obtenerRangoActual(perfil.racha_actual || 0),
                            desc: MENSAJES_RACHA_DIARIA[(perfil.racha_actual - 1) % MENSAJES_RACHA_DIARIA.length]
                          }
                        });
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-sm font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ color: obtenerRangoActual(perfil.racha_actual || 0).color }}
                    >
                      <span className="drop-shadow-md">🔥</span>
                      <span className="font-sans tabular-nums tracking-tight">
                        {perfil.racha_actual || 0}
                      </span>
                    </button>
                  )}
             </div>
          </div>
        </div>
        
        {/* LADO DERECHO: TASA OFICIAL CLICKABLE + BOTÓN LOGOUT */}
        <div className="text-right flex items-center gap-2">
          {!isGuest && session && !perfil?.is_pro && (
            <button
              onClick={() => onTriggerPaywall?.()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30 px-3 py-2 rounded-xl transition-all active:scale-95"
              title="Hazte PRO"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[9px] font-bold text-amber-400 uppercase tracking-widest">Hazte PRO</span>
            </button>
          )}
          {(isGuest || session) && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition-all active:scale-95"
              title={isGuest ? "Salir del modo invitado" : "Cerrar sesión"}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline text-[9px] font-bold text-rose-400 uppercase tracking-widest">Salir</span>
            </button>
          )}
          <button
            data-tutorial="tasa-oficial"
            onClick={() => setIsRatesDrawerOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 hover:border-emerald-500/40 px-3 py-2 rounded-xl transition-all active:scale-95"
          >
            <div className="text-right">
              <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-0.5 leading-none">Tasa Oficial</p>
              <p className="text-xs font-black text-white tabular-nums leading-none">Bs. {rates.bcv.toLocaleString('es-VE', {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-white/30" />
          </button>
        </div>
      </div> {/* <-- Fin del Header principal (Asegúrate de no borrar esto si ya estaba) */}

      {/* ========================================================= */}
      {/* DRAWER DEL PANEL DETALLADO DE TASAS (ESTILO AL CAMBIO) */}
      {/* ========================================================= */}
      <Drawer.Root open={isRatesDrawerOpen} onOpenChange={setIsRatesDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-emerald-500">
            <Drawer.Title className="sr-only">Panel de Tasas de Cambio</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" /> Monitores
                </h3>
                <button onClick={fetchRates} disabled={syncing} className="bg-[#1a1a1a] border border-white/5 p-2 rounded-lg text-white/50 hover:text-white transition-colors">
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {activeRates.map((id) => {
                  const def = TASAS_DISPONIBLES.find(t => t.id === id);
                  if (!def) return null;
                  const valor = getValorTasa(id, rates);
                  return (
                    <div key={id} className={`bg-[#1C1C1E] border ${def.classes.border} p-4 rounded-2xl flex flex-col justify-between relative group`}>
                      <button
                        onClick={() => setActiveRates(prev => prev.filter(r => r !== id))}
                        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-white/20 hover:text-rose-400 transition-colors"
                        title="Quitar tasa"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center justify-between pr-4">
                        {def.label}
                        <span className={`${def.classes.badgeBg} ${def.classes.badgeText} text-[8px] px-1.5 py-0.5 rounded`}>{def.badge}</span>
                      </p>
                      {def.kind === 'foreign_per_usd' ? (
                        <>
                          <p className={`text-xl font-black ${def.classes.text} font-sans tabular-nums tracking-tight`}>
                            {valor.toLocaleString(def.locale, {maximumFractionDigits:0})} <span className="text-xs">/ USD</span>
                          </p>
                          <p className="text-[9px] text-white/40 mt-1">
                            1.000 ≈ Bs. {(valor > 0 ? (1000 * rates.bcv / valor) : 0).toLocaleString('es-VE', {minimumFractionDigits:2, maximumFractionDigits:2})}
                          </p>
                        </>
                      ) : (
                        <p className={`text-xl font-black ${def.classes.text} font-sans tabular-nums tracking-tight`}>Bs. {valor.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {TASAS_DISPONIBLES.some(t => !activeRates.includes(t.id)) && (
                <div className="mb-3">
                  {!showAddTasa ? (
                    <button
                      onClick={() => setShowAddTasa(true)}
                      className="w-full bg-[#1a1a1a] border border-dashed border-white/15 hover:border-emerald-500/40 p-3 rounded-2xl flex items-center justify-center gap-2 text-white/50 hover:text-emerald-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Añadir tasa</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {TASAS_DISPONIBLES.filter(t => !activeRates.includes(t.id)).map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setActiveRates(prev => [...prev, t.id]); setShowAddTasa(false); }}
                          className={`bg-[#1a1a1a] border ${t.classes.border} hover:bg-[#232323] p-3 rounded-xl text-[11px] font-bold text-white/70 hover:text-white transition-colors flex items-center gap-1.5`}
                        >
                          <Plus className="w-3 h-3" /> {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center mt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                   Actualizado diariamente.
                </p>
              </div>

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* DRAWER DESLIZANTE DE ESPACIOS (DESDE ABAJO) */}
      <Drawer.Root open={isSpacesMenuOpen} onOpenChange={setIsSpacesMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[250] border-t border-[#3b82f6]">
            <Drawer.Title className="sr-only">Cambiar de Espacio</Drawer.Title>
            <div className="p-6 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-6 text-center">Tus Espacios</h3>
              
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3">Tus Billeteras</p>
              <div className="space-y-2 mb-6">
                {espacios.filter((e:any) => e.tipo === 'individual').map((e:any) => (
                  <div key={e.id} className="flex gap-1">
                    <button onClick={() => { setIsSpacesMenuOpen(false); onSelectModule('individual', e.id); }} className={`flex-1 flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-left transition-colors ${espacioActivo?.id === e.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-[#1a1a1a] text-white/70 hover:bg-white/10'}`}>
                      <Wallet className="w-5 h-5 shrink-0"/> <span className="truncate">{e.nombre}</span>
                    </button>
                    <button onClick={(event) => eliminarEspacio(event, e.id, e.tipo, e.nombre)} className="p-4 bg-[#1a1a1a] rounded-2xl text-white/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3">Potes y Vacas</p>
              <div className="space-y-2 mb-6">
                {espacios.filter((e:any) => e.tipo !== 'individual').map((e:any) => (
                  <div key={e.id} className="flex gap-1">
                    <button onClick={() => { setIsSpacesMenuOpen(false); onSelectModule(e.tipo, e.id); }} className={`flex-1 flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-left transition-colors ${espacioActivo?.id === e.id ? (e.tipo === 'vaca' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30') : 'bg-[#1a1a1a] text-white/70 hover:bg-white/10'}`}>
                      {e.tipo === 'vaca' ? <Users className="w-5 h-5 shrink-0" /> : <img src="/pote.png" className="w-5 h-5 opacity-80 shrink-0" />} 
                      <span className="truncate">{e.nombre}</span>
                    </button>
                    <button onClick={(event) => eliminarEspacio(event, e.id, e.tipo, e.nombre)} className="p-4 bg-[#1a1a1a] rounded-2xl text-white/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-3 mt-4">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3 text-center">Crear o Unirse</p>
                <div className="grid grid-cols-2 gap-2">
                {/* BOTÓN CREAR POTE (GRATIS) */}
                <button
                  onClick={() => {
                    setIsSpacesMenuOpen(false);
                    onSelectModule('pote', 'NEW');
                  }}
                  className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 font-bold text-xs transition-colors active:scale-95"
                >
                  <div className="bg-fuchsia-500/20 p-2 rounded-full">
                    <Plus className="w-5 h-5"/>
                  </div>
                  Crear Pote
                </button>

                {/* BOTÓN CREAR VACA (PRO) */}
<button
  onClick={() => {
    setIsSpacesMenuOpen(false);
    if (!perfil?.is_pro) { setTimeout(() => onTriggerPaywall?.(), 300); return; }
    setNuevaVacaForm({ nombre: "", monto_objetivo: "" });
    setIsCreatingVaca(true);
  }}
  className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold text-xs transition-colors active:scale-95"
>
  {!perfil?.is_pro && (
    <span className="absolute top-2 right-2 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded">PRO</span>
  )}
  <div className="bg-blue-500/20 p-2 rounded-full">
    <Plus className="w-5 h-5"/>
  </div>
  Crear Vaca
</button>
              </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* DRAWER: CREAR VACA (PLAN ENTRE AMIGOS CON META DESDE EL INICIO) */}
      <Drawer.Root open={isCreatingVaca} onOpenChange={setIsCreatingVaca}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-emerald-500">
            <Drawer.Title className="sr-only">Crear Vaca</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-2 text-center">Nueva Vaca</h3>
              <p className="text-xs text-white/40 text-center mb-6">Un plan entre amigos: pon el nombre y cuánto necesitan reunir. La billetera de la vaca se construye desde esa meta.</p>

              <form
                onSubmit={conUnSoloClick(async (e) => {
                  e.preventDefault();
                  if (!nuevaVacaForm.nombre.trim() || !nuevaVacaForm.monto_objetivo) return;
                  await onSelectModule('vaca', 'NEW', {
                    nombre: nuevaVacaForm.nombre.trim(),
                    monto_objetivo: parseFloat(nuevaVacaForm.monto_objetivo),
                  });
                  setIsCreatingVaca(false);
                })}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Cuál es el plan?</label>
                  <input
                    type="text"
                    placeholder="Ej: Playa con los panas"
                    value={nuevaVacaForm.nombre}
                    onChange={(e) => setNuevaVacaForm({ ...nuevaVacaForm, nombre: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Cuánto necesitamos? ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 200"
                    value={nuevaVacaForm.monto_objetivo}
                    onChange={(e) => setNuevaVacaForm({ ...nuevaVacaForm, monto_objetivo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-black font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4 active:scale-95 transition-transform hover:bg-emerald-600"
                >
                  Crear Vaca
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {renderTabContent()}

      {/* ========================================================= */}
      {/* DRAWER DE REVISIÓN: MOVIMIENTOS DETECTADOS EN EL ESTADO DE CUENTA BANCARIO */}
      {/* Montado a nivel global porque el escaneo se dispara desde el menú del FAB (pestaña Inicio) */}
      {/* ========================================================= */}
      <Drawer.Root open={transaccionesEscaneadas.length > 0} onOpenChange={(open) => !open && setTransaccionesEscaneadas([])}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-[350] border-t border-emerald-500">
            <Drawer.Title className="sr-only">Confirmar Movimientos Detectados</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-1 text-center">Movimientos Detectados</h3>
              <p className="text-center text-white/50 text-xs mb-5">Revisa, ajusta y desmarca los que no quieras registrar.</p>

              <div className="flex items-center justify-center gap-3 mb-6 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  <ArrowUpCircle className="w-3.5 h-3.5"/> {transaccionesEscaneadas.filter(t => t.seleccionado && t.tipo === 'ingreso').length} ingresos
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                  <ArrowDownCircle className="w-3.5 h-3.5"/> {transaccionesEscaneadas.filter(t => t.seleccionado && t.tipo === 'egreso').length} egresos
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {transaccionesEscaneadas.map((t, idx) => {
                  const fechaCorta = t.fecha ? t.fecha.split('-').reverse().slice(0, 2).join('/') : null;
                  const esIngreso = t.tipo === 'ingreso';
                  return (
                    <div
                      key={t.clave}
                      className={`rounded-2xl border transition-all ${t.seleccionado ? (esIngreso ? 'bg-emerald-500/[0.06] border-emerald-500/30' : 'bg-rose-500/[0.06] border-rose-500/30') : 'bg-white/[0.02] border-white/5 opacity-40'}`}
                    >
                      <div className="flex items-center gap-2.5 px-4 pt-4">
                        <button type="button" onClick={() => actualizarTransaccionEscaneada(idx, { seleccionado: !t.seleccionado })} className="shrink-0">
                          {t.seleccionado ? <CheckSquare className={`w-5 h-5 ${esIngreso ? 'text-emerald-400' : 'text-rose-400'}`}/> : <Square className="text-white/30 w-5 h-5"/>}
                        </button>
                        <button
                          type="button"
                          onClick={() => actualizarTransaccionEscaneada(idx, { tipo: esIngreso ? 'egreso' : 'ingreso' })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-colors ${esIngreso ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                        >
                          {esIngreso ? <ArrowUpCircle className="w-3 h-3"/> : <ArrowDownCircle className="w-3 h-3"/>}
                          {t.tipo}
                        </button>
                        {fechaCorta && <span className="text-[9px] text-white/30 font-bold ml-auto shrink-0">{fechaCorta}</span>}
                      </div>

                      <div className="px-4 pt-2 pb-1">
                        <input
                          type="text"
                          value={t.descripcion}
                          onChange={(e) => actualizarTransaccionEscaneada(idx, { descripcion: e.target.value })}
                          className="w-full bg-transparent text-[15px] font-bold text-white outline-none min-w-0"
                          placeholder="Descripción"
                        />
                      </div>

                      <div className="flex items-center gap-2 px-4 pb-4 pt-1">
                        <button
                          type="button"
                          onClick={() => actualizarTransaccionEscaneada(idx, { moneda: t.moneda === 'bs' ? 'usdt' : 'bs' })}
                          title="Cambiar moneda"
                          className="shrink-0 text-[11px] font-black text-white/50 hover:text-white bg-black/30 rounded-xl px-2.5 py-2.5 transition-colors"
                        >
                          {t.moneda === 'bs' ? 'Bs' : '$'}
                        </button>
                        <input
                          type="number" step="0.01"
                          value={t.monto || ''}
                          onChange={(e) => actualizarTransaccionEscaneada(idx, { monto: e.target.value })}
                          placeholder="0.00"
                          className="flex-1 min-w-0 bg-black/30 rounded-xl px-3 py-2.5 text-base font-black text-white outline-none tabular-nums placeholder:text-white/20 placeholder:font-bold"
                        />
                        <div className="relative shrink-0">
                          <select
                            value={t.categoria}
                            onChange={(e) => actualizarTransaccionEscaneada(idx, { categoria: e.target.value })}
                            className="appearance-none bg-black/30 rounded-xl pl-3 pr-6 py-2.5 text-[10px] font-bold text-white/70 outline-none max-w-[104px] truncate cursor-pointer"
                          >
                            {categoriasList.map(c => <option key={c.id || c.valor} value={c.valor} className="bg-[#1a0f2e]">{c.label}</option>)}
                          </select>
                          <ChevronDown className="w-3 h-3 text-white/30 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={conUnSoloClick(confirmarTransaccionesEscaneadas)}
                className="w-full bg-emerald-600 text-white font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-transform"
              >
                Registrar {transaccionesEscaneadas.filter(t => t.seleccionado).length} movimiento{transaccionesEscaneadas.filter(t => t.seleccionado).length === 1 ? '' : 's'}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ========================================================= */}
      {/* DRAWER: TÉRMINOS Y CONDICIONES DE INTELIGENCIA ARTIFICIAL */}
      {/* Montado a nivel global para que se pueda abrir desde cualquier pestaña (ej. al escanear una factura desde Inicio) */}
      {/* ========================================================= */}
      <Drawer.Root open={showAITerms} onOpenChange={setShowAITerms}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-[350] max-h-[85vh]">
            <Drawer.Title className="sr-only">Términos y Condiciones de IA</Drawer.Title>
            <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-12">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-8" />

              <div className="flex justify-center mb-4">
                {/* Ícono de Cerebro estilo Nola */}
                <div className="text-5xl drop-shadow-lg">🧠</div>
              </div>

              <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight">Pote usa inteligencia artificial</h3>
              <p className="text-sm text-white/50 text-center mb-8 px-4 leading-relaxed">
                Para analizar tus recibos, fotos y voz, enviamos datos a modelos de IA seguros. A continuación te explicamos cómo.
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-[#1C1C1E] p-5 rounded-[2rem]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <span className="text-rose-400">📄</span> Qué datos se envían
                  </h4>
                  <ul className="text-xs text-white/60 space-y-2 list-disc pl-5">
                    <li>Texto que escribes para agregar transacciones.</li>
                    <li>Fotos de recibos, estados de cuenta o capturas de pantalla.</li>
                    <li>Grabaciones de voz para el asistente inteligente.</li>
                  </ul>
                </div>

                <div className="bg-[#1C1C1E] p-5 rounded-[2rem]">
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <span className="text-rose-400">🔒</span> Cómo se procesan
                  </h4>
                  <ul className="text-xs text-white/60 space-y-2 list-disc pl-5">
                    <li>Servicios externos de OpenAI procesan tus datos para extraer montos y comercios.</li>
                    <li>Los datos se transmiten de forma encriptada y no se usan para entrenar modelos públicos.</li>
                  </ul>
                </div>
              </div>

              {/* Botón estilo Nola (Coral/Red) */}
              <button
                onClick={acceptAITerms}
                className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black py-4 rounded-full text-base active:scale-95 transition-transform shadow-[0_0_20px_rgba(244,63,94,0.3)] mb-4"
              >
                Acepto, continuar
              </button>
              <button onClick={() => setShowAITerms(false)} className="w-full text-white/40 font-bold text-sm hover:text-white transition-colors">
                No, gracias
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* DRAWER: CREAR NUEVA META / VACA (montado globalmente, se abre desde Inicio) */}
      <Drawer.Root open={isAddingPote} onOpenChange={setIsAddingPote}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[350] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-[350] border-t border-emerald-500">
            <Drawer.Title className="sr-only">{espacioActivo?.tipo === 'vaca' ? 'Crear Vaca' : 'Crear Meta'}</Drawer.Title>
            <div className="p-6 flex-1 overflow-y-auto pb-12">
              <div className="mx-auto w-12 h-1.5 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-4 text-center">{espacioActivo?.tipo === 'vaca' ? 'Crear nueva Vaca' : 'Crear nueva Meta'}</h3>
              <form onSubmit={conUnSoloClick(guardarPote)} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Tipo</label>
                  <select value={poteForm.tipo} onChange={(e) => setPoteForm({ ...poteForm, tipo: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500">
                    {POTE_OPCIONES.map((opcion) => (
                      <option key={opcion} value={opcion}>{opcion}</option>
                    ))}
                  </select>
                </div>
                {poteForm.tipo === 'Personalizado ✍️' && (
                  <div>
                    <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Nombre personalizado</label>
                    <input value={poteForm.nombreCustom} onChange={(e) => setPoteForm({ ...poteForm, nombreCustom: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Viaje a Margarita" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Monto objetivo</label>
                  <input type="number" min="0" step="0.01" value={poteForm.monto_objetivo} onChange={(e) => setPoteForm({ ...poteForm, monto_objetivo: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: 100" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Guardar {espacioActivo?.tipo === 'vaca' ? 'Vaca' : 'Meta'}</button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* DRAWER: ABONAR / RETIRAR DE UNA META (se abre al tocar la tarjeta de la meta) */}
      <Drawer.Root open={!!metaAccion} onOpenChange={(open: boolean) => { if (!open) setMetaAccion(null); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[350] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[70vh] mt-24 fixed bottom-0 left-0 right-0 z-[350] border-t border-emerald-500">
            <Drawer.Title className="sr-only">Mover dinero de la meta</Drawer.Title>
            <div className="p-6 flex-1 overflow-y-auto pb-12">
              <div className="mx-auto w-12 h-1.5 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-1 text-center">{metaAccion?.nombre}</h3>
              <p className="text-[11px] text-white/40 text-center mb-6">
                Ahorrado ${Number(metaAccion?.ahorrado || 0).toFixed(2)} de ${Number(metaAccion?.objetivo || 0).toFixed(2)}
              </p>

              <div className="flex w-full rounded-full bg-white/5 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setMetaAccion(prev => prev && { ...prev, modo: 'abonar' })}
                  className={`flex-1 py-2.5 text-xs font-black rounded-full transition ${metaAccion?.modo === 'abonar' ? 'bg-emerald-500 text-black' : 'text-white/50 hover:text-white'}`}
                >
                  ABONAR
                </button>
                <button
                  type="button"
                  onClick={() => setMetaAccion(prev => prev && { ...prev, modo: 'retirar' })}
                  className={`flex-1 py-2.5 text-xs font-black rounded-full transition ${metaAccion?.modo === 'retirar' ? 'bg-rose-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                  RETIRAR
                </button>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 space-y-4 mb-6">
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Monto</label>
                  <input
                    type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
                    value={metaAccionMonto}
                    onChange={(e) => setMetaAccionMonto(e.target.value)}
                    className="w-full bg-transparent text-3xl font-black text-white outline-none tabular-nums"
                  />
                </div>
                <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button type="button" onClick={() => setMetaAccionMoneda('usdt')} className={`flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${metaAccionMoneda === 'usdt' ? 'bg-emerald-500 text-black' : 'text-white/40 hover:bg-white/10'}`}>USDT</button>
                  <button type="button" onClick={() => setMetaAccionMoneda('bs')} className={`flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${metaAccionMoneda === 'bs' ? 'bg-emerald-500 text-black' : 'text-white/40 hover:bg-white/10'}`}>BS</button>
                  <button type="button" onClick={() => setMetaAccionMoneda('cash')} className={`flex-1 min-w-[64px] py-2 text-xs font-black rounded-lg transition-colors ${metaAccionMoneda === 'cash' ? 'bg-emerald-500 text-black' : 'text-white/40 hover:bg-white/10'}`}>CASH</button>
                </div>
              </div>

              <button
                type="button"
                onClick={conUnSoloClick(async () => {
                  if (!metaAccion) return;
                  const valor = parseFloat(metaAccionMonto);
                  if (!valor || valor <= 0) return alert("Ingresa un monto válido");

                  if (metaAccion.modo === 'retirar') {
                    const { monto_usd_paralelo } = calcularMontos(valor, metaAccionMoneda);
                    if (monto_usd_paralelo > metaAccion.ahorrado + 0.01) {
                      return alert(`Solo tienes $${metaAccion.ahorrado.toFixed(2)} ahorrados en esta meta.`);
                    }
                    await retirarMeta(metaAccion.id, valor, metaAccionMoneda);
                  } else {
                    await abonarMeta(metaAccion.id, valor, metaAccionMoneda);
                  }
                  setMetaAccion(null); setMetaAccionMonto("");
                })}
                className={`w-full font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all ${metaAccion?.modo === 'retirar' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black'}`}
              >
                {metaAccion?.modo === 'retirar' ? 'Retirar de la meta' : 'Abonar a la meta'}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* DRAWER: CAMBIO P2P (montado globalmente, se abre desde el menú FAB en Inicio) */}
      <Drawer.Root open={isP2POpen} onOpenChange={setIsP2POpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[360] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-[360] border-t border-amber-500">
            <Drawer.Title className="sr-only">Cambio P2P</Drawer.Title>
            <div className="p-6 flex-1 overflow-y-auto pb-12">
              <div className="mx-auto w-12 h-1.5 rounded-full bg-[#333] mb-6" />
              <h3 className="text-xl font-black text-white mb-4 text-center">Cambio P2P</h3>
              <form onSubmit={conUnSoloClick(realizarCambioP2P)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Moneda desde</label>
                    <select value={p2pForm.monedaDe} onChange={(e) => setP2pForm({ ...p2pForm, monedaDe: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500">
                      <option value="usdt">USDT</option>
                      <option value="bs">BS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Moneda para</label>
                    <select value={p2pForm.monedaPara} onChange={(e) => setP2pForm({ ...p2pForm, monedaPara: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500">
                      <option value="bs">BS</option>
                      <option value="usdt">USDT</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Monto</label>
                  <input type="number" min="0" step="0.01" value={p2pForm.monto} onChange={(e) => setP2pForm({ ...p2pForm, monto: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500" placeholder="Ej: 100" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Tasa</label>
                  <input type="number" min="0" step="0.01" value={p2pForm.tasa} onChange={(e) => setP2pForm({ ...p2pForm, tasa: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500" placeholder="Ej: 718.50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 tracking-widest mb-2 block">Responsable del cambio</label>
                  <select value={p2pForm.usuario} onChange={(e) => setP2pForm({ ...p2pForm, usuario: e.target.value })} className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500">
                    <option value="">Selecciona una persona</option>
                    <option value={perfil?.nombre || 'Tú'}>{perfil?.nombre || 'Tú'}</option>
                    {participantes?.map((p:any) => (
                      <option key={p.id} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Realizar Cambio</button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <nav className={`fixed bottom-0 left-0 right-0 bg-[#1a0f2e]/90 backdrop-blur-xl border-t ${theme.border} p-3 md:hidden z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => { onChangeView('dashboard'); setActiveTab('inicio'); }} theme={theme} />
          <NavButton dataTutorial="nav-presupuesto" icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('pagos'); } }} theme={theme} />

          <div className="relative -top-5">
            {/* Botón Central sin sombra brillante */}
            <button data-tutorial="nav-espacios" onClick={() => setIsSpacesMenuOpen(true)} className="bg-[#2563EB] text-white p-4 rounded-full active:scale-95 transition-transform border-4 border-[#0d0714]">
               <Layers className="w-6 h-6" />
            </button>
          </div>

          <NavButton dataTutorial="nav-mercado" icon={<ShoppingCart />} label="Mercado" active={isMercadoOpen} onClick={() => { if(isGuest || !perfil?.is_pro) onTriggerPaywall?.(); else setIsMercadoOpen(true); }} theme={theme} pro={!isGuest && !perfil?.is_pro} />

          {espacioActivo?.tipo !== 'vaca' && (
            <NavButton dataTutorial="nav-reserva" icon={<Shield />} label="Reserva" active={activeTab === 'emergencia'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('emergencia'); } }} theme={theme} />
          )}
        </div>
      </nav>

      <nav className="hidden md:flex justify-center mt-8 space-x-4">
        <NavButtonDesktop icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => { onChangeView('dashboard'); setActiveTab('inicio'); }} theme={theme} />
        <NavButtonDesktop dataTutorial="nav-presupuesto" icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('pagos'); } }} theme={theme} />
        <NavButtonDesktop dataTutorial="nav-espacios" icon={<Layers />} label="Cambiar Espacio" active={false} onClick={() => setIsSpacesMenuOpen(true)} theme={{primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500/30'}} />
        <NavButtonDesktop dataTutorial="nav-mercado" icon={<ShoppingCart />} label="Mercado" active={isMercadoOpen} onClick={() => { if(isGuest || !perfil?.is_pro) onTriggerPaywall?.(); else setIsMercadoOpen(true); }} theme={theme} pro={!isGuest && !perfil?.is_pro} />
        {espacioActivo?.tipo !== 'vaca' && (
          <NavButtonDesktop dataTutorial="nav-reserva" icon={<Shield />} label="Por si acaso" active={activeTab === 'emergencia'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('emergencia'); } }} theme={theme} />
        )}
      </nav>

      {isMercadoOpen && espacioActivo && (
        <MercadoSession
          espacioActivo={espacioActivo}
          session={session}
          rates={rates}
          theme={theme}
          triggerToast={triggerToast}
          onClose={() => setIsMercadoOpen(false)}
          onSesionFinalizada={conUnSoloClick(finalizarSesionMercado)}
          puedeEscanear={puedeEscanear}
          registrarEscaneo={registrarEscaneo}
          onTriggerPaywall={onTriggerPaywall}
        />
      )}

{/* === BOTÓN FLOTANTE DE NOTAS (SOLO EN PRESUPUESTO) === */}
      {activeTab === 'pagos' && (
        <>
          <Drawer.Root open={isNotasOpen} onOpenChange={setIsNotasOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/70 z-[90] backdrop-blur-sm" />
              <Drawer.Content className="bg-[#1C1C1E] flex flex-col rounded-t-[32px] h-[85vh] fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 shadow-2xl">
                <Drawer.Title className="sr-only">Notas</Drawer.Title>
                <div className="p-6 flex-1 overflow-y-auto pb-12">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <RecordatoriosTab
                    espacioActivo={espacioActivo}
                    recordatorios={recordatorios}
                    theme={theme}
                    onAgregarRecordatorio={async (texto: string) => {
                      if (!texto.trim() || isGuest || !espacioActivo) return;
                      const { error } = await supabase.from('recordatorios').insert([{ texto, espacio_id: espacioActivo.id, usuario_id: session?.user?.id }]);
                      if (!error) fetchData();
                    }}
                    onToggleRecordatorio={async (id: string, completado: boolean) => {
                      if (isGuest) return;
                      await supabase.from('recordatorios').update({ completado: !completado }).eq('id', id);
                      fetchData();
                    }}
                    onEliminarRecordatorio={async (id: string) => {
                      if (isGuest) return;
                      await supabase.from('recordatorios').delete().eq('id', id);
                      fetchData();
                    }}
                    triggerToast={triggerToast}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          <button
            data-tutorial="fab-notas"
            onClick={() => setIsNotasOpen(true)}
            className={`fixed bottom-24 md:bottom-10 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${theme.primary} text-white`}
            style={{ boxShadow: `0 10px 25px -5px ${theme.stroke}66` }}
          >
            <ListTodo className="w-7 h-7" />
          </button>
        </>
      )}

{/* === BOTÓN FLOTANTE (FAB) + MENÚ RÁPIDO === */}
      {activeTab === 'inicio' && (
        <>
          <Drawer.Root open={isFABMenuOpen} onOpenChange={setIsFABMenuOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/70 z-[90] backdrop-blur-sm" />
              
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 shadow-2xl max-h-[85vh]">
                
                {/* Etiquetas para accesibilidad */}
                <Drawer.Title className="sr-only">Menú de Acciones Rápidas</Drawer.Title>
                <Drawer.Description className="sr-only">Opciones para registrar ingresos, egresos y p2p</Drawer.Description>

                <div className="p-6 md:p-8 bg-[#1C1C1E] rounded-t-[32px] flex-1 overflow-y-auto pb-12 border border-white/5">
                  <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-[#333] mb-8" />
                  
                  <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Actividad</h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* OPCIÓN 1: CARGAR ESTADO DE CUENTA (Destacado Full Width) */}
                    <button
                      type="button"
                      disabled={isScanningEstadoCuenta}
                      onClick={() => { setIsFABMenuOpen(false); setTimeout(() => handleTryScanEstadoCuenta(), 150); }}
                      className="flex items-center justify-between p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 cursor-pointer transition-all hover:bg-emerald-500/20 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          {isScanningEstadoCuenta ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /> : <Landmark className="w-6 h-6 text-emerald-400" />}
                        </div>
                        <div className="text-left">
                          <span className="block font-black text-emerald-400 uppercase tracking-widest text-sm">Cargar Estado de Cuenta</span>
                          <span className="text-[10px] text-emerald-400/60 font-bold">La IA detecta tus ingresos y egresos por ti</span>
                        </div>
                      </div>
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </button>

                    {/* BOTONES DIRECTOS: INGRESO, GASTO Y EXTRAS */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* NUEVO INGRESO DIRECTO */}
                      <button onClick={() => { 
                          setIsFABMenuOpen(false); 
                          setTipo("ingreso"); 
                          setCategoria("salario");
                          setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 150); 
                        }} 
                        className="flex flex-col items-center justify-center gap-3 p-5 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] hover:border-emerald-500/30 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                          <ArrowUpCircle className="w-7 h-7 text-emerald-400" />
                        </div>
                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Ingreso</span>
                      </button>

                      {/* NUEVO GASTO MANUAL DIRECTO */}
                      <button onClick={() => { 
                          setIsFABMenuOpen(false); 
                          setTipo("egreso"); 
                          setCategoria("comida");
                          setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 150); 
                        }} 
                        className="flex flex-col items-center justify-center gap-3 p-5 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] hover:border-rose-500/30 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                          <ArrowDownCircle className="w-7 h-7 text-rose-400" />
                        </div>
                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Gasto Manual</span>
                      </button>

                      {/* CAMBIO P2P */}
                     <button 
  onClick={() => { 
    setIsFABMenuOpen(false); 
    setTimeout(() => setIsP2POpen(true), 300); // <-- El retraso arregla el bug
  }} 
  className="flex flex-col items-center justify-center gap-3 p-5 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] group"
>
  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
    <ArrowLeftRight className="w-5 h-5 text-amber-400" />
  </div>
  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Cambio P2P</span>
</button>

                      {/* DINÁMICA (AÑADIR MIEMBRO O ABONO META) */}
                      {espacioActivo?.tipo !== 'individual' ? (
                        <button onClick={() => { setIsFABMenuOpen(false); setIsManageUsersOpen(true); }} className="flex flex-col items-center justify-center gap-3 p-5 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] group">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <UserPlus className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Miembro</span>
                        </button>
                      ) : (
                        <button onClick={() => { setIsFABMenuOpen(false); setTipo("ingreso"); setCategoria("abono_pote"); setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 150); }} className="flex flex-col items-center justify-center gap-3 p-5 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] group">
                          <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                            <Target className="w-5 h-5 text-fuchsia-400" />
                          </div>
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Abono Meta</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
          
          {/* ========================================================= */}
          {/* BOTÓN FLOTANTE MATE BLUE */}
          {/* ========================================================= */}
          <button
            data-tutorial="fab"
            onClick={() => setIsFABMenuOpen(true)}
            className={`fixed bottom-24 md:bottom-10 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 
              ${isScanning ? 'scale-90 opacity-80 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} 
              bg-[#2563EB] text-white`}
            style={{ boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}
          >
            {isScanning ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" strokeWidth={3} />}
          </button>

          {/* ========================================================= */}
          {/* 🟢 GHOST TRIGGER: SIEMPRE VIVO PARA RESPONDER A LA IA */}
          {/* ========================================================= */}
    <TransactionDrawer
            tipo={tipo} setTipo={setTipo} categoria={categoria} setCategoria={setCategoria}
            customCategoria={customCategoria} setCustomCategoria={setCustomCategoria} categoriasApi={categoriasApi}
            monto={monto} setMonto={setMonto} moneda={moneda} setMoneda={setMoneda}
            activeRates={activeRates} setActiveRates={setActiveRates}
            descripcion={descripcion} setDescripcion={setDescripcion} rates={rates} theme={theme} onSubmit={conUnSoloClick(handleManualSubmit)}
            espacios={espacios} espacioActivo={espacioActivo} potes={potes}
            participantes={participantes} usuario={usuario} setUsuario={setUsuario}
            destinoTransferencia={destinoTransferencia} setDestinoTransferencia={setDestinoTransferencia}
          >
            <button id="nuevo-registro-trigger" className="hidden">Gatillo Oculto</button>
          </TransactionDrawer>
        </>
      )}

      {/* === TOAST DE NOTIFICACIONES (MENSAJES DE MOTIVACIÓN) === */}
      {showToast && (
        <div
          onClick={cerrarToast}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
        >
          <div className="bg-[#1C1C1E] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-5 max-w-md w-full animate-in zoom-in">
            <div className="w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-lg bg-[#121212] border border-white/5">
              <img 
                src="/pote.png" 
                alt="Logo Pote" 
                className={`w-14 h-14 object-contain transition-all ${
                  toastType === 'ingreso' 
                    ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                    : 'drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                }`} 
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-black text-lg italic text-center leading-tight">"{mensajeMotivacional}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function NavButton({ icon, label, active, onClick, theme, pro, dataTutorial }: any) {
  return (
    <button data-tutorial={dataTutorial} onClick={onClick} className={`relative flex flex-col items-center gap-1 transition-all ${active ? `${theme.text} scale-110` : 'text-white/40 hover:text-white/80'}`}>
      <div className={`relative p-2 rounded-xl ${active ? theme.lightBg : ''}`}>
        {icon}
        {pro && <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[6px] font-black px-1 rounded-full">PRO</span>}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NavButtonDesktop({ icon, label, active, onClick, theme, pro, dataTutorial }: any) {
  return (
    <button data-tutorial={dataTutorial} onClick={onClick} className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${active ? `${theme.primary} text-white shadow-lg` : `bg-[#1a0f2e] ${theme.text} border ${theme.border} hover:bg-white/5`}`}>
      {icon} {label}
      {pro && <span className="bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded ml-1">PRO</span>}
    </button>
  );
}

// ============================================================================
// COMPONENTE DE CELEBRACIÓN DE RACHA (DISEÑO PREMIUM TEXTUAL CON BLINDAJE Y CORRECCIONES)
// ============================================================================
function StreakCelebrationModal({ isOpen, onClose, dias, recompensa }: any) {
  if (!recompensa) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop" // CLAVE AGREGADA PARA EVITAR EL ERROR DE KEYS
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // 🔴 FIJADO: z-index altísimo para blindar contra el panel de perfil 🔴
          // 🔴 FIJADO: Eliminado el gradiente del fondo. Ahora es un overlay negro limpio 🔴
          className="fixed inset-0 z-[1000000] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md pointer-events-auto"
          onClick={onClose} // Cerrar al tocar fuera del contenido
        />
      )}

      {isOpen && (
        <motion.div
          key="content" // CLAVE AGREGADA PARA EVITAR EL ERROR DE KEYS y ANIMACIÓN DE SALIDA
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          // 🔴 FIJADO: z-index superior para estar sobre el backdrop y el panel de perfil 🔴
          className="fixed inset-0 z-[1000001] flex flex-col items-center justify-center p-8 pointer-events-none"
        >
          {/* Diseño centralizado y compacto. Aseguramos que el contenido sí reciba eventos */}
          <div className="text-center w-full max-w-sm flex flex-col items-center gap-2 pointer-events-auto">
            
            {/* Texto de cabecera limpio */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-base md:text-xl uppercase font-black tracking-[0.2em] mb-2"
            >
              Días de racha financiera
            </motion.p>

            {/* 🔥 Número de racha gigante con efecto de fuego integrado 🔥 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
              className={`relative flex items-center justify-center pt-2 pb-6 ${recompensa.glow || ''}`}
            >
              <span className="text-[140px] md:text-[200px] font-black leading-none font-sans tabular-nums tracking-tighter" style={{ color: recompensa.color, textShadow: `0 0 50px ${recompensa.color}80` }}>
                {dias}
              </span>
              <span className="absolute -top-1 -right-1 text-[24px] drop-shadow-md">🔥</span>
            </motion.div>
            
            {/* Mensaje de felicitación directo, sin recuadros toscos */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`text-center space-y-1 mb-8 ${recompensa.pulse ? 'animate-pulse' : ''}`}
            >
                <h2 className="text-2xl md:text-3xl font-black text-white">{recompensa.nombre}</h2>
                <p className="text-white/80 text-base md:text-lg">{recompensa.desc}</p>
            </motion.div>
          
            {/* Botón continuar prominent, parte del flujo */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              // 🔴 FIJADO: Agregado onClick={onClose} para que sirva el botón 🔴
              onClick={onClose}
              className="mt-6 px-12 py-5 bg-white text-black font-black rounded-full text-xl shadow-2xl pointer-events-auto hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              ¡CONTINUAR!
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedNum({ value, format = 'usd' }: { value: number, format?: 'usd'|'bs'|'pct' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; 
    const startValue = display;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4); 
      setDisplay(startValue + easeOut * (value - startValue));
      if (progress < 1) window.requestAnimationFrame(step);
      else setDisplay(value);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  if (format === 'bs') return <span>{display.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  if (format === 'pct') return <span>{display.toFixed(1)}%</span>;
  return <span>{display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}
