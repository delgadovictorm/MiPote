"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X, Bell, Send, PieChart as PieChartIcon, Target, Home, CreditCard, StickyNote, Calculator, Lock, Mail, LogIn, UserPlus, Sparkles, ArrowLeft, Shield, Key, Copy, UploadCloud, Phone, QrCode, Menu, LogOut
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TransactionDrawer } from "@/components/TransactionDrawer";
import { Drawer } from "vaul";

export default function MiPoteApp() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null); 
  const [isPro, setIsPro] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState('auth'); 
  
  // ESTADOS DE AUTENTICACIÓN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState(""); 
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState("");

  const [espacios, setEspacios] = useState<any[]>([]);
  const [espacioActivo, setEspacioActivo] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // ESTADOS DEL PERFIL
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");

  // ESTADOS DE LA PASARELA DE PAGO
  const [checkoutPaso, setCheckoutPaso] = useState(1);
  const [metodoPago, setMetodoPago] = useState("pagomovil");
  const [referencia, setReferencia] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviandoPago, setEnviandoPago] = useState(false);
  const [tasaCheckout, setTasaCheckout] = useState(45.00);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        cargarDatosUsuario(session.user.id).then(() => setCurrentView('dashboard'));
      } else {
        setLoadingAuth(false);
        setCurrentView('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        cargarDatosUsuario(session.user.id).then(() => setCurrentView('dashboard'));
      } else {
        setLoadingAuth(false);
        setCurrentView('auth');
      }
    });

    fetch("/api/rates").then(res => res.json()).then(data => { if(data.success) setTasaCheckout(data.usdt) });

    return () => subscription.unsubscribe();
  }, []);

  const cargarDatosUsuario = async (userId: string) => {
    setEspacios([]);
    setPerfil(null);

    let { data: perfilBd } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (!perfilBd) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newPerfil } = await supabase.from('perfiles').insert([{ id: userId, is_pro: false, estado_pago: 'gratis', email: user?.email }]).select().single();
      perfilBd = newPerfil;
    }
    setIsPro(perfilBd?.is_pro || false);
    setPerfil(perfilBd);

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
      
      const individualSpace = espaciosCorregidos.find(e => e.tipo === 'individual');
      if (individualSpace) setEspacioActivo(individualSpace);
      else setEspacioActivo(espaciosCorregidos[0]);
    } else {
      setEspacios([]);
    }
    
    setLoadingAuth(false);
  };

  const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoadingAuth(true);

    if (isLoginView) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      if (!telefono) { setAuthError("El número de WhatsApp es obligatorio"); setLoadingAuth(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else if (data.user) {
        await supabase.from('perfiles').insert([{ id: data.user.id, email: data.user.email, telefono: telefono, is_pro: false, estado_pago: 'gratis' }]);
        const { data: newSpace } = await supabase.from('espacios').insert([{ nombre: 'Mi Billetera', tipo: 'individual', creador_id: data.user.id }]).select().single();
        if (newSpace) await supabase.from('espacio_miembros').insert([{ espacio_id: newSpace.id, usuario_id: data.user.id, rol: 'admin' }]);
        
        alert("Cuenta creada exitosamente. Ya puedes iniciar sesión.");
        setIsLoginView(true);
      }
    }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    setEspacioActivo(null); 
    setEspacios([]); 
    setIsGuest(false); 
    setIsPro(false); 
    setPerfil(null); 
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

  const procesarPagoPRO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !session.user) return alert("Debes iniciar sesión para pagar.");
    if (!archivo) return alert("Por favor sube la captura de pantalla del pago.");
    
    setEnviandoPago(true);
    const formData = new FormData();
    formData.append("photo", archivo);
    
    const ordenNumero = (200000 + (parseInt(session.user.id.substring(0, 4), 16) % 90000)).toString();
    const mensaje = `💰 *NUEVO REPORTE DE PAGO MI POTE*\n\n📧 *Usuario:* ${session.user.email}\n🔢 *Orden:* #${ordenNumero}\n💳 *Método:* ${metodoPago.toUpperCase()}\n🧾 *Ref:* ${referencia}\n💲 *Monto:* $2.99\n\n_Acción: Revisa el panel Admin para aprobar._`;
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
    if (!isPro) { setShowJoinModal(false); setShowPaywall(true); return; }

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
        
        if (spaceFound.tipo === 'pote' && count !== null && count >= 2) {
          alert("❌ Este Pote ya está lleno (Máximo 2 personas permitidas en modo pareja).");
          setLoadingAuth(false);
          return;
        }

        await supabase.from('espacio_miembros').insert([{ espacio_id: spaceFound.id, usuario_id: session.user.id, rol: 'miembro' }]);
        await supabase.from('participantes').insert([{ nombre: (perfil?.nombre || session.user.email.split('@')[0]), espacio_id: spaceFound.id }]);
        
        setEspacios([...espacios, spaceFound]);
        setEspacioActivo(spaceFound);
        setShowJoinModal(false);
        setJoinCode("");
        setCurrentView('dashboard');
        alert("✅ ¡Te has unido exitosamente al espacio!");
      }
    }
    setLoadingAuth(false);
  };

  const seleccionarModulo = async (tipoModulo: string) => {
    if (!session) {
      if (tipoModulo === 'individual') { setIsGuest(true); setEspacioActivo({ id: 'guest', nombre: 'Mi Billetera', tipo: 'individual' }); setCurrentView('dashboard'); } 
      else { setShowPaywall(true); }
      return;
    }

    let esCuentaPro = isPro;
    const { data: perfilData } = await supabase.from('perfiles').select('is_pro').eq('id', session.user.id).single();
    if (perfilData) {
      esCuentaPro = perfilData.is_pro;
      setIsPro(perfilData.is_pro);
    }

    if (tipoModulo !== 'individual' && !esCuentaPro) { setShowPaywall(true); return; }

    setIsGuest(false);
    let espacioEncontrado = espacios.find(e => e.tipo === tipoModulo);
    
    if (espacioEncontrado) {
      setEspacioActivo(espacioEncontrado);
      setCurrentView('dashboard');
    } else {
      const titulos: Record<string, string> = { 'individual': 'Mi Billetera', 'pote': 'Mi Pote', 'vaca': 'La Vaca' };
      const { data: newSpace } = await supabase.from('espacios').insert([{
        nombre: titulos[tipoModulo],
        tipo: tipoModulo,
        creador_id: session.user.id,
        codigo_invitacion: tipoModulo !== 'individual' ? generarCodigo() : null
      }]).select().single();

      if (newSpace) {
        await supabase.from('espacio_miembros').insert([{ espacio_id: newSpace.id, usuario_id: session.user.id, rol: 'admin' }]);
        setEspacios([...espacios, newSpace]);
        setEspacioActivo(newSpace);
        setCurrentView('dashboard');
      }
    }
  };

  if (loadingAuth) return ( <div className="min-h-screen bg-[#0d0714] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div> );

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-[#0d0714] flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-md bg-[#1a0f2e] border border-purple-500/30 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img src="/pote.png" alt="Mi Pote" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] mb-4" />
            <h1 className="text-2xl font-black text-white">{isLoginView ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {authError && <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{authError}</p>}
            <div className="space-y-1">
              <label className="text-[10px] text-purple-300 uppercase font-bold tracking-widest pl-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400 transition-colors" required />
              </div>
            </div>
            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-[10px] text-purple-300 uppercase font-bold tracking-widest pl-1">WhatsApp (Teléfono)</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 04121234567" className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400 transition-colors" required />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] text-purple-300 uppercase font-bold tracking-widest pl-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400 transition-colors" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
              {isLoginView ? <><LogIn className="w-5 h-5"/> INICIAR SESIÓN</> : <><UserPlus className="w-5 h-5"/> REGISTRARME</>}
            </button>
            <button type="button" onClick={() => { setIsGuest(true); setCurrentView('dashboard'); setEspacioActivo({ id: 'guest', nombre: 'Mi Billetera', tipo: 'individual' }); }} className="w-full bg-transparent border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 text-xs">
              <Sparkles className="w-4 h-4"/> Entrar como Invitado
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsLoginView(!isLoginView)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              {isLoginView ? "¿Nuevo aquí? Crea una cuenta gratis" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'calculadora-libre') {
    return (
      <div className="min-h-screen bg-[#0d0714] p-4 flex flex-col items-center pt-10">
        <div className="w-full max-w-md relative">
          <button onClick={() => setCurrentView('dashboard')} className="absolute -top-10 left-0 text-purple-400 flex items-center gap-2 text-sm font-bold"><ArrowLeft className="w-4 h-4"/> Volver</button>
          <FinanzasDashboardContent session={session} espacioActivo={espacioActivo} onSelectModule={seleccionarModulo} handleLogout={handleLogout} openJoinModal={() => setShowJoinModal(true)} openProfileModal={() => setShowProfileModal(true)} isGuest={isGuest} perfil={perfil} forceTab="calculadora" onChangeView={setCurrentView} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0714] flex flex-col items-center p-0 md:p-4">
      {/* MODAL INGRESAR CÓDIGO */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={unirseConCodigo} className="bg-[#1a0f2e] border border-blue-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] max-w-sm w-full text-center relative">
            <button type="button" onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20"><Key className="w-8 h-8 text-blue-400" /></div>
            <h3 className="text-xl font-black text-white mb-2">Unirse a un Espacio</h3>
            <p className="text-sm text-blue-300 mb-6">Ingresa el código de invitación que te compartió tu pareja o amigo.</p>
            <input type="text" value={joinCode} onChange={(e)=>setJoinCode(e.target.value.toUpperCase())} placeholder="EJ: X7K9P2" className="w-full bg-black/50 border border-blue-500/30 rounded-xl p-4 text-center text-xl font-bold text-white mb-4 outline-none focus:border-blue-400 uppercase tracking-widest tabular-nums" required maxLength={6} />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">VERIFICAR CÓDIGO</button>
          </form>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={guardarPerfil} className="bg-[#1a0f2e] border border-purple-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.2)] max-w-sm w-full text-center relative">
            <button type="button" onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20"><UserPlus className="w-8 h-8 text-purple-400" /></div>
            <h3 className="text-xl font-black text-white mb-2">Tu Perfil</h3>
            <p className="text-sm text-purple-300 mb-6">¿Cómo quieres que te llamen en tus potes y vacas?</p>
            <input type="text" value={editNombre} onChange={(e)=>setEditNombre(e.target.value)} placeholder="Ej: Víctor Delgado" className="w-full bg-black/50 border border-purple-500/30 rounded-xl p-4 text-center text-lg font-bold text-white mb-4 outline-none focus:border-purple-400" required />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">GUARDAR NOMBRE</button>
          </form>
        </div>
      )}

      <div className="w-full max-w-5xl relative">
        <FinanzasDashboardContent 
          key={`${session?.user?.id || 'guest'}-${espacioActivo?.id || 'none'}`}
          session={session} 
          espacioActivo={espacioActivo} 
          onSelectModule={seleccionarModulo}
          handleLogout={handleLogout}
          openJoinModal={() => setShowJoinModal(true)}
          openProfileModal={() => { setEditNombre(perfil?.nombre || session?.user?.email?.split('@')[0]); setShowProfileModal(true); }}
          isGuest={isGuest}
          perfil={perfil}
          onTriggerPaywall={() => setShowPaywall(true)}
          showPaywall={showPaywall}
          setShowPaywall={setShowPaywall}
          checkoutPaso={checkoutPaso}
          setCheckoutPaso={setCheckoutPaso}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          referencia={referencia}
          setReferencia={setReferencia}
          archivo={archivo}
          setArchivo={setArchivo}
          enviandoPago={enviandoPago}
          tasaCheckout={tasaCheckout}
          procesarPagoPRO={procesarPagoPRO}
          goAuth={() => {setShowPaywall(false); setCurrentView('auth'); setIsLoginView(false);}}
          onChangeView={setCurrentView}
        />
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD PRINCIPAL - NÚCLEO DINÁMICO
// ============================================================================
function FinanzasDashboardContent({ 
  session, espacioActivo, onSelectModule, handleLogout, openJoinModal, openProfileModal, isGuest = false, perfil, onTriggerPaywall, 
  showPaywall, setShowPaywall, checkoutPaso, setCheckoutPaso, metodoPago, 
  setMetodoPago, referencia, setReferencia, archivo, setArchivo, enviandoPago, 
  tasaCheckout, procesarPagoPRO, forceTab, goAuth, onChangeView
}: any) {
  const getTheme = (tipo: string) => {
    switch(tipo) {
      case 'pote': return { primary: 'bg-fuchsia-600', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', card: 'from-fuchsia-600/40', darkBg: 'bg-fuchsia-950/30', stroke: '#c026d3', lightBg: 'bg-fuchsia-500/10' };
      case 'vaca': return { primary: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500/30', card: 'from-emerald-600/40', darkBg: 'bg-emerald-950/30', stroke: '#059669', lightBg: 'bg-emerald-500/10' };
      default: return { primary: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500/30', card: 'from-purple-600/40', darkBg: 'bg-purple-950/30', stroke: '#9333ea', lightBg: 'bg-purple-500/10' };
    }
  };
  const theme = getTheme(espacioActivo?.tipo || 'individual');

  const [activeTab, setActiveTab] = useState(forceTab || "inicio");
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [activeWallet, setActiveWallet] = useState<'usdt'|'bs'|'cash'>('usdt'); 
  const [filtroHistorial, setFiltroHistorial] = useState("Todos");
  const [showQRModal, setShowQRModal] = useState(false);

  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cuotasCashea, setCuotasCashea] = useState<any[]>([]);
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [potes, setPotes] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  
  const [isAddingPote, setIsAddingPote] = useState(false);
  const POTE_OPCIONES = espacioActivo?.tipo === 'vaca' 
    ? ["La rumba 🪩", "Pa' la caña 🍻", "El viaje ✈️", "La nave 🚗", "Personalizado ✍️"]
    : ["La nave 🚗", "Los estrenos 👕", "El gustico 🍔", "El semestre 📚", "Teléfono 📱", "Viaje ✈️", "Hogar 🏠", "Personalizado ✍️"];
  
  const [poteForm, setPoteForm] = useState({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
  
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [nuevoPart, setNuevoPart] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().toISOString().slice(0, 7));

  const [isAddingEmergencia, setIsAddingEmergencia] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddingCashea, setIsAddingCashea] = useState(false);

  const DEFAULT_CATEGORIES = [
    { valor: "salario", label: "Ingreso / Salario 💰" },
    { valor: "comida", label: "Comida 🍔" },
    { valor: "internet", label: "Internet / Servicios 🌐" },
    { valor: "mascotas", label: "Mascotas 🐾" },
    { valor: "cashea", label: "Cashea 🛍️" },
    { valor: "otro", label: "Otro (Personalizado) ✍️" }
  ];
  const [categoriasList, setCategoriasList] = useState<any[]>(DEFAULT_CATEGORIES);

  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "" });
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");
  const [budgetForm, setBudgetForm] = useState({ categoria: "", monto_limite: "" });

  const [showToast, setShowToast] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState("");
  const [toastType, setToastType] = useState("ingreso");

  const [calcMonto, setCalcMonto] = useState("");
  const [calcMoneda, setCalcMoneda] = useState("usd");

  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("usd");
  const [tipo, setTipo] = useState("egreso");
  const [categoria, setCategoria] = useState("comida");
  const [descripcion, setDescripcion] = useState("");
  const [usuario, setUsuario] = useState("");

  const getMensajes = (tipoApp: string, tipoTx: string) => {
    if (tipoApp === 'pote') {
      return tipoTx === 'ingreso' ? [
        "¡Epa! Ese pote está engordando, mi amor. 🍯💰", 
        "¡Poniendo pa' lo nuestro! ❤️", 
        "Gotita a gotita llenamos el tobo. 🪣", 
        "¡Así se construye nuestro imperio! 🏰", 
        "Platica pa' la casa y pa' la vida juntos. 🏠💸", 
        "Juntos somos invencibles con la plata. 💪👫", 
        "Echándole pichón pa' cumplir esa meta. 🚀", 
        "¡Este equipo no lo para nadie! 🥇", 
        "Mi amor, a este paso nos compramos Caracas. 🏙️", 
        "Pote lleno, corazón contento. ❤️🍯", 
        "Trabajando juntos por ese sueño. 🌟", 
        "Sumando bloques a nuestra casita de ahorros. 🧱", 
        "Esa meta ya nos está guiñando el ojo. 😉", 
        "¡Dinero asegurado, mi vida! 🔒", 
        "Qué rico ver cómo crece nuestro sudor ahí reflejado. 💦💰"
      ] : [
        "¿De pana necesitábamos gastar en esto, mi amor? 🤨", 
        "Mosca con la tarjeta, que nos descuadramos. 💳", 
        "Gastico hormiga detectado, pila ahí. 🐜", 
        "Pilas que ese gustico nos aleja de la meta. 📉", 
        "Mi vida, este gasto dolió en el alma (y en el bolsillo). 💔", 
        "Nos salimos del presupuesto, arropate hasta donde llegue la cobija. 🛏️", 
        "Cuidado con los antojos que nos dejan limpios. 🍔🚫", 
        "Pelando bola en 3, 2, 1... si seguimos así. 📉", 
        "Este mes nos toca comer arepa con mantequilla. 🫓", 
        "No dejes que la emoción nos vacíe el pote. 🍯🥄", 
        "Pendiente con el despilfarro, mi amor. 💸", 
        "Mosca con las compras nerviosas. 🛍️", 
        "Si le seguimos sacando al pote, no vamos a llegar nunca. 🐌", 
        "Administra bien que la cosa no está fácil. 🇻🇪", 
        "Amor, recuerda la meta... no nos desviemos. 🎯"
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
    setTimeout(() => setShowToast(false), 4500);
  };

  const fetchData = useCallback(async () => {
    setTransactions([]); setCuotasCashea([]); setRecordatorios([]); setPresupuestos([]); setPotes([]); setParticipantes([]);

    if (!espacioActivo && !forceTab) return;
    setLoading(true);
    
    try {
      // EXCEPCIÓN: La calculadora libre no requiere validación PRO
      if (forceTab !== 'calculadora' && !isGuest && espacioActivo?.tipo !== 'individual') {
         const { data: checkPro } = await supabase.from('perfiles').select('is_pro').eq('id', session?.user?.id).single();
         if (!checkPro?.is_pro) {
             alert("Tu acceso PRO ha expirado o fue revocado por el administrador.");
             handleLogout?.(); 
             onTriggerPaywall?.(); 
             return;
         }
      }

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
        
        const { data: catData } = await supabase.from("categorias").select("*");
        if (catData) {
          const combined = [...DEFAULT_CATEGORIES, ...catData];
          const uniqueCats = Array.from(new Map(combined.map(item => [item.valor, item])).values());
          setCategoriasList(uniqueCats);
        }

        const { data: recData } = await supabase.from("recordatorios").select("*").eq("espacio_id", espacioActivo.id).order("created_at", { ascending: false });
        if (recData) setRecordatorios(recData);

        const { data: presData } = await supabase.from("presupuestos").select("*").eq("espacio_id", espacioActivo.id);
        if (presData) setPresupuestos(presData);

        const { data: metasData } = await supabase.from("metas").select("*").eq("espacio_id", espacioActivo.id).order("created_at", { ascending: true });
        if (metasData) setPotes(metasData);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [espacioActivo, isGuest, forceTab, session?.user?.id, handleLogout, onTriggerPaywall]);

  const fetchRates = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      if (data.success) setRates({ bcv: data.bcv, usdt: data.usdt });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchRates(); fetchData(); }, [fetchData]);

  useEffect(() => {
    if (espacioActivo?.tipo === 'individual') {
      setUsuario((perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú");
    } else {
      setUsuario(""); 
    }
  }, [espacioActivo, session]);

  const nombresParticipantes = participantes.map(p => p.nombre);
  const filterOptions = ["Todos", ...nombresParticipantes];
  if (espacioActivo?.tipo !== 'individual' && !filterOptions.includes("Ambos")) filterOptions.push(espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)');

  const verificarLimiteInvitado = () => {
    if (!isGuest) return true;
    const count = parseInt(localStorage.getItem('mipote_guest_count') || '0');
    if (count >= 5) { onTriggerPaywall?.(); return false; }
    localStorage.setItem('mipote_guest_count', (count + 1).toString());
    return true;
  };

  const agregarParticipante = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nuevoPart.trim() || !espacioActivo) return;
    const { error } = await supabase.from("participantes").insert([{ nombre: nuevoPart.trim(), espacio_id: espacioActivo.id }]);
    if (error) { alert("🚨 Error al guardar participante: " + error.message); return; }
    setNuevoPart(""); setIsAddingPart(false); fetchData(); 
  };

  const eliminarParticipante = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre} de este espacio?`)) return;
    await supabase.from("participantes").delete().eq("id", id);
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

  const calcularMontos = (montoInput: number, monedaInput: string) => {
    let monto_bs = 0, monto_usd_bcv = 0, monto_usd_paralelo = 0;
    
    if (monedaInput === 'bs') {
      monto_bs = montoInput; 
      monto_usd_bcv = rates.bcv > 0 ? montoInput / rates.bcv : 0; 
      monto_usd_paralelo = rates.usdt > 0 ? montoInput / rates.usdt : 0;
    } else if (monedaInput === 'usdt' || monedaInput === 'usd') {
      monto_usd_paralelo = montoInput; 
      monto_usd_bcv = montoInput; 
      monto_bs = montoInput * rates.usdt;
    } else if (monedaInput === 'cash') {
      monto_usd_paralelo = montoInput; 
      monto_usd_bcv = montoInput; 
      monto_bs = montoInput * rates.bcv; 
    }
    return { monto_bs, monto_usd_bcv, monto_usd_paralelo };
  };

  const getPoteAhorrado = (poteId: string, poteNombre: string) => transactions.filter(tx => tx.categoria === `pote_${poteId}`).reduce((acc, tx) => tx.tipo === "ingreso" ? acc + (tx.monto_usd_paralelo || 0) : acc - (tx.monto_usd_paralelo || 0), 0);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !usuario.trim()) { alert("Completa el detalle y quién pagó."); return; }
    if (!verificarLimiteInvitado()) return;

    if (categoria === 'cashea') {
      const montoTotal = parseFloat(monto);
      const nCuotas = (window as any).numCuotasCashea || 3; 
      const montoCuota = montoTotal / nCuotas;
      
      const cuotasParaInsertar = [];
      const { addDays, format } = require('date-fns');

      for (let i = 1; i <= nCuotas; i++) {
        cuotasParaInsertar.push({
          articulo: descripcion,
          monto_cuota: montoCuota,
          fecha_pago: format(addDays(new Date(), i * 14), 'yyyy-MM-dd'),
          usuario: usuario,
          espacio_id: espacioActivo.id,
          pagado: false
        });
      }

      const { error } = await supabase.from("cashea").insert(cuotasParaInsertar);
      
      if (error) alert("🚨 Error Cashea: " + error.message);
      else {
        setMonto(""); setDescripcion(""); fetchData();
        triggerToast("egreso", `¡Brutal! Programadas ${nCuotas} cuotas de $${montoCuota.toFixed(2)}`);
      }
      return; 
    }

    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);
    
    let descFinal = descripcion; 
    let msjAlertaEspecial = null;

    if (categoria.startsWith("pote_")) {
       const poteRelacionado = potes.find(p => p.id.toString() === categoria.split("_")[1]);
       if (poteRelacionado) {
         descFinal = `Pote: ${poteRelacionado.nombre} - ${descripcion}`;
         if (tipo === 'ingreso') {
           const ahorradoActual = getPoteAhorrado(poteRelacionado.id, poteRelacionado.nombre);
           const nuevoAhorrado = ahorradoActual + monto_usd_paralelo;
           const pct = (nuevoAhorrado / poteRelacionado.monto_objetivo) * 100;
           if (pct >= 80 && pct < 100) msjAlertaEspecial = "¡Ponte las pilas, ya casi llegas a la meta! 🚀🔥";
         }
       }
    } else {
       let labelCategoria = categoriasList.find(c => c.valor === categoria)?.label || categoria;
       descFinal = `${labelCategoria} - ${descripcion}`;
    }

    if (isGuest) {
      const newTx = { id: Date.now().toString(), descripcion: descFinal, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria, usuario, tipo, created_at: new Date().toISOString() };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx); localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
      setMonto(""); setDescripcion(""); triggerToast(tipo, msjAlertaEspecial || undefined);
    } else {
      const { error } = await supabase.from("transacciones_saas").insert([{
        descripcion: descFinal, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria, usuario, tipo, espacio_id: espacioActivo.id, usuario_id: session.user.id
      }]);
      if (error) alert("🚨 Error: " + error.message);
      else { setMonto(""); setDescripcion(""); fetchData(); triggerToast(tipo, msjAlertaEspecial || undefined); }
    }
  };

  const handleEmergenciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !usuario.trim()) { alert("Completa el detalle y quién aportó/retiró."); return; }
    if (!verificarLimiteInvitado()) return;

    const valorMonto = parseFloat(monto);
    const { monto_bs, monto_usd_bcv, monto_usd_paralelo } = calcularMontos(valorMonto, moneda);
    
    if (isGuest) {
      const newTx = { id: Date.now().toString(), descripcion: `Emergencia - ${descripcion}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'emergencia', usuario, tipo, created_at: new Date().toISOString() };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx); localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
      setMonto(""); setDescripcion(""); triggerToast(tipo);
    } else {
      const { error } = await supabase.from("transacciones_saas").insert([{
        descripcion: `Emergencia - ${descripcion}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'emergencia', usuario, tipo, espacio_id: espacioActivo.id, usuario_id: session.user.id
      }]);
      if (error) alert("🚨 Error: " + error.message);
      else { setMonto(""); setDescripcion(""); fetchData(); triggerToast(tipo); }
    }
    setIsAddingEmergencia(false);
  };

  const eliminarTransaccion = async (id: string) => {
    if(!confirm("¿Seguro que deseas eliminar este registro?")) return;
    if (isGuest) {
      const updatedTx = transactions.filter(t => t.id !== id);
      setTransactions(updatedTx); localStorage.setItem('mipote_guest_tx', JSON.stringify(updatedTx));
    } else {
      await supabase.from("transacciones_saas").delete().eq("id", id); fetchData();
    }
  };

  const eliminarPote = async (id: string) => {
    await supabase.from("metas").delete().eq("id", id); fetchData();
  };

  const toggleCashea = async (cuota: any) => {
    const nuevoEstado = !cuota.pagado;
    await supabase.from("cashea").update({ pagado: nuevoEstado }).eq("id", cuota.id);
    if (nuevoEstado) {
      if (confirm(`¿Descontar $${cuota.monto_cuota} del balance de ${cuota.usuario} por el pago de Cashea?\n\n(Se aplicará arbitraje BCV vs Paralelo)`)) {
        const costo_bs = cuota.monto_cuota * rates.bcv;
        const costo_real_usdt = rates.usdt > 0 ? costo_bs / rates.usdt : cuota.monto_cuota;
        await supabase.from("transacciones_saas").insert([{
          descripcion: `Pago Cashea: ${cuota.articulo}`, monto_original: cuota.monto_cuota, moneda_original: "usd", monto_bs: costo_bs, monto_usd_bcv: cuota.monto_cuota, monto_usd_paralelo: costo_real_usdt, categoria: "cashea", usuario: cuota.usuario, tipo: "egreso", espacio_id: espacioActivo.id, usuario_id: session.user.id
        }]);
        triggerToast("egreso");
      } else { await supabase.from("cashea").update({ pagado: false }).eq("id", cuota.id); }
    }
    fetchData();
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
    await supabase.from("presupuestos").delete().eq("id", id); fetchData();
  };

  const agregarRecordatorio = async (e: React.FormEvent) => { 
    e.preventDefault(); if(!verificarLimiteInvitado()) return;
    if (!nuevoRecordatorio.trim()) return;
    await supabase.from("recordatorios").insert([{ texto: nuevoRecordatorio, usuario: (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado", espacio_id: espacioActivo.id }]);
    setNuevoRecordatorio(""); fetchData();
  };
  
  const eliminarRecordatorio = async (id: string) => { await supabase.from("recordatorios").delete().eq("id", id); fetchData(); };
  const toggleRecordatorio = async (id: string, estado: boolean) => { await supabase.from("recordatorios").update({ completado: !estado }).eq("id", id); fetchData(); };

  const agregarCashea = async (e: React.FormEvent) => { 
    e.preventDefault(); if(!verificarLimiteInvitado()) return; 
    if (!casheaForm.articulo || !casheaForm.monto_cuota || !casheaForm.fecha_pago) return;
    await supabase.from("cashea").insert([{ articulo: casheaForm.articulo, monto_cuota: parseFloat(casheaForm.monto_cuota), fecha_pago: casheaForm.fecha_pago, usuario: casheaForm.usuario, espacio_id: espacioActivo.id }]);
    setIsAddingCashea(false); setCasheaForm({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "" }); fetchData();
  };

  const getSaldosAislados = (userName?: string) => {
    let bs = 0, usdt = 0, cash = 0;
    
    transactions.forEach(tx => {
      if (tx.categoria.startsWith("pote_") || tx.categoria === 'emergencia') return; 
      
      let fraction = 0;
      const txUser = tx.usuario?.trim();
      const targetUser = userName?.trim();

      if (!userName || userName === 'ALL' || espacioActivo?.tipo === 'individual') {
          fraction = 1;
      } else {
          if (txUser === targetUser || (txUser === 'Tú' && targetUser === (perfil?.nombre || session?.user?.email?.split('@')[0]))) {
              fraction = 1;
          } else if (txUser === 'Ambos' || txUser === 'Todos (Div)') {
              const divisor = espacioActivo?.tipo === 'vaca' ? Math.max(participantes.length, 1) : 2;
              fraction = 1 / divisor;
          }
      }

      if (fraction > 0) {
        const montoNominal = tx.monto_original || tx.monto_usd_paralelo || 0;
        const signo = tx.tipo === "ingreso" ? 1 : -1;
        const valorReal = montoNominal * signo * fraction;
        
        const monedaEstricta = tx.moneda_original || (montoNominal > 1000 ? 'bs' : 'usd');

        if (monedaEstricta === 'bs') bs += valorReal;
        else if (monedaEstricta === 'cash') cash += valorReal;
        else usdt += valorReal;
      }
    });
    
    return { bs, usdt, cash };
  };

  const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));
  const transaccionesFiltradas = transaccionesDelMes.filter(tx => filtroHistorial === "Todos" || tx.usuario === filtroHistorial);

  const gastosDelMes = transaccionesDelMes.filter(tx => tx.tipo === 'egreso');
  
  const datosCategoriasMap = gastosDelMes.reduce((acc, tx) => {
    let catName = tx.categoria.startsWith('pote_') ? 'Extracción Potes' : 
                  tx.categoria === 'emergencia' ? 'Emergencias 🚨' : 
                  (categoriasList.find(c => c.valor === tx.categoria)?.label || tx.categoria);
    acc[catName] = (acc[catName] || 0) + (tx.monto_usd_paralelo || 0);
    return acc;
  }, {} as Record<string, number>);

  const dataGraficoTorta = Object.keys(datosCategoriasMap).map(key => ({ name: key, value: datosCategoriasMap[key] })).sort((a, b) => b.value - a.value);
  const COLORS = [theme.stroke, '#ec4899', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold text-xs mb-1">{payload[0].name || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs tabular-nums tracking-tight" style={{ color: entry.color }}>{entry.dataKey}: ${entry.value.toFixed(2)} USDT</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTabContent = () => {
    if (activeTab === 'calculadora' || forceTab === 'calculadora') {
      return (
        <div className={`bg-[#1a0f2e] border ${theme.border} p-6 rounded-[2rem] shadow-xl w-full max-w-md mx-auto mt-6 md:mt-10`}>
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-3 mb-6"><Calculator className={`w-6 h-6 ${theme.text}`} /> Calculadora Libre</h2>
          <div className="space-y-6">
            <div className={`bg-black/40 p-4 rounded-2xl border ${theme.border}`}>
              <label className={`text-[10px] uppercase ${theme.text} font-bold tracking-widest block mb-2`}>Ingresa el Monto</label>
              <div className="flex gap-3">
                <input type="number" step="0.01" placeholder="0.00" value={calcMonto} onChange={(e) => setCalcMonto(e.target.value)} className="flex-1 bg-transparent text-3xl font-black text-white outline-none tabular-nums tracking-tight w-full" />
                <select 
                  value={moneda} onChange={(e) => setMoneda(e.target.value)}
                  className="bg-[#121212] border border-[#333] rounded-xl px-3 text-sm text-white font-bold outline-none cursor-pointer">
                  <option value="cash">CASH</option>
                  <option value="bs">BS</option>
                  <option value="usdt">USDT</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme.darkBg} p-4 rounded-2xl border border-white/5 text-center`}>
                <p className={`text-[10px] uppercase ${theme.text} font-bold mb-1`}>{calcMoneda === 'bs' ? 'Equivale a (BCV)' : 'Pagar a Tasa BCV'}</p>
                <p className="text-xl font-black text-white tabular-nums tracking-tight">{calcMoneda === 'bs' ? `$ ${(rates.bcv > 0 ? parseFloat(calcMonto||"0")/rates.bcv : 0).toFixed(2)}` : `Bs. ${(parseFloat(calcMonto||"0")*rates.bcv).toFixed(2)}`}</p>
              </div>
              <div className={`${theme.darkBg} p-4 rounded-2xl border border-white/5 text-center`}>
                <p className={`text-[10px] uppercase ${theme.text} font-bold mb-1`}>{calcMoneda === 'bs' ? 'Equivale a (Paralelo)' : 'Pagar a Paralelo'}</p>
                <p className="text-xl font-black text-white tabular-nums tracking-tight">{calcMoneda === 'bs' ? `$ ${(rates.usdt > 0 ? parseFloat(calcMonto||"0")/rates.usdt : 0).toFixed(2)}` : `Bs. ${(parseFloat(calcMonto||"0")*rates.usdt).toFixed(2)}`}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'emergencia') {
      const fondoEmergencia = transactions.filter(t => t.categoria === 'emergencia').reduce((acc, tx) => tx.tipo === 'ingreso' ? acc + (tx.monto_usd_paralelo || 0) : acc - (tx.monto_usd_paralelo || 0), 0);
      const txEmergencia = transaccionesFiltradas.filter(t => t.categoria === 'emergencia');

      return (
        <div className="space-y-6">
          <div className={`relative overflow-hidden bg-gradient-to-br ${theme.card} to-[#1a0f2e] border ${theme.border} p-6 md:p-8 rounded-3xl shadow-xl flex flex-col items-center text-center mt-6`}>
            <Shield className={`w-12 h-12 ${theme.text} mb-4`} />
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Fondo "Por Si Acaso" 🚨</p>
            <p className="text-4xl font-black text-white tabular-nums tracking-tight">$<AnimatedNum value={fondoEmergencia} format="usd" /></p>
            <p className="text-xs text-white/50 mt-4 max-w-md">Esta es tu red de seguridad. Este dinero se suma a tu patrimonio total, pero no aparece en tu liquidez diaria para evitar que lo gastes.</p>
          </div>

          <div className="flex justify-center my-4">
             <button onClick={() => setIsAddingEmergencia(true)} className={`flex items-center gap-2 ${theme.primary} text-white px-6 py-3 rounded-2xl font-black shadow-lg active:scale-95 transition-all`}>
                <Plus className="w-5 h-5"/> Movimiento de Emergencia
             </button>
          </div>

          <Drawer.Root open={isAddingEmergencia} onOpenChange={setIsAddingEmergencia}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-[#3b82f6]">
                <Drawer.Title className="sr-only">Registrar Emergencia</Drawer.Title>
                <Drawer.Description className="sr-only">Añadir o retirar del fondo de emergencia</Drawer.Description>
                <div className="p-6 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <h3 className="text-xl font-black text-white mb-6 text-center">Fondo de Emergencia</h3>
                  
                  <form onSubmit={handleEmergenciaSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <select value={tipo} onChange={(e) => setTipo(e.target.value)} data-vaul-no-drag className={`flex-1 border rounded-xl p-3 text-sm font-black outline-none cursor-pointer ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                        <option value="ingreso">AGREGAR FONDO 💰</option><option value="egreso">RETIRO/EMERGENCIA 💸</option>
                      </select>
                      
                      {espacioActivo?.tipo === 'individual' ? (
                        <div className={`flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm text-white/50 font-bold flex items-center cursor-not-allowed`}>
                          👤 {(perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado"}
                        </div>
                      ) : (
                        <select required value={usuario} onChange={(e) => setUsuario(e.target.value)} data-vaul-no-drag className={`flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm text-white outline-none cursor-pointer`}>
                          <option value="">¿Quién aporta?</option>
                          {nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                          {nombresParticipantes.length > 0 && <option value={espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)'}>{espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos'}</option>}
                        </select>
                      )}
                    </div>
                    
                    <input type="text" required placeholder="Detalle (Ej: Reparación carro)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} data-vaul-no-drag className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none focus:border-[#3b82f6]`} />

                    <div className="flex gap-2">
                      <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" data-vaul-no-drag className={`flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-2xl font-black text-white tabular-nums tracking-tight outline-none focus:border-[#3b82f6]`} />
                      <select value={moneda} onChange={(e) => setMoneda(e.target.value)} data-vaul-no-drag className={`w-24 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none cursor-pointer`}>
                        <option value="usd">USD</option><option value="bs">BS</option>
                      </select>
                    </div>
                    
                    {monto && rates.bcv > 0 && (
                      <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 w-full mb-2 text-center">
                        {moneda === 'bs' ? (
                          <>
                            <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>Equiv. BCV</p><p className="tabular-nums tracking-tight text-white font-bold text-sm">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p></div>
                            <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                            <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>Equiv. Paralelo</p><p className="tabular-nums tracking-tight text-white font-bold text-sm">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p></div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>En Tasa BCV</p><p className="tabular-nums tracking-tight text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p></div>
                            <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                            <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>En Paralelo</p><p className="tabular-nums tracking-tight text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p></div>
                          </>
                        )}
                      </div>
                    )}
                    
                    <button type="submit" className={`w-full font-black py-4 mt-4 rounded-xl ${theme.primary} text-white text-sm shadow-lg active:scale-95 transition-transform`}>GUARDAR REGISTRO</button>
                  </form>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          <div className={`lg:col-span-7 bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden shadow-xl mt-6`}>
            <div className={`p-3 border-b border-white/5 bg-black/20 flex flex-col gap-3`}>
              <div className={`flex justify-between items-center text-xs font-bold uppercase text-white/70`}><span>Historial de Emergencias</span></div>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {txEmergencia.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm">No hay movimientos en el fondo.</div>
              ) : txEmergencia.map((tx) => (
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
                      <p className={`text-sm font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>$<AnimatedNum value={tx.monto_usd_paralelo || 0} format="usd" /></p>
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

    if (activeTab === 'pagos') {
      const gastosPorCategoriaValor = gastosDelMes.reduce((acc, tx) => {
        acc[tx.categoria] = (acc[tx.categoria] || 0) + (tx.monto_usd_paralelo || 0);
        return acc;
      }, {} as Record<string, number>);

      const presupuestosPorCategoria = presupuestos.map(p => {
        const gastoActual = gastosPorCategoriaValor[p.categoria] || 0;
        const porcentaje = Math.min((gastoActual / p.monto_limite) * 100, 100);
        const isOver = gastoActual > p.monto_limite;
        const barColor = isOver ? 'bg-rose-600' : porcentaje > 80 ? 'bg-rose-500' : porcentaje > 50 ? 'bg-amber-500' : 'bg-emerald-500';
        let catLabel = p.categoria === 'cashea' ? 'Cashea' : p.categoria === 'otro' ? 'Otro' : categoriasList.find(c => c.valor === p.categoria)?.label || p.categoria;
        return { ...p, gastoActual, porcentaje, isOver, barColor, catLabel };
      });

      return (
        <div className="space-y-4 md:space-y-6 mt-6">
          
          {transaccionesDelMes.length > 0 && (
            <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl shadow-xl flex flex-col min-h-[300px]`}>
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

          <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400"/> Control Presupuestario (Base Cero)
              </h3>
              <button onClick={() => setIsEditingBudget(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}>
                <Plus className="w-3 h-3" /> Nuevo Tope
              </button>
            </div>

            <Drawer.Root open={isEditingBudget} onOpenChange={setIsEditingBudget}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[50vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-rose-500">
                  <Drawer.Title className="sr-only">Nuevo Límite de Presupuesto</Drawer.Title>
                  <Drawer.Description className="sr-only">Fijar un tope máximo para una categoría</Drawer.Description>
                  <div className="p-6 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Fijar Límite Mensual</h3>
                    <form onSubmit={guardarPresupuesto} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Categoría a limitar</label>
                        <select value={budgetForm.categoria} onChange={e => setBudgetForm({...budgetForm, categoria: e.target.value})} data-vaul-no-drag className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none cursor-pointer focus:border-rose-500" required>
                          <option value="" className="bg-[#1a0f2e]">Selecciona Categoría...</option>
                          {categoriasList.map(c => <option key={c.id || c.valor} value={c.valor} className="bg-[#1a0f2e]">{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Máximo ($)</label>
                        <input type="number" step="0.01" placeholder="0.00" value={budgetForm.monto_limite} onChange={e => setBudgetForm({...budgetForm, monto_limite: e.target.value})} data-vaul-no-drag className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-2xl font-black text-white tabular-nums tracking-tight outline-none focus:border-rose-500`} required />
                      </div>
                      <button type="submit" className="w-full bg-rose-500 text-black font-black py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] mt-4 active:scale-95 transition-transform">Guardar Límite</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <div className="space-y-4">
              {presupuestosPorCategoria.length === 0 ? (
                <p className="text-[10px] md:text-xs text-white/50 italic">No hay topes definidos. Asigna límites mensuales para evitar fugas.</p>
              ) : (
                presupuestosPorCategoria.map(p => (
                  <div key={p.id} className="space-y-1.5 relative group">
                    <div className="flex justify-between text-xs md:text-sm text-white">
                      <span className="font-bold flex items-center gap-2">
                        {p.catLabel} 
                        <button onClick={() => eliminarPresupuesto(p.id)} className="text-rose-500/0 group-hover:text-rose-500/50 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
                      </span>
                      <span className="tabular-nums tracking-tight">
                        <span className={p.isOver ? 'text-rose-400 font-black' : ''}>$<AnimatedNum value={p.gastoActual} /></span> 
                        <span className="text-white/50"> / ${p.monto_limite}</span>
                      </span>
                    </div>
                    <div className="h-2 md:h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${p.barColor}`} style={{ width: `${p.porcentaje}%` }}></div>
                    </div>
                    {p.isOver && <p className="text-[8px] md:text-[9px] text-rose-400 text-right uppercase tracking-widest mt-0.5">Límite Excedido</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-5 rounded-3xl`}>
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`}/> Cashea</h3>
              <button onClick={() => setIsAddingCashea(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}><Plus className="w-3 h-3"/> Nuevo Pago</button>
            </div>

            <Drawer.Root open={isAddingCashea} onOpenChange={setIsAddingCashea}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500">
                  <Drawer.Title className="sr-only">Registrar Cuota Cashea</Drawer.Title>
                  <Drawer.Description className="sr-only">Registrar un nuevo pago o obligación a futuro</Drawer.Description>
                  <div className="p-6 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Cuota Cashea</h3>
                    
                    <form onSubmit={agregarCashea} className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Qué compraste?</label>
                        <input type="text" placeholder="Ej: Zapatos Nike" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} data-vaul-no-drag className="w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm text-white outline-none focus:border-purple-500" required />
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Cuota ($)</label>
                          <input type="number" step="0.01" placeholder="0.00" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} data-vaul-no-drag className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-2xl text-white tabular-nums tracking-tight font-black outline-none focus:border-purple-500`} required />
                        </div>
                        <div className="w-1/2">
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Fecha de Pago</label>
                          <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} data-vaul-no-drag className={`w-full bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm text-white outline-none focus:border-purple-500 h-[64px]`} required />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Responsable</label>
                        <select required value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} data-vaul-no-drag className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none cursor-pointer focus:border-purple-500`}>
                          <option value="">¿Quién debe pagar?</option>
                          {espacioActivo?.tipo === 'individual' ? <option value={(perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado"}>Tú</option> : nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <button type="submit" className={`w-full bg-purple-600 text-white font-black py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-4 active:scale-95 transition-transform`}>Guardar Cuota</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <div className="space-y-2">
              {cuotasCashea.length === 0 ? (
                <p className="text-[10px] md:text-xs text-white/50 italic px-2">No hay cuotas pendientes.</p>
              ) : cuotasCashea.map(cuota => (
                <div key={cuota.id} className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : `bg-black/40 ${theme.border}`}`}>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCashea(cuota)}>
                    {cuota.pagado ? <CheckSquare className="text-emerald-400 w-5 h-5"/> : <Square className={`${theme.text} w-5 h-5`}/>}
                    <div>
                      <p className="text-xs md:text-sm font-bold text-white">
                        {cuota.articulo} <span className={`text-[8px] md:text-[10px] ${theme.text} font-normal ml-1 ${theme.lightBg} px-2 py-0.5 rounded-md`}>{cuota.usuario || 'Usuario'}</span>
                      </p>
                      <p className={`text-[10px] text-white/40 mt-0.5`}>Vence: {cuota.fecha_pago}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`tabular-nums tracking-tight font-black ${cuota.pagado ? 'text-emerald-400/50' : 'text-rose-400'}`}>${cuota.monto_cuota}</span>
                    <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar esta cuota de Cashea?")) { await supabase.from('cashea').delete().eq('id', cuota.id); fetchData(); } }} className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className={`bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-3 border-b border-white/5 bg-black/20 flex flex-col gap-3`}>
                <div className={`flex justify-between items-center text-xs font-bold uppercase text-white/70`}>
                  <span>Historial del Mes</span>
                  <input type="month" value={mesActual} onChange={(e) => setMesActual(e.target.value)} className={`bg-black/50 border ${theme.border} rounded-lg p-1 text-white outline-none text-[10px]`} />
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
                        <p className={`text-sm font-black tabular-nums tracking-tight ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          $<AnimatedNum value={tx.monto_usd_paralelo || 0} format="usd" />
                        </p>
                        {tx.moneda_original === 'bs' && (
                          <p className="text-[9px] text-white/30 tabular-nums font-medium">Bs. {(tx.monto_original || 0).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        )}
                      </div>
                      <button onClick={() => eliminarTransaccion(tx.id)} className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'avisos') {
      return (
        <div className={`bg-[#1a0f2e] border ${theme.border} p-6 rounded-[2rem] shadow-xl mt-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
               <Bell className={`w-6 h-6 ${theme.text} animate-bounce`} /> Recordatorios
            </h2>
          </div>
          
          <form onSubmit={agregarRecordatorio} className="flex gap-3 mb-6">
            <input 
              type="text" placeholder="Escribe un aviso..." value={nuevoRecordatorio} onChange={(e) => setNuevoRecordatorio(e.target.value)}
              className={`flex-1 bg-black/40 border ${theme.border} rounded-2xl px-5 py-4 text-sm text-white outline-none`}
            />
            <button type="submit" className={`${theme.primary} hover:bg-opacity-80 text-white px-6 rounded-2xl transition-colors font-bold flex items-center gap-2`}>
              <Send className="w-5 h-5" /> Enviar
            </button>
          </form>

          <div className="space-y-3">
            {recordatorios.length === 0 ? (
              <p className="text-sm text-white/50 italic text-center py-10">No hay avisos pendientes</p>
            ) : (
              recordatorios.map(rec => (
                <div key={rec.id} className={`flex items-center justify-between p-4 rounded-2xl border ${rec.completado ? 'bg-emerald-900/10 border-emerald-500/20 opacity-50' : `bg-black/30 ${theme.border}`}`}>
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleRecordatorio(rec.id, rec.completado)}>
                    {rec.completado ? <CheckSquare className="w-6 h-6 text-emerald-400" /> : <Square className={`w-6 h-6 ${theme.text}`} />}
                    <div>
                      <p className={`text-base ${rec.completado ? 'line-through text-emerald-200' : 'text-white font-bold'}`}>{rec.texto}</p>
                      <p className={`text-[10px] ${theme.text} uppercase mt-1`}>Enviado por {rec.usuario} • {new Date(rec.created_at).toLocaleDateString()}</p>
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
    }

    if (activeTab === 'inicio') {
      const nombreUsuario = (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado";
      const saldoPrincipal = getSaldosAislados('ALL');

      return (
        <div className="space-y-6">
          
          {/* 1. TARJETA PRINCIPAL (TU BALANCE) */}
          <div className="mt-2 mb-6">
            <div className={`bg-[#1a0f2e] border ${theme.border} p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]`}>
               <div className="flex justify-between items-start mb-4">
                  <p className="text-white/80 font-bold text-sm">Tu Balance ({activeWallet.toUpperCase()})</p>
                  <Wallet className="w-6 h-6 text-white/30" />
               </div>
               
               <div className="mb-6">
                  {activeWallet === 'usdt' && (
                     <div className="animate-in fade-in">
                       <p className="text-5xl font-black text-white tracking-tight tabular-nums">
                         $<AnimatedNum value={saldoPrincipal.usdt} format="usd" />
                       </p>
                       <p className="text-emerald-400 text-xs font-bold mt-2">
                         Eqv: Bs. <AnimatedNum value={saldoPrincipal.usdt * rates.usdt} format="bs" /> (Paralelo)
                       </p>
                     </div>
                  )}
                  {activeWallet === 'bs' && (
                     <div className="animate-in fade-in">
                       <p className="text-5xl font-black text-white tracking-tight tabular-nums">
                         Bs. <AnimatedNum value={saldoPrincipal.bs} format="bs" />
                       </p>
                       <p className="text-blue-400 text-xs font-bold mt-2">
                         Eqv: $<AnimatedNum value={rates.bcv > 0 ? saldoPrincipal.bs / rates.bcv : 0} format="usd" /> (Tasa BCV)
                       </p>
                     </div>
                  )}
                  {activeWallet === 'cash' && (
                     <div className="animate-in fade-in">
                       <p className="text-5xl font-black text-white tracking-tight tabular-nums">
                         $<AnimatedNum value={saldoPrincipal.cash} format="usd" />
                       </p>
                       <p className="text-amber-400 text-xs font-bold mt-2 uppercase">Monto Físico Exacto</p>
                     </div>
                  )}
               </div>

               {/* PESTAÑAS */}
               <div className="flex bg-black/40 p-1 rounded-xl w-max border border-white/5 shadow-inner">
                 <button onClick={() => setActiveWallet('usdt')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'usdt' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>USDT</button>
                 <button onClick={() => setActiveWallet('bs')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'bs' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>BS</button>
                 <button onClick={() => setActiveWallet('cash')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'cash' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>CASH</button>
               </div>
            </div>
          </div>

          {/* 1.1. BALANCES DE LOS PARTICIPANTES (Solo en vaca o pote) */}
          {espacioActivo?.tipo !== 'individual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {participantes.map(p => {
                const saldoP = getSaldosAislados(p.nombre);
                return (
                  <div key={p.id} className="bg-[#1a0f2e] border border-white/5 p-4 rounded-2xl shadow-lg flex flex-col hover:border-white/10 transition-colors">
                     <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{p.nombre}</p>
                     <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold"><span className="text-emerald-400">USDT:</span> <span className="text-white tabular-nums tracking-tight">$<AnimatedNum value={saldoP.usdt} /></span></div>
                        <div className="flex justify-between text-xs font-bold"><span className="text-blue-400">BS:</span> <span className="text-white tabular-nums tracking-tight">Bs. <AnimatedNum value={saldoP.bs} format="bs" /></span></div>
                        <div className="flex justify-between text-xs font-bold"><span className="text-amber-400">CASH:</span> <span className="text-white tabular-nums tracking-tight">$<AnimatedNum value={saldoP.cash} /></span></div>
                     </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 2. MIS POTES (METAS CON DRAWER TÁCTIL) - MOVIDO ARRIBA */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className={`text-base font-black ${theme.text} uppercase tracking-widest flex items-center gap-2`}>
                <img src="/pote.png" alt="pote" className="w-6 h-6 object-contain drop-shadow-md" /> Mis Potes
              </h2>
              <button onClick={() => { setPoteForm({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" }); setIsAddingPote(true); }} className={`flex items-center gap-1 bg-emerald-500 text-black px-4 py-2 rounded-full text-xs font-black shadow-lg active:scale-95 transition-all hover:bg-emerald-400`}>
                <Plus className="w-4 h-4"/> Nueva Meta
              </button>
            </div>

            <Drawer.Root open={isAddingPote} onOpenChange={setIsAddingPote}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[24px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-[#10b981]">
                  <Drawer.Title className="sr-only">Registrar Nueva Meta</Drawer.Title>
                  <Drawer.Description className="sr-only">Formulario para crear un nuevo pote de ahorro</Drawer.Description>
                  <div className="p-6 bg-[#121212] rounded-t-[24px] flex-1 overflow-y-auto">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Nueva Meta</h3>
                    
                    <form onSubmit={guardarPote} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Para qué estamos ahorrando?</label>
                          <select 
                            value={poteForm.tipo} 
                            onChange={(e) => setPoteForm({...poteForm, tipo: e.target.value})} 
                            data-vaul-no-drag
                            className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none cursor-pointer focus:border-emerald-500`}
                          >
                            {POTE_OPCIONES.map(opt => <option key={opt} value={opt} className="bg-[#121212]">{opt}</option>)}
                          </select>
                        </div>

                        {poteForm.tipo === "Personalizado ✍️" && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                             <input 
                               type="text" placeholder="Ej: Viaje a Margarita" 
                               value={poteForm.nombreCustom} onChange={(e) => setPoteForm({...poteForm, nombreCustom: e.target.value})} 
                               data-vaul-no-drag
                               className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm text-white outline-none focus:border-emerald-500`} 
                               required 
                             />
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Objetivo ($)</label>
                          <input 
                            type="number" step="0.01" placeholder="0.00" 
                            value={poteForm.monto_objetivo} onChange={(e) => setPoteForm({...poteForm, monto_objetivo: e.target.value})} 
                            data-vaul-no-drag
                            className={`w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-2xl font-black text-white tabular-nums tracking-tight outline-none focus:border-emerald-500`} 
                            required 
                          />
                        </div>
                      </div>
                      <button type="submit" className={`w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4 active:scale-95 transition-transform`}>Guardar Meta</button>
                    </form>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            {potes.map(pote => {
              const ahorrado = getPoteAhorrado(pote.id, pote.nombre);
              const porcentaje = Math.min((ahorrado / pote.monto_objetivo) * 100, 100);
              
              return (
                <div key={pote.id} className={`bg-[#1a0f2e] border-2 border-emerald-500/30 p-5 md:p-6 rounded-[2rem] shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden group hover:border-emerald-500/60 transition-colors`}>
                  {porcentaje >= 100 && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-4">
                      <span className="text-3xl mb-1">🎉</span>
                      <h3 className="text-white font-black text-lg">¡Meta Alcanzada!</h3>
                      <p className="text-emerald-100 text-[10px] mb-3">Lograron ahorrar ${pote.monto_objetivo}.</p>
                      <button onClick={() => eliminarPote(pote.id)} className="bg-white text-emerald-600 font-bold px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition-transform">Eliminar Pote</button>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">{pote.nombre} <span className={`text-emerald-400 text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20`}>META: ${pote.monto_objetivo} USDT</span></h2>
                        <p className={`text-xs text-white/50 mt-1`}>Faltan $<AnimatedNum value={Math.max(pote.monto_objetivo - ahorrado, 0)} /> USD</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-sm md:text-base font-black text-emerald-400`}><AnimatedNum value={porcentaje} format="pct"/></span>
                        {porcentaje < 100 && (
                          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => eliminarPote(pote.id)} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`h-3 w-full bg-black/60 rounded-full border border-white/5 p-0.5 mt-2`}>
                      <div className={`h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]`} style={{ width: `${porcentaje}%`, transition: 'width 1s ease-in-out' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 3. BOTÓN DE REGISTRO RÁPIDO Y CALCULADORA */}
          <div className="mb-8 mt-6 flex gap-3">
            <div className="flex-1">
              <TransactionDrawer
                  tipo={tipo} setTipo={setTipo}
                  categoria={categoria} setCategoria={setCategoria}
                  monto={monto} setMonto={setMonto}
                  moneda={moneda} setMoneda={setMoneda}
                  descripcion={descripcion} setDescripcion={setDescripcion}
                  rates={rates} theme={theme} onSubmit={handleManualSubmit}
                  espacioActivo={espacioActivo} participantes={participantes}
                  usuario={usuario} setUsuario={setUsuario}
                >
                  <button type="button" className="w-full bg-[#1a1a1a] border border-[#333] hover:border-emerald-500/50 py-4 md:py-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 md:gap-3 transition-colors shadow-lg active:scale-95 group h-full">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform`}>
                      <Plus className="w-6 h-6 md:w-8 md:h-8 text-black" />
                    </div>
                    <span className="text-white font-black text-xs md:text-sm">Registrar Movimiento</span>
                  </button>
              </TransactionDrawer>
            </div>
            
            <button onClick={() => onChangeView('calculadora-libre')} className="w-1/3 max-w-[120px] bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 py-4 md:py-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 md:gap-3 transition-colors shadow-lg active:scale-95 group">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform`}>
                <Calculator className="w-5 h-5 md:w-7 md:h-7 text-blue-400" />
              </div>
              <span className="text-white font-black text-xs md:text-sm">Cálculo</span>
            </button>
          </div>

          {/* 4. GESTOR DE INTEGRANTES */}
          {espacioActivo?.tipo !== 'individual' && (
            <div className={`bg-[#1a0f2e] border ${theme.border} p-5 rounded-[2rem] shadow-xl mt-6`}>
              <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest mb-4 flex items-center gap-2">
                <Users size={12} className={theme.text} /> Gestionar Integrantes
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {participantes.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic">No hay miembros agregados...</p>
                ) : (
                  participantes.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/5 bg-white/5 text-white group hover:border-rose-500/50 transition-colors">
                      {p.nombre}
                      <button onClick={() => eliminarParticipante(p.id, p.nombre)} className="text-white/20 hover:text-rose-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Nombre del integrante..." 
                  value={nuevoPart} onChange={(e) => setNuevoPart(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && agregarParticipante()}
                  className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#A855F7] transition-all"
                />
                <button onClick={agregarParticipante} className={`p-2.5 rounded-xl ${theme.primary} text-white shadow-lg active:scale-95 transition-all`}>
                  <UserPlus size={18} />
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }
    
    return <div className="p-10 text-center text-white/50">Cambia de pestaña en la barra de navegación para ver este contenido.</div>;
  }

  return (
    <div className="w-full pb-20 md:pb-0">
      {isGuest && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 text-center mb-4 rounded-xl flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4"/> Modo Invitado: Prueba gratuita activada.
        </div>
      )}

      {/* NUEVO HEADER MINIMALISTA CON MENÚ HAMBURGUESA Y QR */}
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white hover:text-purple-400 bg-transparent rounded-xl transition-colors">
            <Menu className="w-8 h-8" /> 
          </button>
          <div className="flex flex-col">
             <h1 className="text-xl font-black text-white tracking-wide leading-tight flex items-center gap-2">
                 {espacioActivo?.nombre || "Mi Billetera"} 
             </h1>
             <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] uppercase tracking-widest ${theme.text} ${theme.lightBg} px-2 py-0.5 rounded-md font-bold`}>{espacioActivo?.tipo || "Individual"}</span>
             </div>
          </div>
        </div>
        
        {/* Indicador de Tasas Dobles */}
        <div className="text-right flex flex-col items-end">
           <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-1">BCV <button onClick={fetchRates} disabled={syncing}><RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`}/></button></p>
           <p className="text-sm tabular-nums tracking-tight text-white font-black">Bs. {rates.bcv.toFixed(2)}</p>
           <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-1">Paralelo</p>
           <p className="text-sm tabular-nums tracking-tight text-white font-black">Bs. {rates.usdt.toFixed(2)}</p>
        </div>
      </div>

      {/* EL MENÚ LATERAL DESPLEGABLE */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-3/4 max-w-xs bg-[#121212] border-r border-[#333] h-full flex flex-col p-6 animate-in slide-in-from-left">
            <div className="flex justify-between items-center mb-8">
              <img src="/pote.png" alt="Mi Pote" className="w-12 h-12 object-contain" />
              <button onClick={() => setIsMenuOpen(false)} className="text-white/50 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Mis Espacios</p>
            <div className="space-y-3 flex-1">
              <button onClick={() => { setIsMenuOpen(false); onSelectModule('individual'); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 font-bold text-sm transition-colors text-left">
                <Wallet className="w-5 h-5"/> Mi Billetera
              </button>
              <button onClick={() => { setIsMenuOpen(false); onSelectModule('pote'); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/20 font-bold text-sm transition-colors text-left">
                <img src="/pote.png" className="w-5 h-5 opacity-80" /> Mi Pote
              </button>
              <button onClick={() => { setIsMenuOpen(false); onSelectModule('vaca'); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-sm transition-colors text-left">
                <Users className="w-5 h-5"/> La Vaca
              </button>
              
              {/* CÓDIGO DE INVITACIÓN (SÓLO SI NO ES INDIVIDUAL) */}
              {espacioActivo?.tipo !== 'individual' && espacioActivo?.codigo_invitacion && (
                 <div className="p-4 rounded-xl bg-black/40 border border-white/5 mt-4">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Invitar Amigos</p>
                    <div className="flex gap-2">
                       <button onClick={() => {navigator.clipboard.writeText(espacioActivo.codigo_invitacion); alert("Código copiado al portapapeles");}} className="flex-1 bg-white/10 hover:bg-white/20 p-2 rounded text-xs text-white transition-colors flex items-center justify-center gap-1 tabular-nums">
                         <Key className="w-3 h-3"/> {espacioActivo.codigo_invitacion}
                       </button>
                       <button onClick={() => { setIsMenuOpen(false); setShowQRModal(true); }} className="bg-white/10 hover:bg-white/20 p-2 rounded text-white transition-colors" title="Mostrar QR"><QrCode className="w-4 h-4"/></button>
                    </div>
                 </div>
              )}
              
              <button onClick={() => { setIsMenuOpen(false); openJoinModal(); }} className="w-full flex items-center gap-3 p-3 mt-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 font-bold text-sm transition-colors text-left">
                <Key className="w-5 h-5"/> Unirse con Código
              </button>
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-2">
                <button onClick={() => { setIsMenuOpen(false); openProfileModal(); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-white/10 text-sm font-bold transition-colors">
                    <Edit2 className="w-4 h-4"/> Editar Perfil
                </button>
                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 text-sm font-bold transition-colors">
                    <LogOut className="w-4 h-4"/> Cerrar Sesión
                </button>
            </div>
          </div>
        </div>
      )}

      {renderTabContent()}

      {/* MODAL QR UBICADO CORRECTAMENTE */}
      {showQRModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`bg-[#1a0f2e] border ${theme.border} p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative`}>
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-black text-white mb-2">Escanea para unirte</h3>
            <p className={`text-sm ${theme.text} mb-6`}>Pídele a tu amigo que escanee este código o ingrese el texto: <strong className="text-white bg-white/10 px-2 py-1 rounded">{espacioActivo?.codigo_invitacion}</strong></p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${espacioActivo?.codigo_invitacion}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <button onClick={() => {navigator.clipboard.writeText(espacioActivo?.codigo_invitacion); alert("Código copiado"); setShowQRModal(false);}} className={`w-full ${theme.primary} text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95`}>COPIAR CÓDIGO</button>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-0 left-0 right-0 bg-[#1a0f2e]/90 backdrop-blur-xl border-t ${theme.border} p-3 md:hidden z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} theme={theme} />
          <NavButton icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('pagos')}} theme={theme} />
          <NavButton icon={<StickyNote />} label="Recordatorios" active={activeTab === 'avisos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('avisos')}} theme={theme} />
          {espacioActivo?.tipo !== 'vaca' && (
            <NavButton icon={<Shield />} label="Reserva" active={activeTab === 'emergencia'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('emergencia')}} theme={theme} />
          )}
        </div>
      </nav>

      <nav className="hidden md:flex justify-center mt-8 space-x-4">
        <NavButtonDesktop icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} theme={theme} />
        <NavButtonDesktop icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('pagos')}} theme={theme} />
        <NavButtonDesktop icon={<StickyNote />} label="Recordatorios" active={activeTab === 'avisos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('avisos')}} theme={theme} />
        {espacioActivo?.tipo !== 'vaca' && (
          <NavButtonDesktop icon={<Shield />} label="Por si acaso" active={activeTab === 'emergencia'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('emergencia')}} theme={theme} />
        )}
      </nav>
      
      {showToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 pointer-events-none">
          <div className={`bg-[#1a0f2e] border-2 ${theme.border} p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.4)] flex flex-col items-center gap-5 max-w-md w-full animate-in zoom-in`}>
            <div className="w-16 h-16 flex items-center justify-center rounded-3xl text-4xl shadow-2xl">
              {toastType === 'ingreso' ? <img src="/pote.png" className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" /> : '📉'}
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

function NavButton({ icon, label, active, onClick, theme }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? `${theme.text} scale-110` : 'text-white/40 hover:text-white/80'}`}>
      <div className={`p-2 rounded-xl ${active ? theme.lightBg : ''}`}>{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NavButtonDesktop({ icon, label, active, onClick, theme }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${active ? `${theme.primary} text-white shadow-lg` : `bg-[#1a0f2e] ${theme.text} border ${theme.border} hover:bg-white/5`}`}>
      {icon} {label}
    </button>
  );
}

// COMPONENTE PARA LA ANIMACIÓN FLUIDA DE LOS NÚMEROS
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

  // Modificado para evitar el doble "Bs. Bs."
  if (format === 'bs') return <span>{display.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  if (format === 'pct') return <span>{display.toFixed(1)}%</span>;
  return <span>{display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}