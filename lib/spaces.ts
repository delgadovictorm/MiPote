import { supabase } from "@/lib/supabase";
import { generarCodigo } from "./auth";
import type { Espacio } from "@/types";

export const crearEspacio = async (
  nombre: string,
  tipo: "individual" | "pote" | "vaca",
  userId: string
) => {
  const { data, error } = await supabase
    .from("espacios")
    .insert([{
      nombre,
      tipo,
      creador_id: userId,
      codigo_invitacion: tipo !== "individual" ? generarCodigo() : null,
    }])
    .select()
    .single();

  if (!error && data) {
    await supabase.from("espacio_miembros").insert([{
      espacio_id: data.id,
      usuario_id: userId,
      rol: "admin",
    }]);
  }

  return { data, error };
};

export const actualizarNombreEspacio = async (espacioId: string, nuevoNombre: string) => {
  const { error, data } = await supabase
    .from("espacios")
    .update({ nombre: nuevoNombre })
    .eq("id", espacioId)
    .select()
    .single();

  return { data, error };
};

export const eliminarEspacio = async (espacioId: string) => {
  const { error } = await supabase.from("espacios").delete().eq("id", espacioId);
  return { error };
};

export const obtenerEspacios = async (userId: string) => {
  const { data, error } = await supabase
    .from("espacios")
    .select("*, espacio_miembros!inner(usuario_id)")
    .eq("espacio_miembros.usuario_id", userId);

  return { data: data || [], error };
};

export const obtenerParticipantes = async (espacioId: string) => {
  const { data, error } = await supabase
    .from("participantes")
    .select("*")
    .eq("espacio_id", espacioId);

  return { data: data || [], error };
};

export const agregarParticipante = async (espacioId: string, nombre: string) => {
  const { data, error } = await supabase
    .from("participantes")
    .insert([{ nombre: nombre.trim(), espacio_id: espacioId }])
    .select()
    .single();

  return { data, error };
};

export const eliminarParticipante = async (participanteId: string) => {
  const { error } = await supabase.from("participantes").delete().eq("id", participanteId);
  return { error };
};

export const obtenerMetas = async (espacioId: string) => {
  const { data, error } = await supabase
    .from("metas")
    .select("*")
    .eq("espacio_id", espacioId)
    .order("created_at", { ascending: true });

  return { data: data || [], error };
};

export const crearMeta = async (espacioId: string, nombre: string, monto_objetivo: number) => {
  const { data, error } = await supabase
    .from("metas")
    .insert([{ nombre, monto_objetivo, espacio_id: espacioId }])
    .select()
    .single();

  return { data, error };
};

export const actualizarMeta = async (metaId: string, nombre: string, monto_objetivo: number) => {
  const { data, error } = await supabase
    .from("metas")
    .update({ nombre, monto_objetivo })
    .eq("id", metaId)
    .select()
    .single();

  return { data, error };
};

export const eliminarMeta = async (metaId: string) => {
  const { error } = await supabase.from("metas").delete().eq("id", metaId);
  return { error };
};

export const obtenerRecordatorios = async (espacioId: string) => {
  const { data, error } = await supabase
    .from("recordatorios")
    .select("*")
    .eq("espacio_id", espacioId)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
};

export const crearRecordatorio = async (espacioId: string, usuarioId: string, texto: string) => {
  const { data, error } = await supabase
    .from("recordatorios")
    .insert([{ texto, espacio_id: espacioId, usuario_id: usuarioId }])
    .select()
    .single();

  return { data, error };
};

export const toggleRecordatorio = async (recordatorioId: string, completado: boolean) => {
  const { error } = await supabase
    .from("recordatorios")
    .update({ completado: !completado })
    .eq("id", recordatorioId);

  return { error };
};

export const eliminarRecordatorio = async (recordatorioId: string) => {
  const { error } = await supabase.from("recordatorios").delete().eq("id", recordatorioId);
  return { error };
};
