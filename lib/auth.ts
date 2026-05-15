import { supabase } from "@/lib/supabase";
import type { Espacio, Perfil } from "@/types";

export const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const cargarDatosUsuario = async (userId: string) => {
  // Cargar perfil
  let { data: perfilBd } = await supabase.from('perfiles').select('*').eq('id', userId).single();
  
  if (!perfilBd) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: newPerfil } = await supabase.from('perfiles').insert([{
      id: userId,
      is_pro: false,
      estado_pago: 'gratis',
      email: user?.email
    }]).select().single();
    perfilBd = newPerfil;
  }

  // Cargar espacios
  const { data: espaciosData } = await supabase
    .from('espacios')
    .select('*, espacio_miembros!inner(usuario_id)')
    .eq('espacio_miembros.usuario_id', userId);

  let espacios: Espacio[] = [];
  if (espaciosData && espaciosData.length > 0) {
    espacios = await Promise.all(espaciosData.map(async (e) => {
      if (e.tipo !== 'individual' && !e.codigo_invitacion) {
        const nuevoCodigo = generarCodigo();
        await supabase.from('espacios').update({ codigo_invitacion: nuevoCodigo }).eq('id', e.id);
        return { ...e, codigo_invitacion: nuevoCodigo };
      }
      return e;
    }));
  }

  return { perfil: perfilBd, espacios };
};

export const handleLoginUser = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
};

export const handleRegisterUser = async (email: string, password: string, nombre: string, telefono: string) => {
  const { data: newUser, error: signUpError } = await supabase.auth.signUp({ email, password });
  
  if (signUpError) return { error: signUpError, data: null };

  if (newUser?.user?.id) {
    const { data: createdProfile, error: profileError } = await supabase
      .from('perfiles')
      .insert([{ id: newUser.user.id, nombre, telefono, is_pro: false, email }])
      .select()
      .single();

    if (profileError) return { error: profileError, data: null };

    const { data: newSpace, error: spaceError } = await supabase
      .from('espacios')
      .insert([{ nombre: 'Mi Billetera', tipo: 'individual', creador_id: newUser.user.id }])
      .select()
      .single();

    if (spaceError) return { error: spaceError, data: null };

    await supabase
      .from('espacio_miembros')
      .insert([{ espacio_id: newSpace.id, usuario_id: newUser.user.id, rol: 'admin' }]);

    return { error: null, data: { user: newUser.user, perfil: createdProfile, space: newSpace } };
  }

  return { error: new Error("No user data returned"), data: null };
};

export const handleLogout = async () => {
  await supabase.auth.signOut();
};

export const fetchExchangeRates = async () => {
  try {
    const res = await fetch("/api/rates");
    const data = await res.json();
    if (data.success) {
      return { bcv: data.bcv, usdt: data.usdt };
    }
  } catch (error) {
    console.error("Error al traer tasas:", error);
  }
  return { bcv: 0, usdt: 0 };
};

export const unirseAlEspacio = async (joinCode: string, userId: string, perfil: Perfil | null, session: any) => {
  const { data: spaceFound } = await supabase
    .from('espacios')
    .select('*')
    .eq('codigo_invitacion', joinCode.trim().toUpperCase())
    .single();

  if (!spaceFound) throw new Error("Código inválido");

  const { count } = await supabase
    .from('espacio_miembros')
    .select('*', { count: 'exact', head: true })
    .eq('espacio_id', spaceFound.id);

  if (spaceFound.tipo === 'pote' && count !== null && count >= 2) {
    throw new Error("Este Pote ya está lleno");
  }

  await supabase.from('espacio_miembros').insert([{
    espacio_id: spaceFound.id,
    usuario_id: userId,
    rol: 'miembro'
  }]);

  await supabase.from('participantes').insert([{
    nombre: (perfil?.nombre || session.user.email.split('@')[0]),
    espacio_id: spaceFound.id
  }]);

  return spaceFound;
};
