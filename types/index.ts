// ============================================================================
// TIPOS E INTERFACES GLOBALES
// ============================================================================

export interface User {
  id: string;
  email: string;
  nombre?: string;
  telefono?: string;
  is_pro?: boolean;
  estado_pago?: 'gratis' | 'pendiente' | 'activo';
}

export interface Espacio {
  id: string;
  nombre: string;
  tipo: 'individual' | 'pote' | 'vaca';
  creador_id: string;
  codigo_invitacion?: string;
  created_at?: string;
}

// Cómo se organiza el dinero dentro de un Espacio de tipo 'pote' (pareja/familia).
// Un pote sin fila en pote_configuracion se sigue tratando como 'divide_50_50' (comportamiento
// histórico de "Ambos" repartido a la mitad), así que este tipo siempre incluye null.
export type ModoFinanzasPareja = 'fondo_comun' | 'divide_50_50' | 'proporcional' | 'hibrido';

export interface PoteConfiguracion {
  espacio_id: string;
  modo: ModoFinanzasPareja;
  // proporcional: { [nombreParticipante]: porcentaje } (suman 100)
  // hibrido: { [nombreParticipante]: aporteMensualUsd }
  // Mientras la pareja no se une con el código, su lado se guarda bajo la clave "__pendiente__"
  // y se renombra automáticamente al nombre real en cuanto entra al espacio.
  aportes: Record<string, number>;
  fondo_comun_meta_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Participante {
  id: string;
  nombre: string;
  espacio_id: string;
  created_at?: string;
}

export interface Transaccion {
  id: string;
  espacio_id: string;
  usuario_id?: string;
  usuario: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  descripcion: string;
  monto_original: number;
  moneda_original: 'usd' | 'bs' | 'cash';
  monto_bs: number;
  monto_usd_bcv: number;
  monto_usd_paralelo: number;
  created_at: string;
}

export interface Meta {
  id: string;
  espacio_id: string;
  nombre: string;
  monto_objetivo: number;
  created_at?: string;
}

export interface Presupuesto {
  id: string;
  espacio_id: string;
  categoria: string;
  monto_limite: number;
}

export interface Cashea {
  id: string;
  espacio_id: string;
  articulo: string;
  monto_cuota: number;
  fecha_pago: string;
  usuario: string;
  pagado: boolean;
  created_at?: string;
}

export interface Recordatorio {
  id: string;
  espacio_id: string;
  usuario_id: string;
  texto: string;
  completado: boolean;
  created_at?: string;
}

export interface GastoFijo {
  id: string;
  descripcion: string;
  monto: string;
  dia_pago: string;
  pagado: boolean;
}

export interface ExchangeRates {
  bcv: number;
  usdt: number;
  success?: boolean;
}

export interface Saldos {
  bs: number;
  usdt: number;
  cash: number;
}

export interface Perfil {
  id: string;
  nombre?: string;
  email?: string;
  is_pro: boolean;
  estado_pago: 'gratis' | 'pendiente' | 'activo';
  created_at?: string;
}

export interface Theme {
  primary: string;
  text: string;
  border: string;
  card: string;
  darkBg: string;
  stroke: string;
  lightBg: string;
}
