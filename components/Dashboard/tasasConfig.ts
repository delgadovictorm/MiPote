export type TasaId = 'bcv' | 'usdt' | 'eur_bcv' | 'eur_paralelo' | 'cop' | 'mxn';

export interface TasaDef {
  id: TasaId;
  label: string;
  badge: string;
  // 'bs_per_usd' y 'bs_per_eur' guardan cuántos Bs vale 1 unidad de esa divisa.
  // 'foreign_per_usd' guarda cuántas unidades de esa moneda extranjera vale 1 USD (ej. COP, MXN).
  kind: 'bs_per_usd' | 'bs_per_eur' | 'foreign_per_usd';
  locale: string;
  classes: {
    border: string;
    badgeBg: string;
    badgeText: string;
    text: string;
    bar: string;
  };
}

export const TASAS_DISPONIBLES: TasaDef[] = [
  {
    id: 'bcv',
    label: 'BCV Dólar',
    badge: 'OFICIAL',
    kind: 'bs_per_usd',
    locale: 'es-VE',
    classes: { border: 'border-emerald-500/20', badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  },
  {
    id: 'eur_bcv',
    label: 'Euro BCV',
    badge: 'EUROPA',
    kind: 'bs_per_eur',
    locale: 'es-VE',
    classes: { border: 'border-purple-500/20', badgeBg: 'bg-purple-500/20', badgeText: 'text-purple-400', text: 'text-purple-400', bar: 'bg-purple-500' },
  },
  {
    id: 'usdt',
    label: 'Paralelo / USDT',
    badge: 'DIGITAL',
    kind: 'bs_per_usd',
    locale: 'es-VE',
    classes: { border: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-400', text: 'text-blue-400', bar: 'bg-blue-500' },
  },
  {
    id: 'eur_paralelo',
    label: 'Euro Paralelo',
    badge: 'EUROPA',
    kind: 'bs_per_eur',
    locale: 'es-VE',
    classes: { border: 'border-fuchsia-500/20', badgeBg: 'bg-fuchsia-500/20', badgeText: 'text-fuchsia-400', text: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
  },
  {
    id: 'cop',
    label: 'Peso Colombiano',
    badge: 'COP',
    kind: 'foreign_per_usd',
    locale: 'es-CO',
    classes: { border: 'border-yellow-500/20', badgeBg: 'bg-yellow-500/20', badgeText: 'text-yellow-400', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  },
  {
    id: 'mxn',
    label: 'Peso Mexicano',
    badge: 'MXN',
    kind: 'foreign_per_usd',
    locale: 'es-MX',
    classes: { border: 'border-orange-500/20', badgeBg: 'bg-orange-500/20', badgeText: 'text-orange-400', text: 'text-orange-400', bar: 'bg-orange-500' },
  },
];

export const TASAS_DEFECTO: TasaId[] = ['bcv', 'eur_bcv', 'usdt'];

export const TASAS_STORAGE_KEY = 'mipote_tasas_activas';

export function getValorTasa(id: TasaId, rates: any): number {
  switch (id) {
    case 'bcv': return rates.bcv || 0;
    case 'usdt': return rates.usdt || 0;
    case 'eur_bcv': return rates.eur_bcv || 0;
    case 'eur_paralelo': return rates.eur_paralelo || 0;
    case 'cop': return rates.cop_usd || 0;
    case 'mxn': return rates.mxn_usd || 0;
    default: return 0;
  }
}

export type MonedaOrigen = 'usd' | 'bs' | 'eur';

// Calcula el resultado de convertir `numValue` (en la moneda `monedaOrigen`) usando la tasa `def`.
export function calcularResultadoTasa(def: TasaDef, monedaOrigen: MonedaOrigen, numValue: number, rates: any): number {
  const rateValor = getValorTasa(def.id, rates);
  const nativo: 'usd' | 'eur' = def.kind === 'bs_per_eur' ? 'eur' : 'usd';

  if (def.kind === 'foreign_per_usd') {
    if (monedaOrigen === 'usd') return numValue * rateValor;
    if (monedaOrigen === 'bs') return rates.bcv > 0 ? (numValue / rates.bcv) * rateValor : 0;
    // origen eur: puenteamos a Bs con la tasa euro BCV y de ahí a USD con BCV
    return rates.bcv > 0 ? ((numValue * rates.eur_bcv) / rates.bcv) * rateValor : 0;
  }

  // bs_per_usd o bs_per_eur
  if (monedaOrigen === nativo) {
    return numValue * rateValor; // resultado en Bs
  }
  if (monedaOrigen === 'bs') {
    return rateValor > 0 ? numValue / rateValor : 0; // resultado en la divisa nativa de esta tasa (usd o eur)
  }
  // origen es la otra divisa: puenteamos a Bs primero (siempre con la tasa BCV correspondiente)
  const montoBsAncla = monedaOrigen === 'eur' ? numValue * rates.eur_bcv : numValue * rates.bcv;
  return rateValor > 0 ? montoBsAncla / rateValor : 0;
}
