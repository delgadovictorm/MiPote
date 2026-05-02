"use client"
import { supabase } from "../../lib/supabase";
import { useState, useMemo, useEffect } from "react";
import { 
  Users, Crown, Clock, CheckCircle2, Search, 
  ArrowLeft, LogOut, ShieldCheck, TrendingUp, RefreshCw, MessageCircle
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

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('perfiles').update({ nombre: editNombre }).eq('id', session.user.id);
    if (error) alert("Error al guardar: " + error.message);
    else {
      setPerfil({ ...perfil, nombre: editNombre });
      setShowProfileModal(false);
      alert("✅ Nombre actualizado correctamente.");
    }
  };

  // =========================================================================
  // --- 📡 DATOS Y GESTIÓN (SUPABASE) ---
  // =========================================================================
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [pestana, setPestana] = useState("inicio");
  const [busqueda, setBusqueda] = useState("");
  const [filtroSuscripciones, setFiltroSuscripciones] = useState("Pendientes");
  const [cargandoDatos, setCargandoData] = useState(false);

  const traerTodo = async () => {
    setCargandoData(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, email, estado_pago, is_pro, vence_el, created_at')
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
      .update({ is_pro: true, estado_pago: 'pro', vence_el: v.toISOString() })
      .eq('id', id);
      
    if (!error) traerTodo();
  };

  const anularSuscripcion = async (id: string) => {
    if (!confirm("¿Anular acceso PRO y pasar a inactivo?")) return;
    const { error } = await supabase
      .from('perfiles')
      .update({ is_pro: false, estado_pago: 'gratis', vence_el: null })
      .eq('id', id);
      
    if (!error) traerTodo();
  };

  const contactarWhatsApp = (emailUser: string, orden: string) => {
    const mensaje = encodeURIComponent(`¡Hola! Te escribo de *MiPote.ve* 🍯\nReferente a tu cuenta (${emailUser}) - Orden #${orden}.\n\n`);
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  };

  const kpis = useMemo(() => {
    return {
      total: usuarios.length,
      pros: usuarios.filter(u => u.is_pro).length,
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
        filtroSuscripciones === "Activas" ? u.is_pro === true :
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
        <div className="w-full max-w-[400px] bg-[#1a0f2e] border border-white/5 p-10 rounded-[40px] shadow-2xl text-center">
          <ShieldCheck className="text-purple-500 mx-auto mb-6" size={64} />
          <h1 className="text-[28px] font-black text-white italic uppercase tracking-tight">Admin Pote</h1>
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
    <div className="min-h-screen bg-[#0d0714] text-white font-sans flex italic-none">
      
      {/* SIDEBAR TIPO SAAS */}
      <aside className="w-64 border-r border-white/5 bg-[#1a0f2e] flex flex-col p-6 z-10 shadow-2xl">
        <div className="flex items-center gap-3 px-2 mb-8">
          <img src="/pote.png" className="w-10" alt="Logo" />
          <span className="font-black text-white text-lg uppercase italic tracking-tight leading-none">
            Mi Pote <br/>
            <span className="text-[10px] text-purple-400 tracking-[0.2em]">CONTROL</span>
          </span>
        </div>
        
        <nav className="flex flex-col space-y-1">
          {[
            { id: 'inicio', icono: '📊', t: 'Inicio' },
            { id: 'suscripciones', icono: '💎', t: 'Suscripciones' },
            { id: 'crm', icono: '👥', t: 'Usuarios' },
          ].map(i => (
            <button 
              key={i.id} 
              onClick={() => { setPestana(i.id); setBusqueda(""); }} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${pestana === i.id ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
              <span className="text-lg">{i.icono}</span> {i.t}
            </button>
          ))}
          
          <button onClick={traerTodo} className="mt-10 bg-white/5 text-white/60 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white/10 flex items-center justify-center gap-2">
            <RefreshCw size={14} className={cargandoDatos ? "animate-spin" : ""} /> Actualizar Datos
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto p-4 text-white/30 hover:text-rose-500 font-bold uppercase text-[9px] flex items-center gap-2">
          <LogOut size={16}/> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-10">
        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-10">
          {pestana === 'inicio' ? 'Control de Mando' : pestana === 'suscripciones' ? 'Gestión de PRO' : 'Base de Datos de Usuarios'}
        </h2>

        {/* 📊 VISTA 1: INICIO (Dashboard) */}
        {pestana === 'inicio' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="bg-[#1a0f2e] border border-white/5 rounded-[30px] p-8 shadow-xl">
              <p className="text-white/40 font-black text-[10px] uppercase mb-2">Comunidad Total</p>
              <p className="text-4xl font-black">{kpis.total}</p>
            </div>
            <div className="bg-[#1a0f2e] border border-white/5 rounded-[30px] p-8 shadow-xl">
              <p className="text-amber-500 font-black text-[10px] uppercase mb-2">Pendientes de Pago</p>
              <p className="text-4xl font-black text-amber-500">{kpis.pendientes}</p>
            </div>
            <div className="bg-[#0f172a] border border-emerald-500/20 rounded-[30px] p-8 shadow-2xl">
              <p className="text-emerald-400 font-black text-[10px] uppercase mb-2">Ingresos Activos</p>
              <p className="text-4xl font-black text-emerald-400">${(kpis.pros * 4.99).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* 💎 VISTA 2: SUSCRIPCIONES */}
        {pestana === 'suscripciones' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    placeholder="Buscar por Orden # o Email..." 
                    value={busqueda} 
                    onChange={e => setBusqueda(e.target.value)} 
                    className="w-full bg-[#1a0f2e] border border-white/5 p-4 pl-12 rounded-2xl font-bold outline-none focus:border-purple-500 transition-colors" 
                  />
               </div>
               <div className="flex gap-2 bg-[#1a0f2e] border border-white/5 p-2 rounded-2xl">
                  {['Pendientes', 'Activas', 'Inactivas', 'Todas'].map(f => (
                     <button 
                       key={f} 
                       onClick={() => setFiltroSuscripciones(f)} 
                       className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroSuscripciones === f ? 'bg-purple-600 text-white shadow-md' : 'text-white/30 hover:bg-white/5'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-[#1a0f2e] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
               <table className="w-full text-left font-bold">
                  <thead className="bg-black/20 text-[9px] uppercase text-white/30 border-b border-white/5">
                     <tr>
                       <th className="p-5">Orden #</th>
                       <th className="p-5">Información de la Cuenta</th>
                       <th className="p-5">Estatus</th>
                       <th className="p-5">Vencimiento</th>
                       <th className="p-5 text-center">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {suscripcionesFiltradas.map(u => {
                        const dias = u.vence_el ? Math.ceil((new Date(u.vence_el).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        const estaVencido = dias < 0;
                        const tieneEmail = u.email && u.email.trim() !== "";
                        
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-5 text-purple-400 font-mono text-sm">#{u.ordenNumero}</td>
                             <td className="p-5">
                                <p className="text-white text-sm uppercase italic">
                                  {tieneEmail ? u.email : "⚠️ Sin Sincronizar"}
                                </p>
                                <p className="text-[9px] text-white/20 font-mono">UID: {u.id.substring(0,18)}...</p>
                             </td>
                             <td className="p-5">
                                <span className={`px-3 py-1.5 rounded-lg text-[9px] uppercase italic font-black border ${
                                  u.estado_pago === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                  u.is_pro && !estaVencido ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                   {u.estado_pago === 'pendiente' ? 'Verificando' : u.is_pro && !estaVencido ? 'Activo' : 'Inactivo'}
                                </span>
                             </td>
                             <td className="p-5">
                                {u.vence_el ? (
                                  <div className="flex flex-col">
                                    <span className="text-white/70 font-mono text-xs">
                                      <Clock className="inline mb-0.5 mr-1" size={12}/>{new Date(u.vence_el).toLocaleDateString()} 
                                    </span>
                                    <span className={`text-[9px] font-black uppercase mt-1 ${estaVencido ? 'text-rose-500' : 'text-purple-400'}`}>
                                      {estaVencido ? 'Vencido' : `Quedan ${dias} días`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-white/10 text-[10px]">SIN FECHA</span>
                                )}
                             </td>
                             <td className="p-5">
                                <div className="flex justify-center gap-2">
                                   <button 
                                     onClick={() => contactarWhatsApp(u.email || 'Cliente', u.ordenNumero)}
                                     title="Avisar por WhatsApp"
                                     className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white p-2 rounded-xl transition-all"
                                   >
                                     <MessageCircle size={16} />
                                   </button>
                                   
                                   <button 
                                     onClick={() => aprobarSuscripcion(u.id)} 
                                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all"
                                   >
                                      {u.is_pro ? 'Extender' : 'Aprobar ✅'}
                                   </button>
                                   
                                   {u.is_pro && (
                                     <button 
                                       onClick={() => anularSuscripcion(u.id)} 
                                       className="bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all"
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
                  <div className="p-20 text-center text-white/20 italic uppercase font-black tracking-widest">
                    No se encontraron resultados
                  </div>
               )}
            </div>
          </div>
        )}

        {/* 👥 VISTA 3: CRM (Directorio Completo) */}
        {pestana === 'crm' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                placeholder="Buscar por email..." 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)} 
                className="w-full bg-[#1a0f2e] border border-white/5 p-5 pl-14 rounded-3xl font-bold outline-none focus:border-purple-500 shadow-xl" 
              />
            </div>

            <div className="bg-[#1a0f2e] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
               <table className="w-full text-left font-bold">
                  <thead className="bg-black/20 text-[9px] uppercase text-white/30 border-b border-white/5">
                     <tr>
                       <th className="p-5">Usuario</th>
                       <th className="p-5">Plan</th>
                       <th className="p-5">Registro Original</th>
                       <th className="p-5 text-center">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {usuariosCrmFiltrados.map(u => {
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-5">
                                <p className="text-white text-sm italic">{u.email || u.id}</p>
                                <p className="text-white/20 text-[9px] font-mono mt-1">ID: {u.id.substring(0,24)}...</p>
                             </td>
                             <td className="p-5">
                                <span className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black ${u.is_pro ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/30'}`}>
                                  {u.is_pro ? '💎 PRO' : 'GUEST'}
                                </span>
                             </td>
                             <td className="p-5 text-xs font-mono text-white/50">
                               {new Date(u.created_at).toLocaleDateString()}
                             </td>
                             <td className="p-5 text-center">
                               <button 
                                 onClick={() => { setBusqueda(u.email || u.ordenNumero); setPestana('suscripciones'); setFiltroSuscripciones("Todas"); }} 
                                 className="bg-white/10 hover:bg-emerald-500 transition-all text-white px-5 py-2 rounded-xl text-[9px] uppercase font-black"
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
    </div>
  );
}