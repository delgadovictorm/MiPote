"use client"
import { supabase } from "../../lib/supabase";
import { useState, useMemo, useEffect } from "react";
import {
  Users, Crown, Clock, CheckCircle2, Search,
  ArrowLeft, LogOut, ShieldCheck, TrendingUp, RefreshCw, MessageCircle,
  ChevronRight, XCircle, X, Copy
} from "lucide-react";

export default function MiPoteAdmin() {
  // =========================================================================
  // --- 🔐 SEGURIDAD Y SESIÓN ---
  // =========================================================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // Correos autorizados para gestionar MiPote.ve
  const ADMIN_EMAILS = [
    'dmvictorbalboa@gmail.com', 
    'mreynasinkstillo@gmail.com'
  ];

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && ADMIN_EMAILS.includes(session.user.email || "")) {
        setIsLoggedIn(true);
        setAdminId(session.user.id);
        traerTodo();
      }
      setLoadingAuth(false);
    };
    comprobarSesion();
  }, []);

  // Auto-actualiza los datos mientras el admin esté logueado, para ver pagos nuevos sin recargar.
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(traerTodo, 20000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setLoginError(true);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(true);
    } else {
      setIsLoggedIn(true);
      if (data.session) setAdminId(data.session.user.id);
      traerTodo();
    }
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setIsLoggedIn(false); 
    setAdminId(null); 
  };

  // =========================================================================
  // --- 📡 DATOS Y GESTIÓN (SUPABASE) ---
  // =========================================================================
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [pestana, setPestana] = useState("inicio");
  const [busqueda, setBusqueda] = useState("");
  const [filtroSuscripciones, setFiltroSuscripciones] = useState("Pendientes");
  const [cargandoDatos, setCargandoData] = useState(false);
  const [detalleUsuario, setDetalleUsuario] = useState<any>(null);

  const traerTodo = async () => {
    setCargandoData(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, email, telefono, estado_pago, is_pro, es_prueba, vence_el, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error al traer perfiles:", error.message);
    }
    
    if (data) {
      // 🛠️ GENERACIÓN DEL NÚMERO DE PEDIDO ÚNICO
      const dataConOrdenes = data.map(u => ({
        ...u,
        ordenNumero: (200000 + (parseInt(u.id.substring(0, 4), 16) % 90000)).toString()
      }));
      setUsuarios(dataConOrdenes);
    }
    setCargandoData(false);
  };

  const aprobarSuscripcion = async (id: string) => {
    if (!confirm("¿Confirmas que el pago es válido? Se activarán 30 días PRO.")) return;
    const v = new Date();
    v.setDate(v.getDate() + 30);

    const { error } = await supabase
      .from('perfiles')
      .update({ is_pro: true, estado_pago: 'pro', es_prueba: false, vence_el: v.toISOString() })
      .eq('id', id);

    if (!error) traerTodo();
  };

  const activarPrueba = async (id: string) => {
    if (!confirm("¿Activar 30 días PRO de cortesía (prueba)? No se contará como ingreso.")) return;
    const v = new Date();
    v.setDate(v.getDate() + 30);

    const { error } = await supabase
      .from('perfiles')
      .update({ is_pro: true, estado_pago: 'pro', es_prueba: true, vence_el: v.toISOString() })
      .eq('id', id);

    if (!error) traerTodo();
  };

  const anularSuscripcion = async (id: string) => {
    if (!confirm("¿Anular acceso PRO y pasar a inactivo?")) return;
    const { error } = await supabase
      .from('perfiles')
      .update({ is_pro: false, estado_pago: 'gratis', es_prueba: false, vence_el: null })
      .eq('id', id);

    if (!error) traerTodo();
  };

  // Convierte un teléfono venezolano local (04121234567) al formato internacional que espera wa.me (584121234567)
  const formatearTelefonoWa = (telefono?: string) => {
    if (!telefono) return null;
    const digitos = telefono.replace(/\D/g, '');
    if (!digitos) return null;
    if (digitos.startsWith('58')) return digitos;
    if (digitos.startsWith('0')) return `58${digitos.slice(1)}`;
    return `58${digitos}`;
  };

  const contactarWhatsApp = (u: any) => {
    const dias = u.vence_el ? Math.ceil((new Date(u.vence_el).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const estaVencido = dias < 0;

    let mensaje = `¡Hola! Te escribo de *MiPote.ve* 🍯\nReferente a tu cuenta (${u.email || 'Cliente'}) - Orden #${u.ordenNumero}.\n\n`;
    if (u.estado_pago === 'pendiente') {
      mensaje += "Estamos verificando tu pago, en breve activamos tu acceso PRO. ¡Gracias por tu paciencia! 🙏";
    } else if (u.is_pro && !estaVencido && u.es_prueba) {
      mensaje += `¡Ya activamos tu *prueba gratuita PRO*! Tienes acceso hasta el ${new Date(u.vence_el).toLocaleDateString()}. Cualquier duda, aquí estamos. 🚀`;
    } else if (u.is_pro && !estaVencido) {
      mensaje += `¡Tu suscripción *PRO ya está activa*! ✅ Vence el ${new Date(u.vence_el).toLocaleDateString()}. ¡Gracias por confiar en nosotros! 🎉`;
    } else {
      mensaje += "Notamos que tu acceso PRO no está activo. Si ya realizaste el pago cuéntanos para verificarlo. 😊";
    }

    const numero = formatearTelefonoWa(u.telefono);
    const url = numero
      ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const kpis = useMemo(() => {
    return {
      total: usuarios.length,
      pros: usuarios.filter(u => u.is_pro).length,
      pruebas: usuarios.filter(u => u.is_pro && u.es_prueba).length,
      pagantes: usuarios.filter(u => u.is_pro && !u.es_prueba).length,
      pendientes: usuarios.filter(u => u.estado_pago === 'pendiente').length,
    };
  }, [usuarios]);

  // Filtro Inteligente para la pestaña Suscripciones
  const suscripcionesFiltradas = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusqueda = (u.email || "").toLowerCase().includes(busqueda.toLowerCase()) || (u.ordenNumero || "").includes(busqueda);
      const matchFiltro = 
        filtroSuscripciones === "Todas" ? true :
        filtroSuscripciones === "Pendientes" ? u.estado_pago === 'pendiente' :
        filtroSuscripciones === "Activas" ? u.is_pro === true && u.es_prueba !== true :
        filtroSuscripciones === "Prueba" ? u.is_pro === true && u.es_prueba === true :
        filtroSuscripciones === "Inactivas" ? u.is_pro === false && u.estado_pago !== 'pendiente' : true;
      
      return matchBusqueda && matchFiltro;
    });
  }, [usuarios, busqueda, filtroSuscripciones]);

  // Filtro para CRM
  const usuariosCrmFiltrados = useMemo(() => {
    return usuarios.filter(u => (u.email || u.id).toLowerCase().includes(busqueda.toLowerCase()));
  }, [usuarios, busqueda]);

  // =========================================================================
  // --- 🎨 INTERFAZ ---
  // =========================================================================
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0714] flex justify-center items-center text-purple-500 font-black animate-pulse text-4xl italic">
        P
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0714] flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-[#1a0f2e] border border-white/5 p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl text-center">
          <ShieldCheck className="text-purple-500 mx-auto mb-6" size={56} />
          <h1 className="text-2xl md:text-[28px] font-black text-white italic uppercase tracking-tight">Admin Pote</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
            {loginError && <p className="text-rose-500 text-[10px] font-black uppercase">Acceso Denegado</p>}
            <button type="submit" className="w-full bg-purple-600 text-white font-black py-4 rounded-xl uppercase italic shadow-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0714] text-white font-sans flex flex-col md:flex-row">
      
      {/* 📱💻 NAVBAR/SIDEBAR ADAPTABLE */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#1a0f2e] flex flex-col p-4 md:p-6 z-10 shadow-2xl sticky top-0 md:h-screen">
        <div className="flex items-center justify-between md:justify-start gap-3 px-2 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <img src="/pote.png" className="w-8 md:w-10" alt="Logo" />
            <span className="font-black text-white text-lg uppercase italic tracking-tight leading-none">
              Mi Pote <br className="hidden md:block"/>
              <span className="text-[10px] text-purple-400 tracking-[0.2em] hidden md:inline">CONTROL</span>
            </span>
          </div>
          {/* Botón rápido de cerrar sesión en móvil */}
          <button onClick={handleLogout} className="md:hidden p-2 text-rose-500 bg-rose-500/10 rounded-lg hover:bg-rose-500/20">
            <LogOut size={18}/>
          </button>
        </div>
        
        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {[
            { id: 'inicio', icono: '📊', t: 'Inicio' },
            { id: 'suscripciones', icono: '💎', t: 'Suscripciones' },
            { id: 'crm', icono: '👥', t: 'Usuarios' },
          ].map(i => (
            <button 
              key={i.id} 
              onClick={() => { setPestana(i.id); setBusqueda(""); }} 
              className={`flex items-center gap-2 md:gap-3 px-4 py-3 md:p-3.5 rounded-xl font-bold transition-all whitespace-nowrap ${pestana === i.id ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
              <span className="text-base md:text-lg">{i.icono}</span> <span className="text-sm md:text-base">{i.t}</span>
            </button>
          ))}
          
          <button onClick={traerTodo} className="md:mt-10 px-4 py-3 md:py-3 bg-white/5 text-white/60 text-[10px] md:text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 whitespace-nowrap">
            <RefreshCw size={14} className={cargandoDatos ? "animate-spin" : ""} /> <span className="hidden md:inline">Actualizar Datos</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="hidden md:flex mt-auto p-4 text-white/30 hover:text-rose-500 font-bold uppercase text-[9px] items-center gap-2">
          <LogOut size={16}/> Cerrar Sesión
        </button>
      </aside>

      {/* 🚀 CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10">
        <h2 className="text-2xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 md:mb-10">
          {pestana === 'inicio' ? 'Control de Mando' : pestana === 'suscripciones' ? 'Gestión de PRO' : 'Base de Datos de Usuarios'}
        </h2>

        {/* 📊 VISTA 1: INICIO (Dashboard) */}
        {pestana === 'inicio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in">
            <div className="bg-[#1a0f2e] border border-white/5 rounded-[24px] md:rounded-[30px] p-6 md:p-8 shadow-xl">
              <p className="text-white/40 font-black text-[10px] uppercase mb-2">Comunidad Total</p>
              <p className="text-3xl md:text-4xl font-black">{kpis.total}</p>
            </div>
            <div className="bg-[#1a0f2e] border border-white/5 rounded-[24px] md:rounded-[30px] p-6 md:p-8 shadow-xl">
              <p className="text-amber-500 font-black text-[10px] uppercase mb-2">Pendientes de Pago</p>
              <p className="text-3xl md:text-4xl font-black text-amber-500">{kpis.pendientes}</p>
            </div>
            <div className="bg-[#0f172a] border border-emerald-500/20 rounded-[24px] md:rounded-[30px] p-6 md:p-8 shadow-2xl sm:col-span-2 md:col-span-1">
              <p className="text-emerald-400 font-black text-[10px] uppercase mb-2">Ingresos Activos</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400">${(kpis.pagantes * 2).toFixed(2)}</p>
              {kpis.pruebas > 0 && (
                <p className="text-white/30 text-[9px] font-bold uppercase mt-2">+{kpis.pruebas} en prueba gratis (no cuentan)</p>
              )}
            </div>
          </div>
        )}

        {/* 💎 VISTA 2: SUSCRIPCIONES */}
        {pestana === 'suscripciones' && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in">
            <div className="flex flex-col gap-4 mb-4">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    placeholder="Buscar por Orden # o Email..." 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                    className="w-full bg-[#1a0f2e] border border-white/5 p-4 pl-12 rounded-xl md:rounded-2xl text-sm font-bold outline-none focus:border-purple-500 transition-colors" 
                  />
               </div>
               <div className="flex gap-2 bg-[#1a0f2e] border border-white/5 p-2 rounded-xl md:rounded-2xl overflow-x-auto scrollbar-hide">
                  {['Pendientes', 'Activas', 'Prueba', 'Inactivas', 'Todas'].map(f => (
                     <button 
                       key={f} 
                       onClick={() => setFiltroSuscripciones(f)} 
                       className={`px-4 md:px-5 py-2 rounded-lg md:rounded-xl text-[10px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filtroSuscripciones === f ? 'bg-purple-600 text-white shadow-md' : 'text-white/30 hover:bg-white/5'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>

            {/* CONTENEDOR DE TABLA CON OVERFLOW (SOLO DESKTOP) */}
            <div className="hidden md:block bg-[#1a0f2e] rounded-[24px] md:rounded-[32px] border border-white/5 shadow-2xl overflow-x-auto">
               <table className="w-full text-left font-bold min-w-[700px]">
                  <thead className="bg-black/20 text-[9px] uppercase text-white/30 border-b border-white/5">
                     <tr>
                       <th className="p-4 md:p-5">Orden #</th>
                       <th className="p-4 md:p-5">Información de la Cuenta</th>
                       <th className="p-4 md:p-5">Estatus</th>
                       <th className="p-4 md:p-5">Vencimiento</th>
                       <th className="p-4 md:p-5 text-center">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {suscripcionesFiltradas.map(u => {
                        const dias = u.vence_el ? Math.ceil((new Date(u.vence_el).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        const estaVencido = dias < 0;
                        const tieneEmail = u.email && u.email.trim() !== "";
                        
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-4 md:p-5 text-purple-400 font-mono text-xs md:text-sm">#{u.ordenNumero}</td>
                             <td className="p-4 md:p-5">
                                <p className="text-white text-xs md:text-sm uppercase italic">
                                  {tieneEmail ? u.email : "⚠️ Sin Sincronizar"}
                                </p>
                                <p className="text-[8px] md:text-[9px] text-white/20 font-mono break-all max-w-[200px]">UID: {u.id}</p>
                             </td>
                             <td className="p-4 md:p-5">
                                <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[9px] uppercase italic font-black border ${
                                  u.estado_pago === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                  u.is_pro && !estaVencido && u.es_prueba ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                  u.is_pro && !estaVencido ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                   {u.estado_pago === 'pendiente' ? 'Verificando' : u.is_pro && !estaVencido && u.es_prueba ? 'Prueba' : u.is_pro && !estaVencido ? 'Activo' : 'Inactivo'}
                                </span>
                             </td>
                             <td className="p-4 md:p-5">
                                {u.vence_el ? (
                                  <div className="flex flex-col">
                                    <span className="text-white/70 font-mono text-[10px] md:text-xs">
                                      <Clock className="inline mb-0.5 mr-1" size={10}/>{new Date(u.vence_el).toLocaleDateString()}
                                    </span>
                                    <span className={`text-[8px] md:text-[9px] font-black uppercase mt-1 ${estaVencido ? 'text-rose-500' : 'text-purple-400'}`}>
                                      {estaVencido ? 'Vencido' : `Quedan ${dias} días`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-white/10 text-[9px] md:text-[10px]">SIN FECHA</span>
                                )}
                             </td>
                             <td className="p-4 md:p-5">
                                <div className="flex justify-center gap-2">
                                   <button
                                     onClick={() => contactarWhatsApp(u)}
                                     title="Avisar por WhatsApp"
                                     className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white p-2 rounded-lg md:rounded-xl transition-all"
                                   >
                                     <MessageCircle size={14} />
                                   </button>

                                   <button
                                     onClick={() => aprobarSuscripcion(u.id)}
                                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase shadow-lg transition-all whitespace-nowrap"
                                   >
                                      {u.is_pro && !u.es_prueba ? 'Extender' : 'Aprobar ✅'}
                                   </button>

                                   <button
                                     onClick={() => activarPrueba(u.id)}
                                     title="Dar acceso PRO de prueba (no cuenta como ingreso)"
                                     className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap"
                                   >
                                      Prueba 🧪
                                   </button>

                                   {u.is_pro && (
                                     <button
                                       onClick={() => anularSuscripcion(u.id)}
                                       className="bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase transition-all whitespace-nowrap"
                                     >
                                        Quitar
                                     </button>
                                   )}
                                </div>
                             </td>
                          </tr>
                        );
                     })}
                  </tbody>
               </table>
               {suscripcionesFiltradas.length === 0 && (
                  <div className="p-10 md:p-20 text-center text-white/20 italic uppercase font-black tracking-widest text-xs md:text-sm">
                    No se encontraron resultados
                  </div>
               )}
            </div>

            {/* LISTA DE TARJETAS (SOLO MÓVIL) - íconos rápidos, tap para ver el detalle */}
            <div className="md:hidden bg-[#1a0f2e] rounded-[24px] border border-white/5 shadow-2xl divide-y divide-white/5 overflow-hidden">
               {suscripcionesFiltradas.map(u => {
                  const dias = u.vence_el ? Math.ceil((new Date(u.vence_el).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  const estaVencido = dias < 0;
                  const tieneEmail = u.email && u.email.trim() !== "";
                  const estatus = u.estado_pago === 'pendiente' ? 'pendiente' : u.is_pro && !estaVencido && u.es_prueba ? 'prueba' : u.is_pro && !estaVencido ? 'activo' : 'inactivo';

                  return (
                     <button
                       key={u.id}
                       onClick={() => setDetalleUsuario(u)}
                       className="w-full flex items-center gap-3 p-4 text-left active:bg-white/5 transition-colors"
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          estatus === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          estatus === 'prueba' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          estatus === 'activo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                           {estatus === 'pendiente' ? <Clock size={18}/> : estatus === 'prueba' || estatus === 'activo' ? <Crown size={18}/> : <XCircle size={18}/>}
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="text-white text-sm font-bold truncate">
                             {tieneEmail ? u.email : "⚠️ Sin Sincronizar"}
                           </p>
                           <p className="text-white/30 text-[10px] font-mono mt-0.5">
                             #{u.ordenNumero}{u.vence_el ? ` · ${estaVencido ? 'Vencido' : `Quedan ${dias}d`}` : ''}
                           </p>
                        </div>
                        <ChevronRight className="text-white/20 shrink-0" size={18}/>
                     </button>
                  );
               })}
               {suscripcionesFiltradas.length === 0 && (
                  <div className="p-10 text-center text-white/20 italic uppercase font-black tracking-widest text-xs">
                    No se encontraron resultados
                  </div>
               )}
            </div>
          </div>
        )}

        {/* 👥 VISTA 3: CRM (Directorio Completo) */}
        {pestana === 'crm' && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                placeholder="Buscar por email..." 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)} 
                className="w-full bg-[#1a0f2e] border border-white/5 p-4 md:p-5 pl-12 md:pl-14 rounded-2xl md:rounded-3xl text-sm font-bold outline-none focus:border-purple-500 shadow-xl" 
              />
            </div>

            {/* CONTENEDOR DE TABLA CON OVERFLOW */}
            <div className="bg-[#1a0f2e] rounded-[24px] md:rounded-[32px] border border-white/5 overflow-x-auto shadow-2xl">
               <table className="w-full text-left font-bold min-w-[600px]">
                  <thead className="bg-black/20 text-[9px] uppercase text-white/30 border-b border-white/5">
                     <tr>
                       <th className="p-4 md:p-5">Usuario</th>
                       <th className="p-4 md:p-5">Plan</th>
                       <th className="p-4 md:p-5">Registro Original</th>
                       <th className="p-4 md:p-5 text-center">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {usuariosCrmFiltrados.map(u => {
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-4 md:p-5">
                                <p className="text-white text-xs md:text-sm italic">{u.email || u.id}</p>
                                <p className="text-white/20 text-[8px] md:text-[9px] font-mono mt-1 break-all max-w-[200px]">ID: {u.id}</p>
                             </td>
                             <td className="p-4 md:p-5">
                                <span className={`px-2 py-1 md:px-3 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] uppercase font-black ${u.is_pro && u.es_prueba ? 'bg-sky-500 text-white' : u.is_pro ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/30'}`}>
                                  {u.is_pro && u.es_prueba ? '🧪 PRUEBA' : u.is_pro ? '💎 PRO' : 'GUEST'}
                                </span>
                             </td>
                             <td className="p-4 md:p-5 text-[10px] md:text-xs font-mono text-white/50">
                               {new Date(u.created_at).toLocaleDateString()}
                             </td>
                             <td className="p-4 md:p-5 text-center">
                               <button 
                                 onClick={() => { setBusqueda(u.email || u.ordenNumero); setPestana('suscripciones'); setFiltroSuscripciones("Todas"); }} 
                                 className="bg-white/10 hover:bg-emerald-500 transition-all text-white px-4 py-2 md:px-5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] uppercase font-black whitespace-nowrap"
                               >
                                 Gestionar Plan
                               </button>
                             </td>
                          </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE DETALLE (móvil y desktop) - aprobar / quitar acceso */}
      {detalleUsuario && (() => {
        const u = detalleUsuario;
        const dias = u.vence_el ? Math.ceil((new Date(u.vence_el).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const estaVencido = dias < 0;
        const tieneEmail = u.email && u.email.trim() !== "";
        const estatus = u.estado_pago === 'pendiente' ? 'pendiente' : u.is_pro && !estaVencido && u.es_prueba ? 'prueba' : u.is_pro && !estaVencido ? 'activo' : 'inactivo';

        return (
          <div
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in"
            onClick={() => setDetalleUsuario(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md bg-[#1a0f2e] border border-white/10 rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95"
            >
              <div className="mx-auto w-12 h-1.5 rounded-full bg-white/10 mb-6 md:hidden" />

              <div className="flex items-start justify-between mb-6">
                <span className={`px-3 py-1.5 rounded-lg text-[9px] uppercase italic font-black border ${
                  estatus === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                  estatus === 'prueba' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                  estatus === 'activo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                  {estatus === 'pendiente' ? 'Verificando' : estatus === 'prueba' ? 'Prueba' : estatus === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
                <button onClick={() => setDetalleUsuario(null)} className="text-white/40 hover:text-white p-1"><X size={20}/></button>
              </div>

              <p className="text-white text-lg font-black italic break-words">{tieneEmail ? u.email : "⚠️ Sin Sincronizar"}</p>
              <div className="flex items-center gap-2 mt-1 mb-6">
                <p className="text-purple-400 font-mono text-sm">Orden #{u.ordenNumero}</p>
                <span className="text-white/10">·</span>
                <button
                  onClick={() => navigator.clipboard.writeText(u.id)}
                  className="text-white/30 hover:text-white font-mono text-[10px] flex items-center gap-1"
                  title="Copiar UID"
                >
                  UID: {u.id.slice(0, 8)}… <Copy size={10}/>
                </button>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-6">
                {u.vence_el ? (
                  <>
                    <p className="text-white/70 font-mono text-sm">
                      <Clock className="inline mb-0.5 mr-1.5" size={14}/>Vence {new Date(u.vence_el).toLocaleDateString()}
                    </p>
                    <p className={`text-[10px] font-black uppercase mt-1 ${estaVencido ? 'text-rose-500' : 'text-purple-400'}`}>
                      {estaVencido ? 'Vencido' : `Quedan ${dias} días`}
                    </p>
                  </>
                ) : (
                  <p className="text-white/30 text-xs uppercase">Sin fecha de vencimiento</p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => contactarWhatsApp(u)}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  <MessageCircle size={16}/> Avisar por WhatsApp
                </button>

                <button
                  onClick={() => { aprobarSuscripcion(u.id); setDetalleUsuario(null); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {u.is_pro && !u.es_prueba ? 'Extender 30 días' : 'Aprobar acceso ✅'}
                </button>

                <button
                  onClick={() => { activarPrueba(u.id); setDetalleUsuario(null); }}
                  className="w-full bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Dar prueba gratis 🧪
                </button>

                {u.is_pro && (
                  <button
                    onClick={() => { anularSuscripcion(u.id); setDetalleUsuario(null); }}
                    className="w-full bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Quitar acceso PRO
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}