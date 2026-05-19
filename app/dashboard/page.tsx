"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Plus, Users, RefreshCw, Trash2, CheckSquare, Square, Calendar, Edit2, Check, X, Bell, Send, PieChart as PieChartIcon, Target, Home, CreditCard, Calculator, Lock, Mail, LogIn, UserPlus, Sparkles, ArrowLeft, Shield, Key, Copy, UploadCloud, Phone, Menu, LogOut, Globe, ChevronRight, Loader2,
  DollarSign, TrendingUp, TrendingDown, Rocket, ShoppingCart, Wifi, Dog, Gift, Edit3, ChevronLeft, ArrowRight, ListTodo, ChevronDown, ArrowLeftRight, Layers
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Drawer } from "vaul";
import { InicioTab } from "@/components/Dashboard/InicioTab";
import { PagosTab } from "@/components/Dashboard/PagosTab";
import { RecordatoriosTab } from "@/components/Dashboard/RecordatoriosTab";
import { EmergenciaTab } from "@/components/Dashboard/EmergenciaTab";
import { CalculadoraTab } from "@/components/Dashboard/CalculadoraTab";
import OpenAI from "openai";
import { Camera } from "lucide-react"; // Asegúrate de tener este icono

// ============================================================================
// 1. COMPONENTE TRANSACTION DRAWER (PANTALLA COMPLETA NATIVA PARA IOS)
// ============================================================================
function TransactionDrawer({ 
  children,
  tipo, setTipo,
  categoria, setCategoria,
  customCategoria, setCustomCategoria, categoriasList,
  monto, setMonto,
  moneda, setMoneda,
  descripcion, setDescripcion,
  rates,
  theme,
  onSubmit,
  espacioActivo,
  participantes,
  usuario, setUsuario,
  espacios,
  potes,
  destinoTransferencia, setDestinoTransferencia
}: any) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueamos el scroll del fondo en iOS
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setMonto("");
        setDescripcion("");
        setCategoria("");
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, setMonto, setDescripcion, setCategoria]);

  const categories = {
    ingreso: [
      { id: "salario", label: "Sueldo", icon: <DollarSign size={18} /> },
      { id: "inversiones", label: "Inversiones", icon: <TrendingUp size={18} /> },
      { id: "ventas", label: "Ventas", icon: <ShoppingCart size={18} /> },
      { id: "tigritos", label: "Tigritos", icon: <Rocket size={18} /> },
      { id: "abono_pote", label: "Abonar a Meta 🍯", icon: <Plus size={18} /> },
      { id: "otro", label: "Otro", icon: <Edit3 size={18} /> },
    ],
    egreso: [
      { id: "comida", label: "Comida", icon: <ShoppingCart size={18} /> },
      { id: "cashea", label: "Cashea", icon: <DollarSign size={18} /> },
      { id: "internet", label: "Internet", icon: <Wifi size={18} /> },
      { id: "mascotas", label: "Mascotas", icon: <Dog size={18} /> },
      { id: "condominio", label: "Condominio", icon: <Home size={18} /> },
      { id: "regalos", label: "Regalos", icon: <Gift size={18} /> },
      { id: "retiro_pote", label: "Retirar de Meta 📉", icon: <ArrowDownCircle size={18} /> }, // <-- ESTA LÍNEA
      { id: "otro", label: "Otro", icon: <Edit3 size={18} /> },
    ]
  };

  const handleLocalSubmit = (e: any) => {
    e.preventDefault();
    if (tipo === 'transferencia' && !destinoTransferencia) return alert("Selecciona a qué espacio vas a transferir");
    if (categoria === 'abono_pote' && !destinoTransferencia) return alert("Selecciona a qué Meta vas a mandar la plata");
    
    const isValidDesc = (tipo === 'ingreso' || categoria === 'abono_pote' || tipo === 'transferencia') ? true : descripcion.trim() !== "";
    const isValidUser = usuario.trim() !== "" || espacioActivo?.tipo === 'individual';
    const isOtroValid = categoria === 'otro' ? customCategoria.trim() !== "" : true;
    
    if (monto && (categoria || tipo === 'transferencia') && isValidDesc && isValidUser && isOtroValid) {
      onSubmit(e);
      setIsOpen(false);
    } else {
      onSubmit(e); 
    }
  };

  return (
    <>
      {React.cloneElement(children, { onClick: () => setIsOpen(true) })}

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#0d0714] w-full h-[100dvh] flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-200">
          
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212] shrink-0 shadow-md z-20">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white hover:bg-rose-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h3 className="text-white font-black text-lg">Nuevo Registro</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 bg-[#0d0714] overscroll-contain">
            
            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl mb-6 flex-wrap gap-1">
              <button 
                type="button"
                onClick={() => {setTipo("ingreso"); setCategoria("");}}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors cursor-pointer ${tipo === 'ingreso' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
              >
                INGRESO
              </button>
              <button 
                type="button"
                onClick={() => {setTipo("egreso"); setCategoria("");}}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors cursor-pointer ${tipo === 'egreso' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
              >
                GASTO
              </button>
              {espacios?.length > 1 && espacioActivo?.tipo === 'individual' && (
                <button 
                  type="button" 
                  onClick={() => {setTipo("transferencia"); setCategoria("transferencia");}} 
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-colors cursor-pointer ${tipo === 'transferencia' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
                >
                  TRANSFERIR
                </button>
              )}
            </div>

            {tipo === 'transferencia' ? (
               <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-blue-500/30 mb-6 animate-in zoom-in-95">
                 <label className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ArrowRight size={14}/> Enviar dinero a un Espacio</label>
                 <select value={destinoTransferencia} onChange={(e) => setDestinoTransferencia(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer mb-4">
                    <option value="">Selecciona Pote o Vaca destino...</option>
                    {espacios?.filter((e:any) => e.id !== espacioActivo.id && e.tipo !== 'individual').map((e:any) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                 </select>
                 <p className="text-xs text-white/50 leading-relaxed">El dinero se descontará de <b>{espacioActivo.nombre}</b> y se enviará al espacio compartido.</p>
               </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {categories[tipo as keyof typeof categories].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoria(cat.id);
                      setDescripcion(cat.id === 'otro' || cat.id === 'abono_pote' ? '' : cat.label);
                    }}
                    className={`p-3 rounded-2xl border transition-colors flex flex-col items-center gap-2 cursor-pointer ${
                      categoria === cat.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-[10px] font-bold uppercase pointer-events-none">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {categoria === 'otro' && tipo !== 'transferencia' && (
              <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/20 mb-6 animate-in zoom-in-95">
                <label className="text-[10px] text-purple-400 uppercase font-bold tracking-widest block mb-2">Nombre de tu categoría</label>
                <input 
                  type="text" 
                  list="custom-cats"
                  placeholder="Ej: Taxi 🚕, Cine 🍿, etc." 
                  value={customCategoria} 
                  onChange={(e) => setCustomCategoria(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500" 
                />
                {/* Esto hace que le sugiera categorías que ya haya inventado antes */}
                <datalist id="custom-cats">
                  {categoriasList?.filter((c: any) => !['salario','comida','internet','mascotas','cashea','otro'].includes(c.valor)).map((c: any) => (
                    <option key={c.valor} value={c.label} />
                  ))}
                </datalist>
              </div>
            )}

           {(categoria === 'abono_pote' || categoria === 'retiro_pote') && tipo !== 'transferencia' && (
               <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-emerald-500/30 mb-6 animate-in zoom-in-95">
                 <label className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2">¿De qué meta es el movimiento?</label>
                 <select value={destinoTransferencia} onChange={(e) => setDestinoTransferencia(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer mb-2">
                    <option value="">Selecciona la meta destino...</option>
                    {potes?.map((p:any) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                 </select>
               </div>
            )}

            {espacioActivo?.tipo !== 'individual' && tipo !== 'transferencia' && (
              <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 mb-6">
                <label className="text-[9px] uppercase font-black text-white/30 block mb-2 tracking-widest pointer-events-none">¿Quién realizó el movimiento?</label>
                <select 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full bg-transparent text-white font-bold outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">Seleccionar integrante...</option>
                  {participantes?.map((p: any) => <option key={p.id} value={p.nombre} className="bg-[#1a1a1a]">{p.nombre}</option>)}
                  <option value="Ambos" className="bg-[#1a1a1a]">Ambos (Mitad y mitad)</option>
                </select>
              </div>
            )}

            <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 space-y-4 mb-6">
              <div>
                <label className="text-[9px] uppercase font-black text-white/30 block mb-1 tracking-widest pointer-events-none">Monto</label>
                <input 
                  type="number" step="0.01" placeholder="0.00"
                  value={monto} 
                  onChange={(e) => setMonto(e.target.value)}
                  className="bg-transparent text-4xl font-black text-white outline-none w-full tabular-nums tracking-tight font-sans"
                />
              </div>
              
              <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button type="button" onClick={() => setMoneda('usdt')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'usdt' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>USDT</button>
                <button type="button" onClick={() => setMoneda('bs')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'bs' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>BS</button>
                <button type="button" onClick={() => setMoneda('cash')} className={`cursor-pointer flex-1 py-2 text-xs font-black rounded-lg transition-colors ${moneda === 'cash' ? 'bg-purple-600 text-white shadow-md' : 'text-white/40 hover:bg-white/10'}`}>CASH</button>
              </div>

              {monto && rates.bcv > 0 && moneda !== 'cash' && (
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 text-center text-sm pointer-events-none">
                  {moneda === 'bs' ? (
                    <>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">BCV</p>
                        <p className="text-white font-bold font-sans tracking-tight">${(parseFloat(monto) / rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">Paralelo</p>
                        <p className="text-white font-bold font-sans tracking-tight">${(parseFloat(monto) / rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">BCV</p>
                        <p className="text-white font-bold font-sans tracking-tight">Bs. {(parseFloat(monto) * rates.bcv).toFixed(2)}</p>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase text-purple-400 font-bold mb-0.5">Paralelo</p>
                        <p className="text-white font-bold font-sans tracking-tight">Bs. {(parseFloat(monto) * rates.usdt).toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {categoria === 'cashea' && tipo !== 'transferencia' && (
              <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl mb-6">
                <p className="text-[10px] font-black text-purple-400 uppercase mb-3 text-center pointer-events-none">¿En cuántas cuotas?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 9].map(n => (
                    <button 
                      key={n} 
                      type="button"
                      onClick={() => (window as any).numCuotasCashea = n}
                      className="cursor-pointer py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl font-black text-white hover:bg-purple-600 transition-colors focus:ring-2 ring-purple-400 tabular-nums"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tipo === 'egreso' && categoria !== 'abono_pote' && tipo !== 'transferencia' && (
              <div className="mb-6">
                <input 
                  type="text" placeholder="¿En qué se fue la plata? (Ej: Pizza)"
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            )}

            <button 
              type="button"
              onClick={handleLocalSubmit}
              className={`cursor-pointer w-full text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-transform text-sm uppercase tracking-widest shrink-0 ${tipo === 'transferencia' ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'}`}
            >
              {tipo === 'transferencia' ? 'Confirmar Transferencia' : 'Confirmar Registro'}
            </button>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ============================================================================
// APP PRINCIPAL
// ============================================================================
export default function MiPoteApp() {
  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null); 
  const [isPro, setIsPro] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentView, setCurrentView] = useState('auth'); 
  
  const [authStage, setAuthStage] = useState<'welcome'|'login'|'reg1'|'reg2'|'loading'>('welcome');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState(""); 
  const [regNombre, setRegNombre] = useState("");
  const [authError, setAuthError] = useState("");

  const [espacios, setEspacios] = useState<any[]>([]);
  const [espacioActivo, setEspacioActivo] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");

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

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!telefono || !regNombre) { setAuthError("Completa todos los campos"); return; }
    
    setAuthStage('loading');
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { 
      setAuthError(error.message); 
      setAuthStage('reg2'); 
      return; 
    }
    
    if (data.user) {
      await supabase.from('perfiles').insert([{ id: data.user.id, email: data.user.email, telefono: telefono, nombre: regNombre, is_pro: false, estado_pago: 'gratis' }]);
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

  const seleccionarModulo = async (tipoModulo: string, eId?: string) => {
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
        nombre: titulos[tipoModulo],
        tipo: tipoModulo,
        creador_id: session.user.id,
        codigo_invitacion: generarCodigo()
      }]).select().single();

      if (newSpace) {
        await supabase.from('espacio_miembros').insert([{ espacio_id: newSpace.id, usuario_id: session.user.id, rol: 'admin' }]);
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

  if (loadingAuth) return ( <div className="min-h-screen bg-[#0d0714] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin"/></div> );

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

              <form onSubmit={handleLoginUser} className="space-y-5 flex-1">
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
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
                  </div>
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
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-purple-500 transition-colors" required />
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

             <form onSubmit={handleRegisterUser} className="space-y-5 flex-1">
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
      <div className="min-h-screen bg-[#0d0714] p-4 flex flex-col items-center pt-10">
        <div className="w-full max-w-md relative">
          <button onClick={() => setCurrentView('dashboard')} className="absolute -top-10 left-0 text-purple-400 flex items-center gap-2 text-sm font-bold"><ArrowLeft className="w-4 h-4"/> Volver</button>
          <FinanzasDashboardContent session={session} espacios={espacios} setEspacios={setEspacios} espacioActivo={espacioActivo} setEspacioActivo={setEspacioActivo} onSelectModule={seleccionarModulo} handleLogout={handleLogout} openJoinModal={() => setShowJoinModal(true)} openProfileModal={() => setShowProfileModal(true)} isGuest={isGuest} perfil={perfil} forceTab="calculadora" onChangeView={setCurrentView} />
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
          <form onSubmit={unirseConCodigo} className="bg-[#1a0f2e] border border-blue-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] max-w-sm w-full text-center relative">
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
          <form onSubmit={guardarPerfil} className="bg-[#1a0f2e] border border-purple-500/50 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(168,85,247,0.2)] max-w-sm w-full text-center relative">
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
                <p className="text-sm text-white/70 mb-6">Crea una cuenta para pagar tu suscripción ($2.99/mes) y desbloquear funciones premium como Presupuesto, Cashea y Espacios Compartidos.</p>
                <button onClick={() => {setShowPaywall(false); setCurrentView('auth');}} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3.5 rounded-xl shadow-lg mb-3 hover:scale-105 transition-transform">CREAR CUENTA GRATIS</button>
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
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. DASHBOARD PRINCIPAL - NÚCLEO DINÁMICO
// ============================================================================
function FinanzasDashboardContent({ 
  session, espacios, setEspacioActivo, espacioActivo, onSelectModule, handleLogout, openProfileModal, openJoinModal, isGuest = false, perfil, onTriggerPaywall, forceTab, onChangeView
}: any) {
const getTheme = (tipo: string) => {
    switch(tipo) {
      case 'pote': return { primary: 'bg-[#C026D3]', text: 'text-[#E879F9]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#c026d3', lightBg: 'bg-fuchsia-500/10' };
      case 'vaca': return { primary: 'bg-[#059669]', text: 'text-[#34D399]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#059669', lightBg: 'bg-emerald-500/10' };
      default: return { primary: 'bg-[#7C3AED]', text: 'text-[#A78BFA]', border: 'border-white/5', card: 'bg-[#1C1C1E]', darkBg: 'bg-[#121212]', stroke: '#7C3AED', lightBg: 'bg-[#7C3AED]/10' };
    }
  };
  const theme = getTheme(espacioActivo?.tipo || 'individual');

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
      const { error } = await supabase.from("transacciones_saas").delete().eq("id", id);
      if (error) alert("Error: " + error.message);
      else fetchData();
    }
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
  const [isSpacesMenuOpen, setIsSpacesMenuOpen] = useState(false); 
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); 

  const [activeWallet, setActiveWallet] = useState<'usdt'|'bs'|'cash'>('usdt'); 
  const [patrimonioRate, setPatrimonioRate] = useState<'paralelo' | 'bcv'>('paralelo');
  const [filtroHistorial, setFiltroHistorial] = useState("Todos");

  const [rates, setRates] = useState({ bcv: 0, usdt: 0, eur_bcv: 0, eur_paralelo: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cuotasCashea, setCuotasCashea] = useState<any[]>([]);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [potes, setPotes] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  
  const [isAddingPote, setIsAddingPote] = useState(false);
  const POTE_OPCIONES = espacioActivo?.tipo === 'vaca' 
    ? ["La rumba 🪩", "Pa' la caña 🍻", "El viaje ✈️", "La nave 🚗", "Personalizado ✍️"]
    : ["La nave 🚗", "Los estrenos 👕", "El gustico 🍔", "El semestre 📚", "Teléfono 📱", "Viaje ✈️", "Hogar 🏠", "Personalizado ✍️"];
  
  const [poteForm, setPoteForm] = useState({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" });
  
  const [nuevoPart, setNuevoPart] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date().toISOString().slice(0, 7));

  const [isAddingEmergencia, setIsAddingEmergencia] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isAddingCashea, setIsAddingCashea] = useState(false);
  const [isAddingFijo, setIsAddingFijo] = useState(false);

  const [comercio, setComercio] = useState("");
const [metadatosFactura, setMetadatosFactura] = useState<any>(null);
  
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);

  // --- ESTADOS PARA REDISEÑO Y VISION IA ---
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState("");

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
  const [budgetForm, setBudgetForm] = useState({ categoria: "", monto_limite: "" });
  const [fijoForm, setFijoForm] = useState({ descripcion: "", monto: "", dia_pago: "1" });

  const [showToast, setShowToast] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState("");
  const [toastType, setToastType] = useState("ingreso");

  const [calcAmount, setCalcAmount] = useState("");
  const [calcCurrency, setCalcCurrency] = useState("usd");
  const [calcBs, setCalcBs] = useState("");

  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("usd");
  const [tipo, setTipo] = useState("egreso");
 const [categoria, setCategoria] = useState("comida");
  const [customCategoria, setCustomCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [usuario, setUsuario] = useState("");

  const [pagoFijoActivo, setPagoFijoActivo] = useState<any>(null);
  const [monedaFijo, setMonedaFijo] = useState('bs');
  
  // NUEVO: DESTINO DE LA TRANSFERENCIA
  const [destinoTransferencia, setDestinoTransferencia] = useState("");

  const handleCalcUsd = (val: string) => {
    setCalcAmount(val);
    const num = parseFloat(val) || 0;
    setCalcBs((num * rates.usdt).toFixed(2));
  };

  const handleCalcBs = (val: string) => {
    setCalcBs(val);
    const num = parseFloat(val) || 0;
    setCalcAmount(rates.usdt > 0 ? (num / rates.usdt).toFixed(2) : "0.00");
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
    setTimeout(() => setShowToast(false), 4500);
  };

  const fetchRates = async () => { 
    setSyncing(true); 
    try { 
      // Traer Dólar (Tu API)
      const resUsd = await fetch("/api/rates"); 
      const dataUsd = await resUsd.json(); 
      
      // Traer Euro (DolarAPI)
      const resEur = await fetch("https://ve.dolarapi.com/v1/euros");
      const dataEur = await resEur.json();

      // Extraer los datos del Euro del arreglo
      const eurOficial = dataEur.find((e: any) => e.fuente === "oficial")?.promedio || 0;
      const eurParalelo = dataEur.find((e: any) => e.fuente === "paralelo")?.promedio || 0;

      // Guardar todo junto en el estado
      if (dataUsd.success) {
        setRates({ 
          bcv: dataUsd.bcv, 
          usdt: dataUsd.usdt,
          eur_bcv: eurOficial,
          eur_paralelo: eurParalelo
        }); 
      }
    } catch (e) {
      console.error("Error trayendo tasas:", e);
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
        
       const { data: catData } = await supabase.from("categorias").select("*");
        
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

        const combined = [...DEFAULT_CATEGORIES, ...(catData || []), ...dynamicCategorias];
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

  useEffect(() => { fetchRates(); fetchData(); }, [fetchData]);

  useEffect(() => {
    let interval: any;
    if (activeTab === 'calculadora' || forceTab === 'calculadora') {
      fetchRates(); interval = setInterval(fetchRates, 10000); 
    }
    return () => clearInterval(interval);
  }, [activeTab, forceTab]);

  useEffect(() => {
    if (espacioActivo?.tipo === 'individual') {
      setUsuario((perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú");
    }
  }, [espacioActivo, session, perfil]);

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


// 📸 MOTOR DE IA: ESCANEO DE FACTURAS CON GPT-4o (CON COMPRESIÓN PARA CELULARES)
  const handleScanInvoice = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return alert("Falta la API Key en el entorno.");

    setIsScanning(true);
    triggerToast("ingreso", "Procesando factura... 📸");

    try {
      // --- NUEVO: MOTOR DE COMPRESIÓN DE IMAGEN ---
      // Evita que la app colapse en celulares por fotos de 8MB
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200; // Reducimos a un ancho manejable
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Comprimimos a JPEG con 70% de calidad
            resolve(canvas.toDataURL('image/jpeg', 0.7)); 
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      
      // Quitamos el prefijo 'data:image/jpeg;base64,'
      const imageUrl = base64Image.split(',')[1];

      // --- LLAMADA A OPENAI ---
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
       messages: [{
            role: "user",
            content: [
              { type: "text", text: "Analiza esta factura, recibo o captura de transferencia (ej. Pago Móvil/Zelle). Extrae: 'comercio' (o a quién se le pagó), 'monto_total' (número puro), 'moneda' (bs o usdt), 'iva_total' (número), 'fecha', 'hora', 'categoria_sugerida' (comida, cashea, internet, mascotas, condominio, regalos, otro) y un arreglo llamado 'productos' que contenga objetos con 'nombre' y 'precio'. Responde SOLO un JSON puro." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageUrl}` } }
            ],
        }],
        temperature: 0,
      });

      const aiResponse = response.choices[0]?.message?.content;
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

        triggerToast("ingreso", "¡Datos listos! Confirma el registro.");
        setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 500);
      }
    } catch (error: any) {
      console.error("Error detallado:", error);
      // ESTO MOSTRARÁ EL ERROR REAL EN LA PANTALLA DEL TELÉFONO
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
      const poteDestino = potes.find((p:any) => p.id === destinoTransferencia);
      if (!isGuest) {
        if (espacioActivo.tipo === 'individual') {
          await supabase.from("transacciones_saas").insert([{ descripcion: `Retiro de meta: ${poteDestino?.nombre}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_entrada', usuario: usuario || "Tú", tipo: 'ingreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
        }
        await supabase.from("transacciones_saas").insert([{ descripcion: `Retiro realizado`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: `pote_${destinoTransferencia}`, usuario: usuario || "Tú", tipo: 'egreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
      }
      fetchData(); triggerToast("egreso", "Retiro de meta descontado 📉"); 
      setCustomCategoria(""); return;
    }

    if (finalCategoria === 'abono_pote') {
      if (!destinoTransferencia) return alert("Selecciona la meta");
      const poteDestino = potes.find((p:any) => p.id === destinoTransferencia);
      if (!isGuest) {
        if (espacioActivo.tipo === 'individual') {
          await supabase.from("transacciones_saas").insert([{ descripcion: `Abono a meta: ${poteDestino?.nombre}`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: 'transferencia_salida', usuario: usuario || "Tú", tipo: 'egreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
        }
        await supabase.from("transacciones_saas").insert([{ descripcion: `Abono recibido`, monto_original: valorMonto, moneda_original: moneda, monto_bs, monto_usd_bcv, monto_usd_paralelo, categoria: `pote_${destinoTransferencia}`, usuario: usuario || "Tú", tipo: 'ingreso', espacio_id: espacioActivo.id, usuario_id: session.user.id }]);
      }
      fetchData(); triggerToast("ingreso", "¡Abono sumado a tu meta! 🍯"); 
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
      else { fetchData(); triggerToast(tipo, msjAlertaEspecial || undefined); }
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
    await supabase.from("metas").delete().eq("id", id); fetchData();
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

  const getSaldosAislados = (userName?: string, incluirMetas: boolean = false) => {
    let bs = 0, usdt = 0, cash = 0;
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
        else usdt += valorReal;
      }
    });
    return { bs, usdt, cash };
  };

const getPatrimonioNeto = () => {
    let totalEnBolivaresVirtuales = 0;

    transactions.forEach(tx => {
      const signo = tx.tipo === "ingreso" ? 1 : -1;
      const montoOriginal = tx.monto_original || 0;
      const moneda = tx.moneda_original || (montoOriginal > 1000 ? 'bs' : 'usd');

      if (moneda === 'bs') {
        // Si ya son bolívares, los sumamos directo
        totalEnBolivaresVirtuales += (montoOriginal * signo);
      } else {
        // SI SON DÓLARES (USDT/CASH), los llevamos a Bs. usando la tasa PARALELO 
        // para saber cuánta "plata real" representan en la calle.
        totalEnBolivaresVirtuales += (montoOriginal * signo * rates.usdt);
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
    const gastosDelMesCalculados = transaccionesDelMes.filter(tx => tx.tipo === 'egreso' && tx.categoria !== 'transferencia_salida' && tx.categoria !== 'cambio_p2p');
 // 🔥 MAPEO DE GASTOS PARA GRÁFICO SEGURO
    const gastosPorCategoriaValor = gastosDelMesCalculados.reduce((acc, tx) => {
      let catName = tx.categoria.startsWith('pote_') ? 'Extracción Potes' : 
                    tx.categoria === 'emergencia' ? 'Emergencias 🚨' : 
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
      return <CalculadoraTab rates={rates} theme={theme} triggerToast={triggerToast} onBack={() => { onChangeView('dashboard'); setActiveTab('inicio'); }} />;
    }

    if (activeTab === 'emergencia') {
      return (
        <EmergenciaTab
          espacioActivo={espacioActivo}
          perfil={perfil}
          session={session}
          transactions={transactions}
          theme={theme}
          onAgregarEmergencia={handleEmergenciaAction}
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

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col min-h-[300px]">
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
                    <form onSubmit={guardarPresupuesto} className="flex flex-col gap-4">
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
                <p className="text-[10px] md:text-xs text-white/50 italic">No hay topes definidos. Asigna límites mensuales para evitar fugas.</p>
              ) : (
                presupuestosPorCategoria.map(p => (
                  <div key={p.id} className="space-y-1.5 relative group">
                    <div className="flex justify-between text-xs md:text-sm text-white">
                      <span className="font-bold flex items-center gap-2">
                        {p.catLabel} 
                        <button onClick={() => eliminarPresupuesto(p.id)} className="text-rose-500/0 group-hover:text-rose-500/50 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" /></button>
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

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col min-h-[300px]">
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
                    
                    <form onSubmit={guardarGastoFijo} className="flex flex-col gap-4">
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
                    
                    <form onSubmit={confirmarPagoFijo} className="flex flex-col gap-4">
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
                <p className="text-[10px] md:text-xs text-white/50 italic px-2">No hay gastos fijos configurados.</p>
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

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${theme.text}`}/> Cashea</h3>
              <button onClick={() => setIsAddingCashea(true)} className={`flex items-center gap-1 ${theme.lightBg} ${theme.text} px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors`}><Plus className="w-3 h-3"/> Nuevo Pago</button>
            </div>

            <Drawer.Root open={isAddingCashea} onOpenChange={setIsAddingCashea}>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
                <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[80vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
                  <Drawer.Title className="sr-only">Registrar Cuota Cashea</Drawer.Title>
                  <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                    <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Cuota Cashea</h3>
                    
                    <form onSubmit={agregarCashea} className="flex flex-col gap-4">
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

            <div className="space-y-2">
              {cuotasCashea.length === 0 ? (
                <p className="text-[10px] md:text-xs text-white/50 italic px-2">No hay cuotas pendientes.</p>
              ) : cuotasCashea.map(cuota => (
                <div key={cuota.id} className={`group flex items-center justify-between p-3 md:p-4 rounded-2xl border ${cuota.pagado ? 'bg-emerald-900/20 border-emerald-500/30' : `bg-black/40 ${theme.border}`}`}>
                  <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => toggleCashea(cuota)}>
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
                    <button onClick={async (e) => { e.stopPropagation(); if(confirm("¿Eliminar esta cuota de Cashea?")) { await supabase.from('cashea').delete().eq('id', cuota.id); fetchData(); } }} className="p-2 md:p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-5 rounded-3xl flex flex-col min-h-[300px]">
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
      const nombreUsuario = (perfil?.nombre || session?.user?.email?.split('@')[0]) || "Invitado";
      const saldoPrincipal = getSaldosAislados(nombreUsuario); 
      const patrimonioTotal = getPatrimonioNeto();

      return (
        <div className="space-y-6">
          
          
        {/* HEADER PRINCIPAL (PATRIMONIO O VACA) */}
          {espacioActivo?.tipo === 'vaca' ? (
            <div className="mt-2 mb-4">
               {potes.length === 0 ? (
                 <div className="bg-emerald-500/10 border border-emerald-500/30 p-10 rounded-[2.5rem] text-center animate-in zoom-in-95">
                   <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                   <h3 className="text-xl font-black text-white mb-2">Define tu Vaca</h3>
                   <p className="text-sm text-white/50 mb-8">¿Cuánto dinero necesitan reunir?</p>
                   <button onClick={() => { setPoteForm({ id: null, tipo: "Personalizado ✍️", nombreCustom: "", monto_objetivo: "" }); setIsAddingPote(true); }} className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl active:scale-95 transition-all">ESTABLECER META</button>
                 </div>
               ) : (
                 <div onClick={() => setIsBalanceModalOpen(true)} className={`bg-[#1a0f2e] border-2 border-emerald-500/30 p-5 md:p-6 rounded-[2rem] shadow-[0_0_15px_rgba(16,185,129,0.1)] relative overflow-hidden group hover:border-emerald-500/60 transition-colors cursor-pointer`}>
                    {(() => {
                      const ahorrado = getPoteAhorrado(potes[0].id, potes[0].nombre);
                      const porcentaje = Math.min((ahorrado / potes[0].monto_objetivo) * 100, 100);
                      const faltante = Math.max(potes[0].monto_objetivo - ahorrado, 0);

                      return (
                        <div className="relative z-10">
                          {porcentaje >= 100 && (
                            <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-4 rounded-xl">
                              <span className="text-3xl mb-1">🎉</span>
                              <h3 className="text-white font-black text-lg">¡Vaca Completada!</h3>
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                                {potes[0].nombre} 
                                <span className={`text-emerald-400 text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20`}>META: ${potes[0].monto_objetivo} USDT</span>
                              </h2>
                              <p className={`text-xs text-white/50 mt-1`}>Faltan $<AnimatedNum value={faltante} /> USD</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`text-sm md:text-base font-black text-emerald-400`}><AnimatedNum value={porcentaje} format="pct"/></span>
                            </div>
                          </div>
                          
                          <div className={`h-3 w-full bg-black/60 rounded-full border border-white/5 p-0.5 mt-2`}>
                            <div className={`h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]`} style={{ width: `${porcentaje}%`, transition: 'width 1s ease-in-out' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // <-- IMPORTANTE: Evita que se abra el modal al tocar el botón
                                  setTipo("ingreso"); 
                                  setCategoria("abono_pote"); 
                                  setDestinoTransferencia(potes[0].id); 
                                  const trigger = document.getElementById('nuevo-registro-trigger'); 
                                  if (trigger) trigger.click(); 
                                }} 
                                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center rounded-full shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                              >
                                <Plus size={20} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // <-- IMPORTANTE: Evita que se abra el modal
                                  eliminarPote(potes[0].id);
                                }} 
                                className="w-10 h-10 bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-500 flex items-center justify-center rounded-full border border-white/5 transition-colors"
                              >
                                <Trash2 size={18}/>
                              </button>
                            </div>
                            <p className="text-[9px] text-white/30 uppercase flex items-center gap-1">Ver aportes <ArrowDownCircle size={10}/></p>
                          </div>
                        </div>
                      );
                    })()}
                 </div>
               )}
            </div>
        ) : (
            <div className="mt-2 mb-4">
                 <div onClick={() => setIsBalanceModalOpen(true)} className="cursor-pointer flex flex-col items-center justify-center p-8 bg-[#1C1C1E] rounded-[2rem] transition-transform active:scale-95 border border-white/5">
                   <p className="text-[11px] text-white/50 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                     <Globe className="w-4 h-4"/> {espacioActivo?.tipo === 'individual' ? 'Patrimonio Neto Total' : 'Balance Global'}
                   </p>
                   
{/* Texto blanco sólido, sin gradientes */}
                   <p className="text-5xl font-bold text-white tabular-nums font-sans tracking-tight leading-none mb-5">
                     $<AnimatedNum 
                         value={patrimonioRate === 'paralelo' ? getPatrimonioNeto().paralelo : getPatrimonioNeto().bcv} 
                         format="usd" 
                       />
                   </p>

                   {/* Selector Plano con acento Verde Fintech */}
                   <div className="flex bg-[#121212] p-1 rounded-xl w-max mb-5 border border-white/5" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => setPatrimonioRate('paralelo')} className={`px-5 py-2 text-[10px] font-bold rounded-lg transition-colors ${patrimonioRate === 'paralelo' ? 'bg-[#10B981] text-white' : 'text-white/40 hover:text-white/80'}`}>PARALELO</button>
                     <button onClick={() => setPatrimonioRate('bcv')} className={`px-5 py-2 text-[10px] font-bold rounded-lg transition-colors ${patrimonioRate === 'bcv' ? 'bg-[#10B981] text-white' : 'text-white/40 hover:text-white/80'}`}>BCV OFICIAL</button>
                   </div>

                   <div className="flex gap-3 mt-2">
                       <p className="text-[10px] text-white/40 font-medium bg-[#121212] px-3 py-2 rounded-lg border border-white/5">
                         Tasa BCV: Bs. {rates.bcv.toFixed(2)}
                       </p>
                       <p className="text-[10px] text-white/40 font-medium bg-[#121212] px-3 py-2 rounded-lg border border-white/5">
                         Paralelo: Bs. {rates.usdt.toFixed(2)}
                       </p>
                   </div>
                   
                   <p className="text-[9px] text-white/30 uppercase mt-5 flex items-center gap-1">
                     <ArrowDownCircle size={10}/> Toque para ver detalle
                   </p>
                 </div>
              </div>
          )}

          <Drawer.Root open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[55vh] mt-24 fixed bottom-0 left-0 right-0 z-[250] border-t border-purple-500">
                <Drawer.Title className="sr-only">Detalle de Liquidez</Drawer.Title>
                <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <h3 className="text-xl font-black text-white mb-6 text-center">Detalle de Liquidez</h3>
                  
                  {espacioActivo?.tipo === 'individual' ? (
                    // VISTA PARA TU BILLETERA INDIVIDUAL (Mantiene el detalle por moneda)
                    <div className="space-y-3">
                      <div className="bg-[#1a1a1a] p-4 rounded-2xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><DollarSign className="text-purple-400 w-5 h-5"/></div>
                          <div><p className="text-sm font-bold text-white">Dólares Digitales</p><p className="text-[10px] text-white/40 uppercase">Zinli, Binance, etc.</p></div>
                        </div>
                        <p className="text-xl font-black text-white font-sans">${saldoPrincipal.usdt.toFixed(2)}</p>
                      </div>

                      <div className="bg-[#1a1a1a] p-4 rounded-2xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><Wallet className="text-blue-400 w-5 h-5"/></div>
                          <div><p className="text-sm font-bold text-white">Bolívares</p><p className="text-[10px] text-white/40 uppercase">Pago Móvil, Bancos</p></div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white font-sans">Bs. {saldoPrincipal.bs.toFixed(2)}</p>
                          <p className="text-[10px] text-blue-400 font-bold">Eqv: ${(rates.bcv > 0 ? saldoPrincipal.bs / rates.bcv : 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="bg-[#1a1a1a] p-4 rounded-2xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center"><CheckSquare className="text-amber-400 w-5 h-5"/></div>
                          <div><p className="text-sm font-bold text-white">Efectivo</p><p className="text-[10px] text-white/40 uppercase">Cash Físico</p></div>
                        </div>
                        <p className="text-xl font-black text-white font-sans">${saldoPrincipal.cash.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    // VISTA PARA POTES Y VACAS (Detalle por participante con el diseño de filas)
                    <div className="space-y-3">
                      {/* 1. FILA DEL PATRIMONIO GLOBAL */}
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

                      {/* 2. FILAS DE LOS INTEGRANTES */}
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

          {/* LIQUIDEZ INDIVIDUAL (SOLO EN BILLETERA) */}
          {espacioActivo?.tipo === 'individual' && (
            <div className="mb-6">
              <div className={`bg-[#1a1a1a] border border-[#333] p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/80 font-bold text-sm">Tu Liquidez ({activeWallet.toUpperCase()})</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Dinero real y disponible para gastar hoy.</p>
                    </div>
                    <Wallet className="w-6 h-6 text-white/30" />
                 </div>
                 
                 <div className="mb-6">
                    {activeWallet === 'usdt' && (
                       <div className="animate-in fade-in">
                         <p className="text-5xl font-black text-white tracking-tight tabular-nums font-sans">
                           $<AnimatedNum value={saldoPrincipal.usdt} format="usd" />
                         </p>
                         <p className="text-emerald-400 text-xs font-bold mt-2">
                           Eqv: Bs. <AnimatedNum value={saldoPrincipal.usdt * rates.usdt} format="bs" /> (Paralelo)
                         </p>
                       </div>
                    )}
                    {activeWallet === 'bs' && (
                       <div className="animate-in fade-in">
                         <p className="text-5xl font-black text-white tracking-tight tabular-nums font-sans">
                           Bs. <AnimatedNum value={saldoPrincipal.bs} format="bs" />
                         </p>
                         <p className="text-blue-400 text-xs font-bold mt-2">
                           Eqv: $<AnimatedNum value={rates.bcv > 0 ? saldoPrincipal.bs / rates.bcv : 0} format="usd" /> (Tasa BCV)
                         </p>
                       </div>
                    )}
                    {activeWallet === 'cash' && (
                       <div className="animate-in fade-in">
                         <p className="text-5xl font-black text-white tracking-tight tabular-nums font-sans">
                           $<AnimatedNum value={saldoPrincipal.cash} format="usd" />
                         </p>
                         <p className="text-amber-400 text-xs font-bold mt-2 uppercase">Monto Físico Exacto</p>
                       </div>
                    )}
                 </div>

                 <div className="flex bg-black/40 p-1 rounded-xl w-max border border-white/5 shadow-inner">
                   <button onClick={() => setActiveWallet('usdt')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'usdt' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>USDT</button>
                   <button onClick={() => setActiveWallet('bs')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'bs' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>BS</button>
                   <button onClick={() => setActiveWallet('cash')} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${activeWallet === 'cash' ? `${theme.primary} text-white shadow-md` : 'text-white/40 hover:text-white/80'}`}>CASH</button>
                 </div>
              </div>
            </div>
          )}

          {/* MIS POTES (NO SE MUESTRA EN VACA) */}
          {espacioActivo?.tipo !== 'vaca' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className={`text-base font-black ${theme.text} uppercase tracking-widest flex items-center gap-2`}>
                  <img src="/pote.png" alt="pote" className="w-6 h-6 object-contain drop-shadow-md" /> Mis Potes
                </h2>
              </div>

{potes.map(pote => {
                const ahorrado = getPoteAhorrado(pote.id, pote.nombre);
                const porcentaje = Math.min((ahorrado / pote.monto_objetivo) * 100, 100);
                
                return (
                  <div key={pote.id} className="bg-[#1C1C1E] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group transition-colors">
                    
                    {/* Pantalla de éxito cuando se llega al 100% */}
                    {porcentaje >= 100 && (
                      <div className="absolute inset-0 bg-[#10B981]/95 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-4">
                        <span className="text-3xl mb-1">🎉</span>
                        <h3 className="text-white font-black text-lg">¡Meta Alcanzada!</h3>
                        <p className="text-white/90 text-[10px] mb-3 font-bold">Lograron ahorrar ${pote.monto_objetivo}.</p>
                        <button onClick={() => eliminarPote(pote.id)} className="bg-[#121212] text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-transform">Finalizar y Eliminar</button>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {pote.nombre} 
                            <span className="text-[#10B981] text-[9px] bg-[#10B981]/10 px-2 py-0.5 rounded-lg border border-[#10B981]/20 font-bold uppercase tracking-widest">
                              META: ${pote.monto_objetivo}
                            </span>
                          </h2>
                          <p className="text-xs text-white/50 mt-1">Faltan $<AnimatedNum value={Math.max(pote.monto_objetivo - ahorrado, 0)} /> USD</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-base font-black text-[#10B981]"><AnimatedNum value={porcentaje} format="pct"/></span>
                        </div>
                      </div>

                      {/* BARRA DE PROGRESO (Plana y Fintech, sin neón) */}
                      <div className="h-3 w-full bg-[#121212] rounded-full border border-white/5 overflow-hidden mt-3">
                        <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${porcentaje}%` }}></div>
                      </div>
                      
                      <div className="flex gap-2 mt-5">
                        {porcentaje < 100 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              setTipo("ingreso"); 
                              setCategoria("abono_pote"); 
                              setDestinoTransferencia(pote.id); 
                              const trigger = document.getElementById('nuevo-registro-trigger'); 
                              if (trigger) trigger.click(); 
                            }} 
                            className="w-11 h-11 bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center rounded-2xl active:scale-95 transition-all"
                          >
                            <Plus size={20} strokeWidth={3} />
                          </button>
                        )}
                        <button 
                          onClick={() => eliminarPote(pote.id)} 
                          className="w-11 h-11 bg-[#121212] hover:bg-rose-500/20 text-white/30 hover:text-rose-500 flex items-center justify-center rounded-2xl border border-white/5 transition-colors"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}

 {/* === TARJETAS DE ACCESO RÁPIDO === */}
          <div className="mb-8 mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* BOTÓN 1: ESCÁNER IA 📸 */}
            <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className={`h-[110px] bg-[#1C1C1E] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#2C2C2E] active:scale-95 group relative ${isScanning ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isScanning ? (
                    <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20 group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6 text-[#10B981]" />
                        </div>
                        <span className="text-white font-bold text-xs uppercase tracking-wider">Escanear Factura</span>
                        <span className="text-[9px] text-white/40 -mt-1 font-medium">Usa la IA para registrar rápido</span>
                    </>
                )}
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleScanInvoice} className="hidden" />
            </button>

            {/* BOTÓN 2: SIMULADOR (Azul) */}
            <button onClick={() => { onChangeView('calculadora-libre'); setActiveTab('calculadora'); }} className="h-[110px] bg-[#1C1C1E] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#2C2C2E] active:scale-95 group">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center leading-tight">Simulador<br/>de Compras</span>
            </button>

            {/* BOTÓN 3: NUEVA META (Fucsia) */}
            {espacioActivo?.tipo !== 'vaca' && (
              <button onClick={() => { setPoteForm({ id: null, tipo: POTE_OPCIONES[0], nombreCustom: "", monto_objetivo: "" }); setIsAddingPote(true); }} className="h-[110px] bg-[#1C1C1E] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#2C2C2E] active:scale-95 group">
                <div className="w-12 h-12 rounded-full bg-[#C026D3]/10 flex items-center justify-center border border-[#C026D3]/20 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-[#C026D3]" />
                </div>
                <span className="text-white font-bold text-xs uppercase tracking-wider">Nueva Meta</span>
              </button>
            )}
          </div>

          {/* === DRAWER DEL CAMBIO P2P === */}
          <Drawer.Root open={isP2POpen} onOpenChange={setIsP2POpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-amber-500">
                <Drawer.Title className="sr-only">Cambio P2P</Drawer.Title>
                <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <div className="flex justify-center mb-4">
                     <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center"><ArrowLeftRight className="text-amber-400 w-6 h-6"/></div>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 text-center">Cambio de Divisas</h3>
                  <p className="text-xs text-white/50 text-center mb-6">Actualiza tu liquidez sin afectar tu presupuesto mensual.</p>
                  
                  <form onSubmit={realizarCambioP2P} className="flex flex-col gap-5">
                    
                    {/* Selectores de Moneda */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Entregas</label>
                        <select value={p2pForm.monedaDe} onChange={(e) => setP2pForm({...p2pForm, monedaDe: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-amber-500">
                          <option value="usdt">USDT</option>
                          <option value="bs">Bolívares (BS)</option>
                        </select>
                      </div>
                      <div className="pt-6"><ArrowLeftRight className="text-white/20 w-5 h-5"/></div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Recibes</label>
                        <select value={p2pForm.monedaPara} onChange={(e) => setP2pForm({...p2pForm, monedaPara: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-amber-500">
                          <option value="bs">Bolívares (BS)</option>
                          <option value="usdt">USDT</option>
                        </select>
                      </div>
                    </div>

                    {/* Inputs de Monto y Tasa */}
                    <div className="flex gap-3">
                      <div className="flex-[2]">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto a cambiar</label>
                        <input type="number" step="0.01" placeholder="0.00" value={p2pForm.monto} onChange={(e) => setP2pForm({...p2pForm, monto: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-2xl font-black text-white font-sans tabular-nums outline-none focus:border-amber-500" required />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Tasa Pactada</label>
                        <input type="number" step="0.001" placeholder="0.00" value={p2pForm.tasa} onChange={(e) => setP2pForm({...p2pForm, tasa: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-base font-bold text-white font-sans tabular-nums outline-none focus:border-amber-500" required />
                      </div>
                    </div>

                    {/* Selector de Usuario para P2P */}
                    <div>
                      <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Responsable del Cambio</label>
                      <select required value={p2pForm.usuario} onChange={e => setP2pForm({...p2pForm, usuario: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-amber-500 appearance-none">
                        <option value="">Selecciona quién hizo el cambio...</option>
                        {espacioActivo?.tipo === 'individual' ? <option value={(perfil?.nombre || session?.user?.email?.split('@')[0]) || "Tú"}>Tú</option> : participantes.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                    </div>

                    {/* Calculadora visual de resultado */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mt-2 flex flex-col items-center justify-center">
                       <p className="text-[10px] uppercase text-amber-500/80 font-bold tracking-widest mb-1">Total a recibir en {p2pForm.monedaPara.toUpperCase()}</p>
                       <p className="text-3xl font-black text-amber-400 font-sans tabular-nums">
                         {p2pForm.monedaPara === 'bs' ? 'Bs. ' : '$'}
                         {p2pForm.monto && p2pForm.tasa ? 
                            (p2pForm.monedaDe === 'usdt' && p2pForm.monedaPara === 'bs' ? (parseFloat(p2pForm.monto) * parseFloat(p2pForm.tasa)).toLocaleString('es-VE', {minimumFractionDigits: 2}) : 
                             p2pForm.monedaDe === 'bs' && p2pForm.monedaPara === 'usdt' ? (parseFloat(p2pForm.monto) / parseFloat(p2pForm.tasa)).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'
                            ) : '0.00'
                         }
                       </p>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-5 rounded-3xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] mt-4 active:scale-95 transition-transform">Confirmar P2P</button>
                  </form>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* === DRAWER DE AÑADIR MIEMBRO === */}
          <Drawer.Root open={isManageUsersOpen} onOpenChange={setIsManageUsersOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-white/5">
                <Drawer.Title className="sr-only">Añadir Miembro</Drawer.Title>
                <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <h3 className="text-xl font-black text-white mb-6 text-center">Añadir Miembro</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {participantes.length === 0 ? (
                      <p className="text-xs text-white/20 italic text-center w-full">No hay miembros agregados...</p>
                    ) : (
                      participantes.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/5 bg-[#1a1a1a] text-white group hover:border-rose-500/50 transition-colors">
                          {p.nombre}
                          <button onClick={() => eliminarParticipante(p.id, p.nombre)} className="text-white/20 hover:text-rose-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nombre del integrante..." value={nuevoPart} onChange={(e) => setNuevoPart(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregarParticipante()} className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#A855F7] transition-all" />
                    <button onClick={agregarParticipante} className={`p-4 rounded-xl ${theme.primary} text-white shadow-lg active:scale-95 transition-all`}>
                      <UserPlus size={20} />
                    </button>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* === DRAWER DE NUEVA META (POTE) === */}
          <Drawer.Root open={isAddingPote} onOpenChange={setIsAddingPote}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-[#10b981]">
                <Drawer.Title className="sr-only">Registrar Nueva Meta</Drawer.Title>
                <div className="p-6 bg-[#121212] rounded-t-[32px] flex-1 overflow-y-auto pb-20">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
                  <h3 className="text-xl font-black text-white mb-6 text-center">Registrar Nueva Meta</h3>
                  <form onSubmit={guardarPote} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">¿Para qué estamos ahorrando?</label>
                        <select value={poteForm.tipo} onChange={(e) => setPoteForm({...poteForm, tipo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none cursor-pointer appearance-none focus:border-emerald-500">
                          {POTE_OPCIONES.map(opt => <option key={opt} value={opt} className="bg-[#121212]">{opt}</option>)}
                        </select>
                      </div>
                      {poteForm.tipo === "Personalizado ✍️" && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                           <input type="text" placeholder="Ej: Viaje a Margarita" value={poteForm.nombreCustom} onChange={(e) => setPoteForm({...poteForm, nombreCustom: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-emerald-500" required />
                        </div>
                      )}
                      <div className="min-h-[80px]">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-widest block mb-2">Monto Objetivo ($)</label>
                        <input type="number" step="0.01" placeholder="0.00" value={poteForm.monto_objetivo} onChange={(e) => setPoteForm({...poteForm, monto_objetivo: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-3xl font-black text-white font-sans tabular-nums tracking-tight outline-none focus:border-emerald-500" required />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest py-5 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 active:scale-95 transition-transform">Guardar Meta</button>
                  </form>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
          
                    {/* CÓDIGO DE INVITACIÓN MOVIDO AL FINAL (DISCRETO) */}
          {espacioActivo?.tipo !== 'individual' && espacioActivo?.codigo_invitacion && (
             <div className="bg-transparent border border-fuchsia-500/10 p-4 rounded-3xl mb-6 flex flex-row items-center justify-between gap-4 mt-8">
                <div className="flex-1">
                  <p className="text-[9px] text-fuchsia-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                     <Key className="w-3 h-3"/> Código del Espacio
                  </p>
                  <p className="text-[10px] text-white/40">Comparte para añadir miembros.</p>
                </div>
                <button onClick={() => {navigator.clipboard.writeText(espacioActivo.codigo_invitacion); alert("Código copiado al portapapeles");}} className="bg-[#1a0f2e] border border-white/5 py-2 px-4 rounded-xl text-sm text-white font-black tracking-[0.2em] transition-colors flex items-center justify-center gap-2 font-sans tabular-nums cursor-pointer hover:bg-white/5 active:scale-95">
                  {espacioActivo.codigo_invitacion} <Copy className="w-3 h-3 text-white/30 ml-1"/>
                </button>
             </div>
          )}

          {espacioActivo?.tipo === 'individual' && !isGuest && (
             <div className="bg-transparent border border-white/5 p-4 rounded-3xl mb-6 flex flex-row items-center justify-between gap-4 mt-8">
                <div className="flex-1">
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                     <Users className="w-3 h-3"/> ¿Tienes un código?
                  </p>
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
                   <form onSubmit={guardarNombreEspacio} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <input type="text" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} className="bg-black/50 border border-purple-500/50 rounded px-2 py-1 outline-none text-sm w-32" autoFocus />
                     <button type="submit" className="bg-emerald-500 text-black p-1 rounded"><Check size={14}/></button>
                     <button type="button" onClick={() => setIsEditingSpaceName(false)} className="bg-rose-500 text-black p-1 rounded"><X size={14}/></button>
                   </form>
                 ) : (
                   <>
                     {espacioActivo?.nombre || "Mi Billetera"} 
                     <ChevronDown className="w-5 h-5 text-white/40" />
                   </>
                 )}
             </div>
             <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] uppercase tracking-widest ${theme.text} ${theme.lightBg} px-2 py-0.5 rounded-md font-bold`}>{espacioActivo?.tipo || "Individual"}</span>
             </div>
          </div>
        </div>
        
        {/* LADO DERECHO: TASAS DE USD Y EUR */}
        <div className="text-right flex flex-col items-end">
          <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-1">
            BCV <button onClick={fetchRates} disabled={syncing}><RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`}/></button>
          </p>
          <p className="text-xs font-black text-white tabular-nums mt-0.5">
            <span className="text-emerald-400">$</span> {rates.bcv.toFixed(2)} <span className="text-white/20 mx-1">|</span> <span className="text-blue-400">€</span> {rates.eur_bcv.toFixed(2)}
          </p>
          
          <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mt-1.5">
            Paralelo
          </p>
          <p className="text-xs font-black text-white tabular-nums mt-0.5">
            <span className="text-emerald-400">$</span> {rates.usdt.toFixed(2)} <span className="text-white/20 mx-1">|</span> <span className="text-blue-400">€</span> {rates.eur_paralelo.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* DRAWER DE PERFIL Y CONFIGURACIÓN */}
      <Drawer.Root open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
          <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] h-auto fixed bottom-0 left-0 right-0 z-[250] border-t border-white/10 pb-8">
            <Drawer.Title className="sr-only">Perfil y Configuración</Drawer.Title>
            <div className="p-6">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#333] mb-6" />
              <div className="flex items-center gap-4 mb-8 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <UserPlus className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold">{perfil?.nombre || session?.user?.email?.split('@')[0] || "Invitado"}</p>
                  <p className="text-[10px] text-white/50">{session?.user?.email || "Modo de prueba"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {!isGuest && (
                  <>
                    <button onClick={() => { setIsProfileMenuOpen(false); openProfileModal(); }} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 text-white font-bold transition-colors">
                      <Edit2 className="w-5 h-5 text-white/50"/> Editar Mi Perfil
                    </button>
                    {espacioActivo?.tipo !== 'individual' && (
                       <button onClick={() => {setNewSpaceName(espacioActivo.nombre); setIsEditingSpaceName(true); setIsProfileMenuOpen(false);}} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 text-white font-bold transition-colors">
                         <Edit3 className="w-5 h-5 text-white/50"/> Renombrar este espacio
                       </button>
                    )}
                  </>
                )}
                <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-colors mt-4">
                  <LogOut className="w-5 h-5"/> Cerrar Sesión
                </button>
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
                {/* BOTÓN CREAR POTE (Activo) */}
                <button 
                  onClick={() => { setIsSpacesMenuOpen(false); onSelectModule('pote', 'NEW'); }} 
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 font-bold text-xs transition-colors active:scale-95"
                >
                  <div className="bg-fuchsia-500/20 p-2 rounded-full">
                    <Plus className="w-5 h-5"/>
                  </div> 
                  Crear Pote
                </button>

                {/* BOTÓN CREAR VACA (Bloqueado - Próximamente) */}
                <button 
                  disabled
                  className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-dashed border-white/10 text-white/30 bg-white/5 font-bold text-xs cursor-not-allowed"
                >
                  <div className="bg-white/5 p-2 rounded-full mb-0.5">
                    <Lock className="w-4 h-4 opacity-50"/>
                  </div> 
                  La Vaca
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md tracking-widest uppercase">
                    Próximamente
                  </span>
                </button>
              </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      
      {renderTabContent()}

      <nav className={`fixed bottom-0 left-0 right-0 bg-[#1a0f2e]/90 backdrop-blur-xl border-t ${theme.border} p-3 md:hidden z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        <div className="flex justify-around items-center max-w-md mx-auto">
          <NavButton icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => { onChangeView('dashboard'); setActiveTab('inicio'); }} theme={theme} />
          <NavButton icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('pagos'); } }} theme={theme} />
          
          <div className="relative -top-5">
            {/* Botón Central sin sombra brillante */}
            <button onClick={() => setIsSpacesMenuOpen(true)} className="bg-[#2563EB] text-white p-4 rounded-full active:scale-95 transition-transform border-4 border-[#0d0714]">
               <Layers className="w-6 h-6" />
            </button>
          </div>

          {espacioActivo?.tipo !== 'individual' && (
            <NavButton icon={<ListTodo />} label="Tareas" active={activeTab === 'recordatorios'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('recordatorios'); } }} theme={theme} />
          )}

          {espacioActivo?.tipo !== 'vaca' && (
            <NavButton icon={<Shield />} label="Reserva" active={activeTab === 'emergencia'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('emergencia'); } }} theme={theme} />
          )}
        </div>
      </nav>

      <nav className="hidden md:flex justify-center mt-8 space-x-4">
        <NavButtonDesktop icon={<Home />} label="Inicio" active={activeTab === 'inicio'} onClick={() => { onChangeView('dashboard'); setActiveTab('inicio'); }} theme={theme} />
        <NavButtonDesktop icon={<CreditCard />} label="Presupuesto" active={activeTab === 'pagos'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('pagos'); } }} theme={theme} />
        <NavButtonDesktop icon={<Layers />} label="Cambiar Espacio" active={false} onClick={() => setIsSpacesMenuOpen(true)} theme={{primary: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500/30'}} />
        {espacioActivo?.tipo !== 'individual' && (
          <NavButtonDesktop icon={<ListTodo />} label="Tareas" active={activeTab === 'recordatorios'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('recordatorios'); } }} theme={theme} />
        )}
        {espacioActivo?.tipo !== 'vaca' && (
          <NavButtonDesktop icon={<Shield />} label="Por si acaso" active={activeTab === 'emergencia'} onClick={() => { if(isGuest) onTriggerPaywall?.(); else { onChangeView('dashboard'); setActiveTab('emergencia'); } }} theme={theme} />
        )}
      </nav>

{/* === BOTÓN FLOTANTE (FAB) + MENÚ RÁPIDO === */}
      {activeTab === 'inicio' && (
        <>
          <Drawer.Root open={isFABMenuOpen} onOpenChange={setIsFABMenuOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/70 z-[90] backdrop-blur-sm" />
              
              <Drawer.Content className="bg-[#121212] flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 shadow-2xl max-h-[85vh]">
                
                {/* Etiquetas para silenciar advertencias de accesibilidad de la consola */}
                <Drawer.Title className="sr-only">Menú de Acciones Rápidas</Drawer.Title>
                <Drawer.Description className="sr-only">Opciones para registrar ingresos, egresos y p2p</Drawer.Description>

                <div className="p-6 md:p-8 bg-[#1C1C1E] rounded-t-[32px] flex-1 overflow-y-auto pb-12 border border-white/5">
                  <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-[#333] mb-8" />
                  
                  <h3 className="text-xl font-black text-white mb-8 text-center">Registrar Actividad</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* OPCIÓN 1: ESCANEAR FACTURA */}
                    <label className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20 cursor-pointer transition-all hover:bg-blue-600/20 text-center">
                      <Camera className="w-8 h-8 text-blue-500" />
                      <span className="text-[11px] font-bold text-blue-100 uppercase tracking-widest">Escanear</span>
                      <input 
  type="file" 
  accept="image/*" 
  onChange={(e) => { setIsFABMenuOpen(false); handleScanInvoice(e); }} 
  className="hidden" 
  disabled={isScanning} 
/>
                    </label>

                    {/* OPCIÓN 2: REGISTRO MANUAL (Ahora solo da un clic al gatillo fantasma) */}
                    <button onClick={() => { setIsFABMenuOpen(false); setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 150); }} className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] text-center">
                      <Plus className="w-8 h-8 text-white/70" />
                      <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Manual</span>
                    </button>

                    {/* OPCIÓN 3: CAMBIO P2P */}
                    <button onClick={() => { setIsFABMenuOpen(false); setIsP2POpen(true); }} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] text-center">
                      <ArrowLeftRight className="w-8 h-8 text-white/70" />
                      <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Cambio P2P</span>
                    </button>

                    {/* OPCIÓN 4: DINÁMICA (AÑADIR MIEMBRO O ABONO META) */}
                    {espacioActivo?.tipo !== 'individual' ? (
                      <button onClick={() => { setIsFABMenuOpen(false); setIsManageUsersOpen(true); }} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] text-center">
                        <UserPlus className="w-8 h-8 text-white/70" />
                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Miembro</span>
                      </button>
                    ) : (
                      <button onClick={() => { setIsFABMenuOpen(false); setTipo("ingreso"); setCategoria("abono_pote"); setTimeout(() => document.getElementById('nuevo-registro-trigger')?.click(), 150); }} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#2C2C2E] rounded-2xl border border-white/5 transition-all hover:bg-[#3A3A3C] text-center">
                        <Target className="w-8 h-8 text-white/70" />
                        <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Abono Meta</span>
                      </button>
                    )}

                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* ========================================================= */}
          {/* BOTÓN FLOTANTE MATE BLUE */}
          {/* ========================================================= */}
          <button 
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
            customCategoria={customCategoria} setCustomCategoria={setCustomCategoria} categoriasList={categoriasList}
            monto={monto} setMonto={setMonto} moneda={moneda} setMoneda={setMoneda}
            descripcion={descripcion} setDescripcion={setDescripcion} rates={rates} theme={theme} onSubmit={handleManualSubmit}
            espacios={espacios} espacioActivo={espacioActivo} potes={potes}
            participantes={participantes} usuario={usuario} setUsuario={setUsuario}
            destinoTransferencia={destinoTransferencia} setDestinoTransferencia={setDestinoTransferencia}
          >
            <button id="nuevo-registro-trigger" className="hidden">Gatillo Oculto</button>
          </TransactionDrawer>
        </>
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