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
