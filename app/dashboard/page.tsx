"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X, Bell, Send, PieChart as PieChartIcon, BarChart3, Target, Home, CreditCard, StickyNote, Calculator, Lock, Mail, LogIn, UserPlus, Sparkles, ArrowLeft, Shield, Key, Copy, UploadCloud, Phone, QrCode
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function MiPoteApp() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null); 
  const [isPro, setIsPro] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState('selector'); 
  
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
      if (session) cargarDatosUsuario(session.user.id);
      else setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarDatosUsuario(session.user.id);
      else setLoadingAuth(false);
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
      else { setCurrentView('selector'); setShowPaywall(false); }
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
    localStorage.removeItem('mipote_guest_tx');
    localStorage.removeItem('mipote_guest_potes');
    localStorage.removeItem('mipote_guest_count');

    setEspacioActivo(null); 
    setEspacios([]); 
    setIsGuest(false); 
    setIsPro(false); 
    setPerfil(null); 
    setCurrentView('selector');
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
        await supabase.from('participantes').insert([{ nombre: (perfil?.nombre || (perfil?.nombre || session.user.email.split('@')[0])), espacio_id: spaceFound.id }]);
        
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
    if (tipoModulo === 'calculadora') { setCurrentView('calculadora-libre'); return; }

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

  if (currentView === 'selector') {
    return (
      <div className="min-h-screen bg-[#0d0714] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center mb-4 relative">
             <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"></div>
             <img src="/pote.png" alt="Mi Pote" className="w-20 h-20 object-contain drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Mi Pote</h1>
          <p className="text-purple-400 text-sm mt-1">Selecciona tu espacio financiero</p>
        </div>

        {session && (
          <div className="w-full max-w-2xl mb-4">
            <button onClick={() => setShowJoinModal(true)} className="w-full bg-[#1a0f2e] border border-blue-500/50 hover:bg-blue-900/30 text-blue-300 font-bold py-4 rounded-3xl transition-all shadow-lg flex items-center justify-center gap-3">
              <Key className="w-5 h-5"/> Tienes un código de invitación? Únete a un Pote o Vaca
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <button onClick={() => seleccionarModulo('individual')} className="bg-[#1a0f2e] border border-purple-500/30 p-6 rounded-3xl shadow-xl hover:border-purple-400 transition-all flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-md">Gratis</div>
            <Wallet className="w-10 h-10 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-black text-white">Mi Billetera</h2>
            <p className="text-xs text-purple-300 mt-2">Control financiero individual. Prueba rápida sin compromiso.</p>
          </button>

          <button onClick={() => seleccionarModulo('pote')} className="bg-[#1a0f2e] border border-fuchsia-500/30 p-6 rounded-3xl shadow-xl hover:border-fuchsia-400 transition-all flex flex-col items-center text-center relative overflow-hidden group">
            {!isPro && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1 shadow-md"><Lock className="w-3 h-3"/> PRO</div>}
            <img src="/pote.png" className="w-10 h-10 mb-3 drop-shadow-md group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-black text-white">Mi Pote</h2>
            <p className="text-xs text-fuchsia-300 mt-2">Finanzas compartidas. Ideal para parejas o socios.</p>
          </button>

          <button onClick={() => seleccionarModulo('vaca')} className="bg-[#1a0f2e] border border-emerald-500/30 p-6 rounded-3xl shadow-xl hover:border-emerald-400 transition-all flex flex-col items-center text-center relative overflow-hidden group">
            {!isPro && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1 shadow-md"><Lock className="w-3 h-3"/> PRO</div>}
            <Users className="w-10 h-10 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-black text-white">La Vaca</h2>
            <p className="text-xs text-emerald-300 mt-2">Divide cuentas de viajes o salidas con múltiples amigos.</p>
          </button>

          <button onClick={() => seleccionarModulo('calculadora')} className="bg-[#1a0f2e] border border-blue-500/30 p-6 rounded-3xl shadow-xl hover:border-blue-400 transition-all flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-md">Libre</div>
            <Calculator className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg font-black text-white">Calculadora</h2>
            <p className="text-xs text-blue-300 mt-2">Consulta de divisas y arbitraje rápido BCV vs Paralelo.</p>
          </button>
        </div>

        {session ? (
          <div className="mt-10 flex flex-col items-center gap-4">
            <button onClick={() => { setEditNombre(perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session.user.email.split('@')[0]))); setShowProfileModal(true); }} className="text-purple-400/80 text-xs font-bold uppercase tracking-widest hover:text-purple-400 transition-colors flex items-center gap-2">
              <Edit2 className="w-4 h-4"/> Configurar mi Nombre
            </button>
            <button onClick={handleLogout} className="text-rose-400/60 text-xs font-bold uppercase tracking-widest hover:text-rose-400 transition-colors">Cerrar Sesión</button>
          </div>
        ) : (
          <button onClick={() => {setCurrentView('auth'); setIsLoginView(true);}} className="mt-10 text-purple-400/60 text-xs font-bold uppercase tracking-widest hover:text-purple-400 transition-colors">Ya tengo una cuenta PRO</button>
        )}

{/* MODAL EDITAR PERFIL */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
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

        {/* MODAL INGRESAR CÓDIGO */}
        {showJoinModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <form onSubmit={unirseConCodigo} className="bg-[#1a0f2e] border border-blue-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] max-w-sm w-full text-center relative">
              <button type="button" onClick={() => setShowJoinModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20"><Key className="w-8 h-8 text-blue-400" /></div>
              <h3 className="text-xl font-black text-white mb-2">Unirse a un Espacio</h3>
              <p className="text-sm text-blue-300 mb-6">Ingresa el código de invitación que te compartió tu pareja o amigo.</p>
              <input type="text" value={joinCode} onChange={(e)=>setJoinCode(e.target.value.toUpperCase())} placeholder="EJ: X7K9P2" className="w-full bg-black/50 border border-blue-500/30 rounded-xl p-4 text-center text-xl font-mono text-white mb-4 outline-none focus:border-blue-400 uppercase tracking-[0.3em]" required maxLength={6} />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95">VERIFICAR CÓDIGO</button>
            </form>
          </div>
        )}

        {/* PAYWALL Y CHECKOUT (PASARELA DE PAGO) */}
        {showPaywall && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="bg-[#1a0f2e] border border-amber-500/50 p-6 md:p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-md w-full text-center relative my-8">
              <button onClick={() => {setShowPaywall(false); setCheckoutPaso(1);}} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6"/></button>
              
              {!session ? (
                <>
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Sparkles className="w-8 h-8 text-amber-400" /></div>
                  <h3 className="text-xl font-black text-white mb-2">Desbloquea Mi Pote PRO</h3>
                  <p className="text-sm text-white/70 mb-6">Crea una cuenta para pagar tu suscripción ($2.99/mes) y desbloquear los espacios compartidos.</p>
                  <button onClick={() => {setShowPaywall(false); setCurrentView('auth'); setIsLoginView(false);}} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3.5 rounded-xl shadow-lg mb-3 hover:scale-105 transition-transform">CREAR CUENTA GRATIS</button>
                </>
              ) : perfil?.estado_pago === 'pendiente' ? (
                 <div className="py-8">
                   <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><RefreshCw className="w-10 h-10 text-blue-400" /></div>
                   <h3 className="text-2xl font-black text-white mb-2">Pago en Revisión</h3>
                   <p className="text-blue-200 text-sm">Ya enviamos tu pago. Un administrador lo aprobará pronto y se te habilitará el acceso.</p>
                 </div>
              ) : checkoutPaso === 1 ? (
                <>
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Sparkles className="w-8 h-8 text-amber-400" /></div>
                  <h3 className="text-2xl font-black text-white mb-2">Hazte PRO</h3>
                  <p className="text-amber-200 text-sm mb-6">Acceso a Potes compartidos y Las Vacas infinitas por <span className="font-black">$2.99 / mes</span>.</p>
                  <button onClick={()=>setCheckoutPaso(2)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-3 hover:scale-105 transition-transform text-lg">PAGAR AHORA</button>
                </>
              ) : checkoutPaso === 2 ? (
                <form onSubmit={procesarPagoPRO} className="text-left space-y-4">
                  <h3 className="text-xl font-black text-white text-center mb-4 border-b border-white/10 pb-4">Realizar Pago</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={()=>setMetodoPago('pagomovil')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'pagomovil' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-white/50 border-white/10'}`}>Pago Móvil</button>
                    <button type="button" onClick={()=>setMetodoPago('binance')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'binance' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-white/50 border-white/10'}`}>Binance Pay</button>
                  </div>

                  <div className="bg-black/50 border border-white/5 p-4 rounded-xl text-sm text-white/80 space-y-2 font-mono">
                    {metodoPago === 'binance' ? (
                      <>
                        <p className="text-[10px] text-amber-400 uppercase font-bold font-sans">Enviar exactamente:</p>
                        <p className="text-2xl font-black text-white font-sans">$2.99 USDT</p>
                        <p className="mt-2 text-xs font-sans text-white/50">Correo Binance Pay:</p>
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded"><span>dmvictorbalboa@gmail.com</span> <Copy className="w-4 h-4 cursor-pointer hover:text-white" onClick={()=>navigator.clipboard.writeText("dmvictorbalboa@gmail.com")}/></div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] text-blue-400 uppercase font-bold font-sans">Monto a Pagar:</p>
                        <p className="text-2xl font-black text-white font-sans">Bs. {(4.99 * tasaCheckout).toFixed(2)}</p>
                        <p className="mt-2 text-xs font-sans text-white/50">Datos del Pago Móvil:</p>
                        <div className="bg-white/5 p-3 rounded space-y-1 text-xs">
                          <p>📱 Teléfono: <strong>0412-301-6936</strong></p>
                          <p>🏦 Banco: <strong>Bancamiga (0172)</strong></p>
                          <p>🪪 C.I: <strong>27.531.901</strong></p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Referencia / Alias</label>
                    <input type="text" required value={referencia} onChange={e=>setReferencia(e.target.value)} placeholder="Ej: Pago de Victor o 1459" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none mt-1 focus:border-amber-500 transition-colors" />
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
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-[#0d0714] flex flex-col items-center justify-center p-4 relative">
        <button onClick={() => setCurrentView('selector')} className="absolute top-6 left-6 text-purple-400 flex items-center gap-2 text-sm font-bold"><ArrowLeft className="w-4 h-4"/> Volver</button>
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
          <button onClick={() => setCurrentView('selector')} className="absolute -top-10 left-0 text-purple-400 flex items-center gap-2 text-sm font-bold"><ArrowLeft className="w-4 h-4"/> Volver</button>
          <FinanzasDashboardContent session={null} espacioActivo={null} onSwitchSpace={() => {}} forceTab="calculadora" />
        </div>
      </div>
    );
  }

  return (
    <FinanzasDashboardContent 
      key={`${session?.user?.id || 'guest'}-${espacioActivo?.id || 'none'}`}
      session={session} 
      espacioActivo={espacioActivo} 
      onSwitchSpace={() => setCurrentView('selector')} 
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
    />
  );
}

// ============================================================================
// DASHBOARD PRINCIPAL - NÚCLEO DINÁMICO
// ============================================================================
function FinanzasDashboardContent({ 
  session, espacioActivo, onSwitchSpace, isGuest = false, perfil, onTriggerPaywall, 
  showPaywall, setShowPaywall, checkoutPaso, setCheckoutPaso, metodoPago, 
  setMetodoPago, referencia, setReferencia, archivo, setArchivo, enviandoPago, 
  tasaCheckout, procesarPagoPRO, forceTab, goAuth 
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

  const DEFAULT_CATEGORIES = [
    { valor: "salario", label: "Ingreso / Salario 💰" },
    { valor: "comida", label: "Comida 🍔" },
    { valor: "internet", label: "Internet / Servicios 🌐" },
    { valor: "mascotas", label: "Mascotas 🐾" },
    { valor: "cashea", label: "Cashea 🛍️" },
    { valor: "otro", label: "Otro (Personalizado) ✍️" }
  ];
  const [categoriasList, setCategoriasList] = useState<any[]>(DEFAULT_CATEGORIES);

  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [casheaForm, setCasheaForm] = useState({ articulo: "", monto_cuota: "", fecha_pago: "", usuario: "" });
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
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

  // MENSAJES DINÁMICOS POR MÓDULO
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
        "Platica segura, relación feliz. 🥰", 
        "¡Coronamos otra luquita pa' la cuenta! 💸", 
        "Los reyes del ahorro reportándose. 👑", 
        "Pote lleno, corazón contento. ❤️🍯", 
        "Trabajando juntos por ese sueño. 🌟", 
        "¡Qué dupla tan brutal somos administrando! 💼", 
        "Pa' los gusticos del futuro. 🍕✈️", 
        "Sumando bloques a nuestra casita de ahorros. 🧱", 
        "Cuando remamos pa'l mismo lado, la plata rinde más. 🚣‍♂️", 
        "Esa meta ya nos está guiñando el ojo. 😉", 
        "¡Dinero asegurado, mi vida! 🔒", 
        "No hay inflación que pueda con este equipo. 📉🙅‍♂️", 
        "Somos los dueños del presupuesto. 📊", 
        "Un dolarito más pa' la felicidad. 💵", 
        "Qué rico ver cómo crece nuestro sudor ahí reflejado. 💦💰", 
        "Ahorrando hoy pa' resolver mañana. 📅", 
        "Platica que entra, platica que se respeta. 🫡", 
        "Vamos pa' arriba como la espuma. 🫧", 
        "El futuro es nuestro, mi amor. 🔮", 
        "A este ritmo vamos a tener que comprar un tobo más grande. 🪣", 
        "¡Meta a la vista! Que no pare el ahorro. 🔭"
      ] : [
        "¿De pana necesitábamos gastar en esto, mi amor? 🤨", 
        "Mosca con la tarjeta, que nos descuadramos. 💳", 
        "Gastico hormiga detectado, pila ahí. 🐜", 
        "Bueno, ya se gastó, palante es pa' allá. 🚶‍♂️", 
        "Pilas que ese gustico nos aleja de la meta. 📉", 
        "Mi vida, este gasto dolió en el alma (y en el bolsillo). 💔", 
        "¿Seguro que no había algo más barato por ahí? 💸", 
        "Nos salimos del presupuesto, hay que arroparse hasta donde llegue la cobija. 🛏️", 
        "Gasto anotado, pero cero excesos esta semana. 🛑", 
        "Cuidado con los antojos que nos dejan limpios. 🍔🚫", 
        "Pelando bola en 3, 2, 1... si seguimos así. 📉", 
        "Amor, vamos a tener que echarle más pichón para recuperar esto. 🧗‍♂️", 
        "Este mes nos toca comer arepa con mantequilla si seguimos gastando. 🫓", 
        "No dejes que la emoción nos vacíe el pote. 🍯🥄", 
        "Gasto registrado. Oremos para que alcance hasta fin de mes. 🙏", 
        "Pendiente con el despilfarro, mi amor. 💸", 
        "Un paso pa'trás en la meta, pero nos recuperamos. 🔄", 
        "¡Epa! Ese gasto no estaba en los planes. 📝❌", 
        "Mosca con las compras nerviosas. 🛍️", 
        "Bueno, un gustico no mata a nadie... pero que no se vuelva costumbre. ☝️", 
        "Amor, la billetera está pidiendo cacao. 👛🏳️", 
        "Gasto duro, pero necesario (espero). 😬", 
        "Si le seguimos sacando al pote, no vamos a llegar nunca. 🐌", 
        "Administra bien que la cosa no está fácil. 🇻🇪", 
        "Se nos fue una buena plata ahí. 💸", 
        "Cuentas claras conservan el amor. Gasto anotado. 📝❤️", 
        "Vamos a frenar los gastos que nos quedamos sin liquidez. 🛑", 
        "Ese tarjetazo se sintió hasta aquí. 💳⚡", 
        "Poniendo orden en la pea, no más gastos por hoy. 📋", 
        "Amor, recuerda la meta... no nos desviemos. 🎯"
      ];
    } else if (tipoApp === 'vaca') {
      return tipoTx === 'ingreso' ? [
        "¡Cayó la plata pa' las frías! 🍻", 
        "¡Coronamos! La vaca va engordando. 🐄💰", 
        "Epa mis panas, esta vaca ya huele a playa. 🏖️", 
        "¡Aportando pa'l desastre! 🎉", 
        "¡Con esta vaca armamos la rumba! 🪩", 
        "¡Platica activa, que se prenda! 🔥", 
        "Llegó el de los reales. 💸😎", 
        "Esta gente si está responsable vale, puro pagando a tiempo. 👏", 
        "¡Vaca gorda, desastre seguro! 🐄💥", 
        "Sumando pa' la curda y la gozadera. 🥃", 
        "¡Aquí hay plata pa' tirar pa'l techo! (Bueno, casi). 💸", 
        "Poniéndose al día con la vaca, así me gusta. 🤝", 
        "¡Ese es mi pana! Soltando los billetes sin llorar. 💵", 
        "Se armó el bonche, ya hay presupuesto. 🎊", 
        "La vaca dice: ¡Muuuuucho billete! 🐄💸", 
        "Plata en mano, viaje seguro. 🚗💨", 
        "Cuadrando los reales como es. 💯", 
        "¡Nadie se queda por fuera de esta rumba! 🥳", 
        "Transferencia confirmada, el pana va pendiente. ✅", 
        "¡Uy, con esto nos compramos media licorería! 🍾", 
        "La vaca está engordando más que nosotros en diciembre. 🐷", 
        "Panas que pagan a tiempo = Panas de verdad. 🫂", 
        "Que suenen las botellas que ya hay presupuesto. 🥂", 
        "Pote activísimo mis panas. 🔥", 
        "¡Billetes entrando, planes saliendo! 🗺️", 
        "¡Aquí el que no paga no bebe! (Pero ya pagaste). 🚫🍻", 
        "Listo el aporte, cero deudores morosos. 📝", 
        "¡Así, así, echándole plata a la vaca! 🐄💵", 
        "Vamos a desatar la locura con este presupuesto. 🌪️", 
        "¡Plata lista! Ahora a planear a dónde vamos. 📍"
      ] : [
        "¡Coño, nos bajaron los fondos! 📉", 
        "¿Quién autorizó este gasto loco? 🤨", 
        "Aflojando la plata... más vale que valga la pena. 💸", 
        "Epa, controlen el gasto que no llegamos a la fecha. 🛑", 
        "¡Se nos fue una luca de la vaca! 🐄💸", 
        "Gastando los reales, mosca que nos quedamos limpios. 🧹", 
        "Compren bien que la plata no es de goma. 💸", 
        "Gasto anotado, pero bajenle dos a la gastadera. ✌️", 
        "¡Epa! ¿De pana eso costó tan caro? 🧐", 
        "Si nos seguimos gastando la plata, nos toca tomar agua de chorro. 🚰", 
        "Se fue la plata de la vaca... oremos. 🙏", 
        "Rindiendo la plata como si fuéramos economistas. 🤓", 
        "Gasto necesario o se armaba el peo. 💥", 
        "Mosca con los gastos fantasmas que nos desfalcan. 👻", 
        "Pila ahí con esos 'gusticos' con plata ajena. 👀", 
        "¡Agarren mínimo que nos quedamos sin vaca! 🐄🚫", 
        "Bueno, pa' eso es la plata, pa' gastarla (pero con mente). 🧠", 
        "Un tarjetazo menos en la vaca. 💳", 
        "¿Quién pagó eso? Anotado pa' llevar el control. 📝", 
        "Esa factura dolió más que ratón de cocuy. 🥃🤕", 
        "Se vació un pelo el pote, pilas. 🍯", 
        "Pidan descuento pa' la próxima, no sean botaratas. 🏷️", 
        "Plata gastada, espero que hayan gozado. 🎉", 
        "¡La vaca está perdiendo peso, métanle más! 🐄📉", 
        "Que este gasto no nos deje pelando bola pa'l regreso. 🚗", 
        "Cuentas claras, amistades largas. Gasto registrado. 🤜🤛", 
        "No despilfarren que la noche es larga. 🌙", 
        "Gasto fuerte, pero palante, somos millonarios (de mente). 🤑", 
        "Si no controlamos, nos tocará lavar platos pa' pagar. 🍽️", 
        "Ajustando las cuentas del desastre. 📊"
      ];
    } else {
      return tipoTx === 'ingreso' ? [
        "¡Gotita a gotita se llena el pote! 🍯💰", 
        "Excelente gestión. El interés compuesto está de tu lado. 📈😎", 
        "Dinero que entra, futuro que se asegura. 🛡️💸", 
        "Un dólar ahorrado es un dólar ganado. ¡Bien hecho! 💵👏", 
        "Así se construye la libertad financiera. 🗽💰", 
        "¡Suma y sigue! ➕📈", 
        "¡Objetivo fijado, dinero guardado! 🎯", 
        "La cuenta bancaria sonríe el día de hoy. 🏦😁", 
        "¡Qué buen ritmo llevas! Sigue así. 🏃‍♂️💨", 
        "El ahorro es la base del éxito. 🚀", 
        "Tu 'yo' del futuro te está aplaudiendo ahora mismo. 👏🕰️", 
        "¡Ca-ching! Sonido de victoria financiera. 🎰🏆", 
        "A este paso, alcanzarás tus metas antes de tiempo. 🏁", 
        "¡Lluvia de liquidez en el dashboard! 💸🌧️", 
        "Warren Buffett estaría anotando tus estrategias. 👴📊", 
        "Aumentando el patrimonio, un registro a la vez. 🧱🔨", 
        "¡Forbes 500, allá vamos! 📰🥇", 
        "Si el ahorro fuera deporte olímpico, ¡oro para ti! 🥇", 
        "La inflación no puede contra esta disciplina. 🛡️📉", 
        "Cada centavo cuenta. ¡Buen trabajo! 🪙", 
        "Construyendo un muro de tranquilidad financiera. 🧱", 
        "¡Ese fondo se ve cada vez mejor! 🚑💵", 
        "Liquidez asegurada. 💧🔒", 
        "Paso a paso hacia la meta. 🚶‍♂️🏔️", 
        "Disciplina financiera en su máxima expresión. 🥋", 
        "El capital crece cuando se le cuida. 🌱", 
        "¡Nuevo ingreso registrado con éxito! ✅", 
        "Tu patrimonio neto acaba de subir de nivel. 🆙", 
        "Ahorrar hoy es disfrutar mañana sin culpas. 🏖️", 
        "La constancia es la llave de la riqueza. 🔑"
      ] : [
        "¿Realmente necesitabas esto o fue un impulso? Evalúa tu costo de oportunidad. 📉", 
        "Un dólar gastado hoy es un dólar menos produciendo mañana. 💸", 
        "Recuerda que la inflación no perdona, pero tus gastos hormiga tampoco. 🐜", 
        "El flujo de caja negativo quema liquidez. Controla los egresos. ⚠️", 
        "Cashea es deuda, no dinero extra. Cuidado con el apalancamiento. 💳", 
        "Registrado. Pero pregúntate: ¿podrías haberlo conseguido a mejor precio? 🔍", 
        "El arbitraje cambiario te salva a veces, pero no justifica el consumismo. ⚖️", 
        "Si este gasto no genera valor o bienestar real, es solo pérdida neta. 🗑️", 
        "Revisa tu presupuesto mensual, este gasto acaba de reducir tu margen. 📊", 
        "Gastar es fácil, generar liquidez es lo difícil. Respeta tu esfuerzo. 💼", 
        "¿Esto era un 'deseo' o una 'necesidad'? Las finanzas no admiten autoengaños. 🧠", 
        "Cada salida de capital retrasa tus objetivos de inversión. 🐢", 
        "La disciplina duele hoy, pero la falta de liquidez dolerá mañana. 📉", 
        "Un buen estratega sabe cuándo cerrar la billetera. 🎓", 
        "¿Vale la pena descapitalizarse por esto? 📉", 
        "Tu 'yo' del futuro acaba de perder un poco de libertad financiera. 🕰️", 
        "Cuidado, los pequeños gastos son las grandes fugas del patrimonio. 💧", 
        "El consumismo es el enemigo silencioso de la acumulación de capital. 🛍️", 
        "El mercado castiga a los que no cuidan su liquidez. 📉", 
        "¿Pasaste esto por el filtro de prioridad o solo pasaste la tarjeta? 💳", 
        "Gasto registrado. Que este número te sirva de reflexión. 📝", 
        "Recuerda: El objetivo no es solo ganar más, sino retener más. 🛡️", 
        "Tu balance acaba de sufrir un golpe. ¿Valió la pena? 🥊", 
        "Estás gastando dinero presente a costa de tu seguridad futura. 📉", 
        "Menos compras innecesarias, más ahorro duro. 🧱", 
        "La regla de oro: si no lo necesitas, es caro a cualquier precio. 🏷️", 
        "La riqueza se mide en lo que no gastas, no en lo que compras. 💎", 
        "Cuidado con la trampa del estilo de vida inflado. 🎈", 
        "Optimiza tus recursos. Todo gasto tiene un impacto. ⚙️", 
        "Toda salida de efectivo es una decisión de asignación de recursos. 📊"
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
      if (!isGuest && espacioActivo?.tipo !== 'individual') {
         const { data: checkPro } = await supabase.from('perfiles').select('is_pro').eq('id', session?.user?.id).single();
         if (!checkPro?.is_pro) {
             alert("Tu acceso PRO ha expirado o fue revocado por el administrador.");
             onSwitchSpace?.(); 
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
  }, [espacioActivo, isGuest, forceTab, session?.user?.id, onSwitchSpace, onTriggerPaywall]);

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
      setUsuario((perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Tú");
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
      monto_bs = montoInput; monto_usd_bcv = rates.bcv > 0 ? montoInput / rates.bcv : 0; monto_usd_paralelo = rates.usdt > 0 ? montoInput / rates.usdt : 0;
    } else if (monedaInput === 'usd') {
      monto_usd_bcv = montoInput; monto_usd_paralelo = montoInput; monto_bs = montoInput * rates.bcv;
    } else if (monedaInput === 'usdt') {
      monto_usd_paralelo = montoInput; monto_usd_bcv = montoInput; monto_bs = montoInput * rates.usdt;
    }
    return { monto_bs, monto_usd_bcv, monto_usd_paralelo };
  };

  const getPoteAhorrado = (poteId: string, poteNombre: string) => transactions.filter(tx => tx.categoria === `pote_${poteId}`).reduce((acc, tx) => tx.tipo === "ingreso" ? acc + (tx.monto_usd_paralelo || 0) : acc - (tx.monto_usd_paralelo || 0), 0);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !usuario.trim()) { alert("Completa el detalle y quién pagó."); return; }
    if (!verificarLimiteInvitado()) return;

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
    await supabase.from("recordatorios").insert([{ texto: nuevoRecordatorio, usuario: (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Invitado", espacio_id: espacioActivo.id }]);
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

  const getPatrimonioBruto = () => transactions.reduce((acc, tx) => tx.tipo === "ingreso" ? acc + (tx.monto_usd_paralelo || 0) : acc - (tx.monto_usd_paralelo || 0), 0);
  
  const getDisponiblePorUsuario = (userName: string) => {
    return transactions.reduce((acc, tx) => {
      if (tx.categoria.startsWith("pote_") || tx.categoria === 'emergencia') return acc; 
      const val = tx.monto_usd_paralelo || 0;
      
      if (espacioActivo?.tipo === 'individual') {
         return tx.tipo === "ingreso" ? acc + val : acc - val;
      }

      const divisor = (espacioActivo?.tipo === 'vaca' ? Math.max(participantes.length, 1) : 2);
      
      if (tx.usuario === userName || (tx.usuario === 'Tú' && userName === (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))))) {
         return tx.tipo === "ingreso" ? acc + val : acc - val;
      } else if (tx.usuario === 'Ambos' || tx.usuario === 'Todos (Div)') {
         const splitVal = val / divisor;
         return tx.tipo === "ingreso" ? acc + splitVal : acc - splitVal;
      }
      return acc;
    }, 0);
  };

  const patrimonioBrutoUSDT = getPatrimonioBruto();
  const transaccionesDelMes = transactions.filter(tx => tx.created_at.startsWith(mesActual));
  const transaccionesFiltradas = transaccionesDelMes.filter(tx => filtroHistorial === "Todos" || tx.usuario === filtroHistorial);

  const gastosDelMes = transaccionesDelMes.filter(tx => tx.tipo === 'egreso');
  const gastosPorCategoriaValor = gastosDelMes.reduce((acc, tx) => {
    acc[tx.categoria] = (acc[tx.categoria] || 0) + (tx.monto_usd_paralelo || 0);
    return acc;
  }, {} as Record<string, number>);

  const datosCategoriasMap = gastosDelMes.reduce((acc, tx) => {
    let catName = tx.categoria.startsWith('pote_') ? 'Extracción Potes' : 
                  tx.categoria === 'emergencia' ? 'Emergencias 🚨' : 
                  (categoriasList.find(c => c.valor === tx.categoria)?.label || tx.categoria);
    acc[catName] = (acc[catName] || 0) + (tx.monto_usd_paralelo || 0);
    return acc;
  }, {} as Record<string, number>);

  const dataGraficoTorta = Object.keys(datosCategoriasMap).map(key => ({ name: key, value: datosCategoriasMap[key] })).sort((a, b) => b.value - a.value);
  const COLORS = [theme.stroke, '#ec4899', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#6366f1', '#d946ef'];
  const ingresosMesChart = transaccionesDelMes.filter(tx => tx.tipo === 'ingreso' && !tx.categoria.startsWith('pote_') && tx.categoria !== 'emergencia').reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0);
  const dataFlujoCaja = [{ name: 'Este Mes', Ingresos: ingresosMesChart, Egresos: gastosDelMes.reduce((acc, tx) => acc + (tx.monto_usd_paralelo || 0), 0) }];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a0f2e] border border-purple-500/30 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold text-xs mb-1">{payload[0].name || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>{entry.dataKey}: ${entry.value.toFixed(2)} USDT</p>
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
                <input type="number" step="0.01" placeholder="0.00" value={calcMonto} onChange={(e) => setCalcMonto(e.target.value)} className="flex-1 bg-transparent text-3xl font-black text-white outline-none font-mono w-full" />
                <select value={calcMoneda} onChange={(e) => setCalcMoneda(e.target.value)} className={`bg-[#1a0f2e] border ${theme.border} rounded-xl px-3 text-sm text-white font-bold outline-none`}>
                  <option value="bs">BS</option><option value="usd">USD</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme.darkBg} p-4 rounded-2xl border border-white/5 text-center`}>
                <p className={`text-[10px] uppercase ${theme.text} font-bold mb-1`}>{calcMoneda === 'bs' ? 'Equivale a (BCV)' : 'Pagar a Tasa BCV'}</p>
                <p className="text-xl font-black text-white font-mono">{calcMoneda === 'bs' ? `$ ${(rates.bcv > 0 ? parseFloat(calcMonto||"0")/rates.bcv : 0).toFixed(2)}` : `Bs. ${(parseFloat(calcMonto||"0")*rates.bcv).toFixed(2)}`}</p>
              </div>
              <div className={`${theme.darkBg} p-4 rounded-2xl border border-white/5 text-center`}>
                <p className={`text-[10px] uppercase ${theme.text} font-bold mb-1`}>{calcMoneda === 'bs' ? 'Equivale a (Paralelo)' : 'Pagar a Paralelo'}</p>
                <p className="text-xl font-black text-white font-mono">{calcMoneda === 'bs' ? `$ ${(rates.usdt > 0 ? parseFloat(calcMonto||"0")/rates.usdt : 0).toFixed(2)}` : `Bs. ${(parseFloat(calcMonto||"0")*rates.usdt).toFixed(2)}`}</p>
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
            <p className="text-4xl font-black text-white">${fondoEmergencia.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-white/50 mt-4 max-w-md">Esta es tu red de seguridad. Este dinero se suma a tu patrimonio total, pero no aparece en tu liquidez diaria para evitar que lo gastes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
            <div className={`lg:col-span-5 bg-[#1a0f2e] border ${theme.border} p-4 rounded-3xl shadow-xl`}>
              <h2 className={`text-base font-bold mb-4 flex items-center gap-2 text-white`}><Plus className={`w-4 h-4 ${theme.text}`} /> Movimiento de Emergencia</h2>
              <form onSubmit={handleEmergenciaSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`flex-1 border rounded-xl p-2.5 text-xs font-black outline-none ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                    <option value="ingreso">AGREGAR FONDO 💰</option><option value="egreso">RETIRO/EMERGENCIA 💸</option>
                  </select>
                  
                  {espacioActivo?.tipo === 'individual' ? (
                    <div className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white/50 font-bold flex items-center cursor-not-allowed`}>
                      👤 {(perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Invitado"}
                    </div>
                  ) : (
                    <select required value={usuario} onChange={(e) => setUsuario(e.target.value)} className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`}>
                      <option value="">¿Quién aporta?</option>
                      {nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                      {nombresParticipantes.length > 0 && <option value={espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)'}>{espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos'}</option>}
                    </select>
                  )}
                </div>
                
                <input type="text" required placeholder="Detalle (Ej: Reparación carro)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={`w-full bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`} />

                <div className="flex gap-2">
                  <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white font-mono outline-none`} />
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={`w-20 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`}>
                    <option value="usd">USD</option><option value="bs">BS</option>
                  </select>
                </div>
                
                {monto && rates.bcv > 0 && (
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 w-full mb-2 text-center">
                    {moneda === 'bs' ? (
                      <>
                        <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>Equiv. BCV</p><p className="font-mono text-white font-bold text-sm">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p></div>
                        <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                        <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>Equiv. Paralelo</p><p className="font-mono text-white font-bold text-sm">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p></div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>En Tasa BCV</p><p className="font-mono text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p></div>
                        <div className={`h-6 w-px bg-white/10 mx-2`}></div>
                        <div className="flex-1"><p className={`text-[9px] uppercase ${theme.text} font-bold mb-0.5`}>En Paralelo</p><p className="font-mono text-white font-bold text-sm">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p></div>
                      </>
                    )}
                  </div>
                )}
                
                <button type="submit" className={`w-full font-black py-3 rounded-xl ${theme.primary} text-white text-xs shadow-lg active:scale-95 transition-transform`}>GUARDAR</button>
              </form>
            </div>

            <div className={`lg:col-span-7 bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}>
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
                        <p className={`text-sm font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>${tx.monto_usd_paralelo?.toFixed(2)}</p>
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

    if (activeTab === 'pagos') {
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
          <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400"/> Control Presupuestario (Base Cero)
              </h3>
              <button onClick={() => setIsEditingBudget(!isEditingBudget)} className={`p-1.5 ${theme.lightBg} hover:bg-white/10 rounded-md ${theme.text} transition-colors`}>
                {isEditingBudget ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {isEditingBudget && (
              <form onSubmit={guardarPresupuesto} className={`flex gap-2 mb-5 p-3 bg-black/40 rounded-xl border ${theme.border}`}>
                <select value={budgetForm.categoria} onChange={e => setBudgetForm({...budgetForm, categoria: e.target.value})} className="flex-1 bg-transparent text-xs md:text-sm text-white outline-none cursor-pointer" required>
                  <option value="" className="bg-[#1a0f2e]">Selecciona Categoría...</option>
                  {categoriasList.map(c => <option key={c.id || c.valor} value={c.valor} className="bg-[#1a0f2e]">{c.label}</option>)}
                </select>
                <input type="number" step="0.01" placeholder="Límite $" value={budgetForm.monto_limite} onChange={e => setBudgetForm({...budgetForm, monto_limite: e.target.value})} className={`w-20 md:w-28 bg-transparent text-xs md:text-sm text-white outline-none font-mono border-l ${theme.border} pl-2`} required />
                <button type="submit" className="text-emerald-400 p-1 hover:bg-emerald-500/20 rounded transition-colors"><Check className="w-4 h-4 md:w-5 md:h-5"/></button>
              </form>
            )}

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
                      <span className="font-mono">
                        <span className={p.isOver ? 'text-rose-400 font-black' : ''}>${p.gastoActual.toFixed(2)}</span> 
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
              <button onClick={() => setIsAddingCashea(!isAddingCashea)} className={`p-1 md:p-1.5 ${theme.lightBg} rounded-md ${theme.text}`}><Plus className="w-3.5 h-3.5 md:w-4 md:h-4"/></button>
            </div>
            {isAddingCashea && (
              <form onSubmit={agregarCashea} className={`flex flex-col gap-2 md:gap-3 p-3 md:p-4 mb-3 md:mb-4 rounded-xl border ${theme.border} bg-black/40`}>
                <input type="text" placeholder="Artículo" value={casheaForm.articulo} onChange={e => setCasheaForm({...casheaForm, articulo: e.target.value})} className="bg-black/50 p-1.5 md:p-2 rounded text-xs md:text-sm text-white" required />
                <div className="flex gap-2 items-end">
                  <div className="w-1/2">
                    <label className="text-[8px] text-white/50 uppercase font-black tracking-widest ml-1 mb-1 block">Monto $</label>
                    <input type="number" step="0.01" placeholder="0.00" value={casheaForm.monto_cuota} onChange={e => setCasheaForm({...casheaForm, monto_cuota: e.target.value})} className={`w-full bg-black/50 border ${theme.border} p-2 rounded-xl text-xs md:text-sm text-white font-mono outline-none`} required />
                  </div>
                  <div className="w-1/2">
                    <label className="text-[8px] text-white/50 uppercase font-black tracking-widest ml-1 mb-1 block">¿Cuándo debes pagarla?</label>
                    <input type="date" value={casheaForm.fecha_pago} onChange={e => setCasheaForm({...casheaForm, fecha_pago: e.target.value})} className={`w-full bg-black/50 border ${theme.border} p-2 rounded-xl text-xs md:text-sm text-white outline-none`} required />
                  </div>
                </div>
                <select required value={casheaForm.usuario} onChange={e => setCasheaForm({...casheaForm, usuario: e.target.value})} className={`w-full bg-black/50 border ${theme.border} rounded-lg p-1.5 md:p-2 text-xs md:text-sm text-white outline-none`}>
                  <option value="">¿Quién debe pagar?</option>
                  {espacioActivo?.tipo === 'individual' ? <option value={(perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Invitado"}>Tú</option> : nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button type="submit" className={`${theme.primary} p-1.5 md:p-2 rounded font-bold text-xs md:text-sm text-white`}>Guardar</button>
              </form>
            )}
            <div className="space-y-2">
              {cuotasCashea.map(cuota => (
                <div key={cuota.id} className={`group flex items-center justify-between p-2.5 md:p-3 rounded-xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : `bg-black/40 ${theme.border}`}`}>
                  <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => toggleCashea(cuota)}>
                    {cuota.pagado ? <CheckSquare className="text-emerald-400 w-4 h-4 md:w-5 md:h-5"/> : <Square className={`${theme.text} w-4 h-4 md:w-5 md:h-5`}/>}
                    <div>
                      <p className="text-xs md:text-sm font-bold">
                        {cuota.articulo} <span className={`text-[8px] md:text-[10px] ${theme.text} font-normal ml-1 ${theme.lightBg} px-1 md:px-1.5 py-0.5 rounded-md`}>{cuota.usuario || 'Usuario'}</span>
                      </p>
                      <p className={`text-[9px] md:text-[10px] ${theme.text}`}>{cuota.fecha_pago}</p>
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
      return (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className={`text-sm font-bold ${theme.text} uppercase tracking-widest flex items-center gap-2`}>
                <img src="/pote.png" alt="pote" className="w-5 h-5 object-contain drop-shadow-md" /> Mis Potes
              </h2>
              <button onClick={() => { setPoteForm({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" }); setIsAddingPote(!isAddingPote); }} className={`${theme.lightBg} ${theme.text} p-1.5 rounded-lg transition-colors`}>
                {isAddingPote ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
              </button>
            </div>

            {isAddingPote && (
              <form onSubmit={guardarPote} className={`bg-[#1a0f2e] border ${theme.border} p-4 rounded-[2rem] shadow-xl flex flex-col gap-3`}>
                <div className="flex gap-2">
                  <select value={poteForm.tipo} onChange={(e) => setPoteForm({...poteForm, tipo: e.target.value})} className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-3 text-xs md:text-sm text-white outline-none`}>
                    {POTE_OPCIONES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <input type="number" step="0.01" placeholder="Monto $" value={poteForm.monto_objetivo} onChange={(e) => setPoteForm({...poteForm, monto_objetivo: e.target.value})} className={`w-24 bg-black/50 border ${theme.border} rounded-xl p-3 text-xs md:text-sm text-white font-mono outline-none`} required />
                </div>
                {poteForm.tipo === "Personalizado ✍️" && <input type="text" placeholder="Nombre de la meta" value={poteForm.nombreCustom} onChange={(e) => setPoteForm({...poteForm, nombreCustom: e.target.value})} className={`w-full bg-black/50 border ${theme.border} rounded-xl p-3 text-xs md:text-sm text-white outline-none`} required />}
                <button type="submit" className={`w-full ${theme.primary} text-white font-bold py-3 rounded-xl text-sm`}>Guardar</button>
              </form>
            )}

            {potes.map(pote => {
              const ahorrado = getPoteAhorrado(pote.id, pote.nombre);
              const porcentaje = Math.min((ahorrado / pote.monto_objetivo) * 100, 100);
              
              return (
                <div key={pote.id} className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-[2rem] shadow-xl relative overflow-hidden group`}>
                  {porcentaje >= 100 && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-4">
                      <span className="text-3xl mb-1">🎉</span>
                      <h3 className="text-white font-black text-lg">¡Meta Alcanzada!</h3>
                      <p className="text-emerald-100 text-[10px] mb-3">Lograron ahorrar ${pote.monto_objetivo}.</p>
                      <button onClick={() => eliminarPote(pote.id)} className="bg-white text-emerald-600 font-bold px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition-transform">Eliminar Pote</button>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-sm md:text-lg font-black text-white flex items-center gap-2">{pote.nombre} <span className={`${theme.text} text-[9px] ${theme.lightBg} px-2 py-0.5 rounded-lg`}>{pote.monto_objetivo} USDT</span></h2>
                        <p className={`text-[10px] ${theme.text} mt-1`}>Faltan ${Math.max(pote.monto_objetivo - ahorrado, 0).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs md:text-sm font-mono font-bold ${theme.text}`}>{porcentaje.toFixed(1)}%</span>
                        {porcentaje < 100 && (
                          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => eliminarPote(pote.id)} className="p-1 bg-rose-500/20 text-rose-400 rounded"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`h-2 w-full bg-black/50 rounded-full border ${theme.border} p-0.5 mt-2`}>
                      <div className={`h-full ${theme.primary} rounded-full`} style={{ width: `${porcentaje}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-6">
            <div className={`col-span-2 md:col-span-1 h-full`}>
              <CardBalance title="Patrimonio Total" amount={patrimonioBrutoUSDT} rates={rates} border={theme.border} />
            </div>
            
            {espacioActivo?.tipo === 'individual' ? (
              <div className="h-full">
                <CardBalance title="Liquidez Disponible" amount={getDisponiblePorUsuario((perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Invitado")} rates={rates} border={theme.border} small />
              </div>
            ) : (
              nombresParticipantes.map((u, i) => (
                <div key={i} className="h-full">
                  <CardBalance title={`Disponible ${u}`} amount={getDisponiblePorUsuario(u)} rates={rates} border={theme.border} small />
                </div>
              ))
            )}
          </div>

          {transaccionesDelMes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
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

              <div className={`bg-[#1a0f2e] border ${theme.border} p-4 md:p-6 rounded-3xl shadow-xl flex flex-col min-h-[300px]`}>
                <h3 className="text-xs md:text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400"/> Flujo de Caja
                </h3>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <BarChart data={dataFlujoCaja} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke={theme.stroke} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme.stroke} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#fff', opacity: 0.05}} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
            <div className={`lg:col-span-5 bg-[#1a0f2e] border ${theme.border} p-4 rounded-3xl shadow-xl`}>
              <h2 className={`text-base font-bold mb-4 flex items-center gap-2 text-white`}><Plus className={`w-4 h-4 ${theme.text}`} /> Nuevo Registro</h2>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                
                <div className="flex gap-2">
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`flex-1 border rounded-xl p-2.5 text-xs font-black outline-none ${tipo === 'ingreso' ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/30 border-rose-500/50 text-rose-400'}`}>
                    <option value="egreso">GASTO 💸</option><option value="ingreso">INGRESO 💰</option>
                  </select>
                  
                  {espacioActivo?.tipo === 'individual' ? (
                    <div className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white/50 font-bold flex items-center cursor-not-allowed`}>
                      👤 {(perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || (perfil?.nombre || session?.user?.email?.split('@')[0]))))))) || "Invitado"}
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      {isAddingPart ? (
                        <div className="flex flex-col w-full gap-2">
                          <div className="flex w-full">
                            <input 
                              type="text" 
                              placeholder="Ej: Pedro" 
                              value={nuevoPart} 
                              onChange={e => setNuevoPart(e.target.value)} 
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  agregarParticipante();
                                }
                              }}
                              className={`w-full bg-black/50 border ${theme.border} rounded-l-xl p-2.5 text-xs text-white outline-none focus:border-white/50`} 
                            />
                            <button type="button" onClick={agregarParticipante} className={`bg-emerald-500/20 text-emerald-400 px-3 rounded-r-xl border border-l-0 ${theme.border} hover:bg-emerald-500/40 transition-colors`}><Check className="w-4 h-4"/></button>
                          </div>
                          
                          {/* 🛡️ LISTA PARA ELIMINAR PARTICIPANTES */}
                          {participantes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {participantes.map(p => (
                                <span key={p.id} className="bg-black/40 border border-white/10 text-[9px] px-2 py-1 rounded-lg flex items-center gap-1.5 text-white/70">
                                  {p.nombre} 
                                  <X className="w-3 h-3 cursor-pointer text-rose-400 hover:text-rose-500" onClick={() => eliminarParticipante(p.id, p.nombre)} />
                                </span>
                              ))}
                            </div>
                          )}
                          <button type="button" onClick={() => setIsAddingPart(false)} className="text-[9px] text-white/30 text-right uppercase tracking-widest hover:text-white/50 mt-1">Cerrar edición</button>
                        </div>
                      ) : (
                        <>
                          <select required value={usuario} onChange={(e) => setUsuario(e.target.value)} className={`w-full bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`}>
                            <option value="">¿Quién pagó?</option>
                            {nombresParticipantes.map(u => <option key={u} value={u}>{u}</option>)}
                            {nombresParticipantes.length > 0 && <option value={espacioActivo?.tipo === 'pote' ? 'Ambos' : 'Todos (Div)'}>{espacioActivo?.tipo === 'pote' ? 'Ambos (Mitad)' : 'Todos (División igual)'}</option>}
                          </select>
                          <button type="button" onClick={() => setIsAddingPart(true)} className={`bg-white/5 text-white/50 px-2 rounded-xl border ${theme.border} hover:text-white transition-colors`} title="Añadir Participante"><Plus className="w-4 h-4"/></button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`w-full bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`}>
                    <optgroup label="Categorías Generales">
                      {categoriasList.map(cat => <option key={cat.id || cat.valor} value={cat.valor}>{cat.label}</option>)}
                    </optgroup>
                    {potes.length > 0 && (
                      <optgroup label="Mis Potes (Ahorro/Extracción)">
                        {potes.map(p => <option key={`opt_${p.id}`} value={`pote_${p.id}`}>Pote: {p.nombre}</option>)}
                      </optgroup>
                    )}
                  </select>
                  <input type="text" required placeholder="Detalle (Ej: Almuerzo)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={`w-full bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`} />
                </div>

                <div className="flex gap-2">
                  <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className={`flex-1 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white font-mono outline-none`} />
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={`w-20 bg-black/50 border ${theme.border} rounded-xl p-2.5 text-xs text-white outline-none`}>
                    <option value="usd">USD</option><option value="bs">BS</option>
                  </select>
                </div>
                
                {monto && rates.bcv > 0 && (
                  <div className="flex items-center justify-between bg-black/40 p-3 md:p-4 rounded-xl border border-white/5 w-full mb-2 text-center">
                    {moneda === 'bs' ? (
                      <>
                        <div className="flex-1">
                          <p className={`text-[9px] md:text-[10px] uppercase ${theme.text} font-bold mb-0.5 md:mb-1`}>Equiv. BCV</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p>
                        </div>
                        <div className={`h-6 md:h-8 w-px bg-white/10 mx-2`}></div>
                        <div className="flex-1">
                          <p className={`text-[9px] md:text-[10px] uppercase ${theme.text} font-bold mb-0.5 md:mb-1`}>Equiv. Paralelo</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className={`text-[9px] md:text-[10px] uppercase ${theme.text} font-bold mb-0.5 md:mb-1`}>En Tasa BCV</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p>
                        </div>
                        <div className={`h-6 md:h-8 w-px bg-white/10 mx-2`}></div>
                        <div className="flex-1">
                          <p className={`text-[9px] md:text-[10px] uppercase ${theme.text} font-bold mb-0.5 md:mb-1`}>En Paralelo</p>
                          <p className="font-mono text-white font-bold text-sm md:text-lg">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button type="submit" className={`w-full font-black py-3 rounded-xl ${theme.primary} text-white text-xs shadow-lg active:scale-95 transition-transform`}>GUARDAR</button>
              </form>
            </div>

            <div className={`lg:col-span-7 bg-[#1a0f2e] border ${theme.border} rounded-3xl overflow-hidden shadow-xl`}>
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
                        <p className={`text-sm font-black ${tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${tx.monto_usd_paralelo?.toFixed(2)}
                        </p>
                        {/* 🛡️ MUESTRA EL MONTO ORIGINAL EN BS SI EL USUARIO REGISTRÓ EN BOLÍVARES */}
                        {tx.moneda_original === 'bs' && (
                          <p className="text-[9px] text-white/30 font-mono">Bs. {tx.monto_original?.toFixed(2)}</p>
                        )}
                      </div>
                      <button onClick={() => eliminarTransaccion(tx.id)} className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }
    
    return <div className="p-10 text-center text-white/50">Cambia de pestaña en la barra de navegación para ver este contenido.</div>;
  };

  return (
    <div className="w-full">
      {isGuest && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 text-center mb-4 rounded-xl flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4"/> Modo Invitado: Prueba gratuita activada.
        </div>
      )}

      {/* HEADER DINÁMICO */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between bg-[#1a0f2e] p-4 md:p-5 rounded-[2rem] md:rounded-3xl border ${theme.border} shadow-2xl mb-4 md:mb-6 gap-4 transition-colors`}>
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <img src="/pote.png" alt="Mi Pote" className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
            <div>
              <h1 className="text-base md:text-xl font-black text-white tracking-wide">{espacioActivo?.nombre}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] uppercase tracking-widest ${theme.text} ${theme.lightBg} px-2 rounded-md font-bold`}>{espacioActivo?.tipo}</span>
                {/* ICONO DE COMPARTIR CÓDIGO Y QR */}
                {espacioActivo?.codigo_invitacion && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {navigator.clipboard.writeText(espacioActivo.codigo_invitacion); alert("Código copiado al portapapeles");}} 
                      className="flex items-center gap-1 text-[9px] font-mono bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors" title="Copiar código">
                      <Key className="w-3 h-3"/> {espacioActivo.codigo_invitacion} <Copy className="w-2 h-2 ml-1 opacity-50"/>
                    </button>
                    <button 
                      onClick={() => setShowQRModal(true)} 
                      className="flex items-center gap-1 text-[9px] font-mono bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors" title="Ver QR">
                      <QrCode className="w-3 h-3"/> QR
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onSwitchSpace} className={`md:hidden ${theme.primary} text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg`}>
             <RefreshCw className="w-3 h-3"/> Cambiar
          </button>
        </div>
        
        <div className={`flex items-center justify-between md:justify-end gap-3 md:gap-6 bg-black/40 p-2 md:p-4 rounded-2xl border ${theme.border} w-full md:w-auto`}>
          <button onClick={onSwitchSpace} className={`hidden md:flex ${theme.primary} text-white text-[10px] font-bold px-3 py-2 rounded-xl items-center gap-1 shadow-lg mr-4`}>
             <RefreshCw className="w-3 h-3"/> Cambiar Módulo
          </button>
          
          <div className="text-center flex-1 md:flex-none">
            <p className={`text-[8px] uppercase ${theme.text} font-bold mb-0.5`}>Tasa BCV</p>
            <p className="font-mono text-xs md:text-lg text-white">Bs. {rates.bcv.toFixed(2)}</p>
          </div>
          <div className={`h-6 w-px bg-white/10`}></div>
          <div className="text-center flex-1 md:flex-none">
            <p className={`text-[8px] uppercase ${theme.text} font-bold mb-0.5`}>Paralelo</p>
            <p className="font-mono text-xs md:text-lg text-white">Bs. {rates.usdt.toFixed(2)}</p>
          </div>
          <button onClick={fetchRates} disabled={syncing} className={`ml-1 md:ml-2 ${theme.lightBg} ${theme.text} p-1.5 md:p-2 rounded-xl transition-all`}>
            <RefreshCw className={`w-3.5 h-3.5 md:w-5 md:h-5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {renderTabContent()}

      <nav className={`fixed bottom-0 left-0 right-0 bg-[#1a0f2e]/90 backdrop-blur-xl border-t ${theme.border} p-3 md:hidden z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} theme={theme} />
          <NavButton icon={<CreditCard />} label="Obligaciones" active={activeTab === 'pagos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('pagos')}} theme={theme} />
          <NavButton icon={<StickyNote />} label="Recordatorios" active={activeTab === 'avisos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('avisos')}} theme={theme} />
          {espacioActivo?.tipo !== 'vaca' && (
            <NavButton icon={<Shield />} label="Reserva" active={activeTab === 'emergencia'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('emergencia')}} theme={theme} />
          )}
          <NavButton icon={<Calculator />} label="Calculo" active={activeTab === 'calculadora'} onClick={() => setActiveTab('calculadora')} theme={theme} />
        </div>
      </nav>

      <nav className="hidden md:flex justify-center mt-8 space-x-4">
        <NavButtonDesktop icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} theme={theme} />
        <NavButtonDesktop icon={<CreditCard />} label="Obligaciones" active={activeTab === 'pagos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('pagos')}} theme={theme} />
        <NavButtonDesktop icon={<StickyNote />} label="Recordatorios" active={activeTab === 'avisos'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('avisos')}} theme={theme} />
        {espacioActivo?.tipo !== 'vaca' && (
          <NavButtonDesktop icon={<Shield />} label="Por si acaso" active={activeTab === 'emergencia'} onClick={() => {if(isGuest) onTriggerPaywall?.(); else setActiveTab('emergencia')}} theme={theme} />
        )}
        <NavButtonDesktop icon={<Calculator />} label="Calculadora" active={activeTab === 'calculadora'} onClick={() => setActiveTab('calculadora')} theme={theme} />
      </nav>

      {/* MODAL QR */}
      {showQRModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`bg-[#1a0f2e] border ${theme.border} p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative`}>
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-black text-white mb-2">Escanea para unirte</h3>
            <p className={`text-sm ${theme.text} mb-6`}>Pídele a tu amigo que escanee este código o ingrese el texto: <strong className="text-white bg-white/10 px-2 py-1 rounded">{espacioActivo.codigo_invitacion}</strong></p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${espacioActivo.codigo_invitacion}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <button onClick={() => {navigator.clipboard.writeText(espacioActivo.codigo_invitacion); alert("Código copiado"); setShowQRModal(false);}} className={`w-full ${theme.primary} text-white font-black py-3.5 rounded-xl shadow-lg transition-transform active:scale-95`}>COPIAR CÓDIGO</button>
          </div>
        </div>
      )}

      {/* CHECKOUT PRO MULTI-PASO (PASARELA) EN EL DASHBOARD */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-[#1a0f2e] border border-amber-500/50 p-6 md:p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-md w-full text-center relative my-8">
            <button onClick={() => {setShowPaywall(false); setCheckoutPaso(1);}} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6"/></button>
            
            {!session ? (
              <>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Sparkles className="w-8 h-8 text-amber-400" /></div>
                <h3 className="text-xl font-black text-white mb-2">Desbloquea Mi Pote PRO</h3>
                <p className="text-sm text-white/70 mb-6">Crea una cuenta para pagar tu suscripción ($2.99/mes) y desbloquear los espacios compartidos.</p>
                <button onClick={goAuth} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3.5 rounded-xl shadow-lg mb-3 hover:scale-105 transition-transform">CREAR CUENTA GRATIS</button>
              </>
            ) : perfil?.estado_pago === 'pendiente' ? (
               <div className="py-8">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><RefreshCw className="w-10 h-10 text-blue-400" /></div>
                 <h3 className="text-2xl font-black text-white mb-2">Pago en Revisión</h3>
                 <p className="text-blue-200 text-sm">Ya enviamos tu pago. Un administrador lo aprobará pronto y se te habilitará el acceso.</p>
               </div>
            ) : checkoutPaso === 1 ? (
              <>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Sparkles className="w-8 h-8 text-amber-400" /></div>
                <h3 className="text-2xl font-black text-white mb-2">Hazte PRO</h3>
                <p className="text-amber-200 text-sm mb-6">Acceso a Potes compartidos y Las Vacas infinitas por <span className="font-black">$2.99 / mes</span>.</p>
                <button onClick={()=>setCheckoutPaso(2)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-3 hover:scale-105 transition-transform text-lg">PAGAR AHORA</button>
              </>
            ) : checkoutPaso === 2 ? (
              <form onSubmit={procesarPagoPRO} className="text-left space-y-4">
                <h3 className="text-xl font-black text-white text-center mb-4 border-b border-white/10 pb-4">Realizar Pago</h3>
                
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={()=>setMetodoPago('pagomovil')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'pagomovil' ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-white/50 border-white/10'}`}>Pago Móvil</button>
                  <button type="button" onClick={()=>setMetodoPago('binance')} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${metodoPago === 'binance' ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-white/50 border-white/10'}`}>Binance Pay</button>
                </div>

                <div className="bg-black/50 border border-white/5 p-4 rounded-xl text-sm text-white/80 space-y-2 font-mono">
                  {metodoPago === 'binance' ? (
                    <>
                      <p className="text-[10px] text-amber-400 uppercase font-bold font-sans">Enviar exactamente:</p>
                      <p className="text-2xl font-black text-white font-sans">$2.99 USDT</p>
                      <p className="mt-2 text-xs font-sans text-white/50">Correo Binance Pay:</p>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded"><span>dmvictorbalboa@gmail.com</span> <Copy className="w-4 h-4 cursor-pointer hover:text-white" onClick={()=>navigator.clipboard.writeText("dmvictorbalboa@gmail.com")}/></div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-blue-400 uppercase font-bold font-sans">Monto a Pagar en Bs (Tasa Paralelo):</p>
                      <p className="text-2xl font-black text-white font-sans">Bs. {(4.99 * tasaCheckout).toFixed(2)}</p>
                      <p className="mt-2 text-xs font-sans text-white/50">Datos del Pago Móvil:</p>
                      <div className="bg-white/5 p-3 rounded space-y-1 text-xs">
                        <p>📱 Teléfono: <strong>0412-301-6936</strong></p>
                        <p>🏦 Banco: <strong>Bancamiga (0172)</strong></p>
                        <p>🪪 C.I: <strong>27.531.901</strong></p>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Referencia / Alias</label>
                  <input type="text" required value={referencia} onChange={e=>setReferencia(e.target.value)} placeholder="Ej: Pago de Victor o 1459" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none mt-1 focus:border-amber-500 transition-colors" />
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
                 <button onClick={() => {setShowPaywall(false); setCheckoutPaso(1);}} className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all">Entendido</button>
               </div>
            )}
          </div>
        </div>
      )}

      
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

// 🛡️ TARJETAS DE BALANCE CON MULTIMONEDA (Diseño Original Restaurado)
function CardBalance({ title, amount, icon, color, border, small = false, rates }: any) {
  const [currency, setCurrency] = useState<'usd'|'bs'|'usdt'>('usd');
  
  const bsValue = amount * (rates?.usdt || 1);
  const usdBCVValue = rates?.bcv ? bsValue / rates.bcv : amount;

  let displayAmount = 0;
  let symbol = "$";
  let subText = "";

  if (currency === 'usdt') {
    displayAmount = amount;
    symbol = "USDT ";
    subText = `Bs. ${bsValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'bs') {
    displayAmount = bsValue;
    symbol = "Bs. ";
    subText = `$ ${usdBCVValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BCV`;
  } else {
    displayAmount = usdBCVValue;
    symbol = "$";
    subText = `Bs. ${bsValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Pral.`;
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${color ? color : 'bg-black/40'} border ${border} ${small ? 'p-4 rounded-2xl' : 'p-5 md:p-6 rounded-3xl'} flex flex-col justify-between h-full shadow-xl`}>
      <div className="flex justify-between items-center mb-2">
        <p className={`${small ? 'text-[9px]' : 'text-[10px]'} font-bold text-white/70 uppercase tracking-widest`}>{title}</p>
        <span className="text-white/30">{icon}</span>
      </div>
      
      <div className="flex flex-col mb-4">
        <p className={`${small ? 'text-xl' : 'text-3xl'} font-black ${amount < 0 ? 'text-rose-400' : 'text-white'}`}>
          {symbol}{displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] text-white/40 font-mono mt-1 font-bold">{subText}</p>
      </div>

      <div className="flex bg-black/40 p-1 rounded-xl w-max mt-auto border border-white/5 shadow-inner">
        <button onClick={() => setCurrency('usd')} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${currency === 'usd' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}>USD</button>
        <button onClick={() => setCurrency('bs')} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${currency === 'bs' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}>BS</button>
        <button onClick={() => setCurrency('usdt')} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${currency === 'usdt' ? 'bg-emerald-600 text-white shadow-md' : 'text-white/40 hover:text-white/80'}`}>USDT</button>
      </div>
    </div>
  );
}