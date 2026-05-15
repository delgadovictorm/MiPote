import { supabase } from "@/lib/supabase";
import type { Transaccion, Saldos, ExchangeRates } from "@/types";

export const calcularMontos = (montoInput: number, monedaInput: string, rates: ExchangeRates) => {
  let monto_bs = 0,
    monto_usd_bcv = 0,
    monto_usd_paralelo = 0;

  if (monedaInput === "bs") {
    monto_bs = montoInput;
    monto_usd_bcv = rates.bcv > 0 ? montoInput / rates.bcv : 0;
    monto_usd_paralelo = rates.usdt > 0 ? montoInput / rates.usdt : 0;
  } else if (monedaInput === "usdt" || monedaInput === "usd") {
    monto_usd_paralelo = montoInput;
    monto_usd_bcv = montoInput;
    monto_bs = montoInput * rates.usdt;
  } else if (monedaInput === "cash") {
    monto_usd_paralelo = montoInput;
    monto_usd_bcv = montoInput;
    monto_bs = montoInput * rates.bcv;
  }

  return { monto_bs, monto_usd_bcv, monto_usd_paralelo };
};

export const crearTransaccion = async (
  espacioId: string,
  usuarioId: string,
  transaccion: Omit<Transaccion, 'id' | 'created_at'>
) => {
  const { error, data } = await supabase
    .from("transacciones_saas")
    .insert([{
      ...transaccion,
      espacio_id: espacioId,
      usuario_id: usuarioId
    }])
    .select()
    .single();

  return { error, data };
};

export const eliminarTransaccion = async (transaccionId: string) => {
  const { error } = await supabase.from("transacciones_saas").delete().eq("id", transaccionId);
  return { error };
};

export const obtenerTransacciones = async (espacioId: string) => {
  const { data, error } = await supabase
    .from("transacciones_saas")
    .select("*")
    .eq("espacio_id", espacioId)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
};

export const getSaldosAislados = (
  transactions: Transaccion[],
  userName?: string,
  participantes: any[] = [],
  rates: ExchangeRates = { bcv: 0, usdt: 0 },
  espacioTipo?: string,
  perfil?: any,
  session?: any
): Saldos => {
  let bs = 0,
    usdt = 0,
    cash = 0;

  transactions.forEach((tx) => {
    if (tx.categoria.startsWith("pote_") || tx.categoria === "emergencia") return;

    let fraction = 0;
    const txUser = tx.usuario?.trim();
    const targetUser = userName?.trim();

    if (!userName || userName === "ALL" || espacioTipo === "individual") {
      fraction = 1;
    } else {
      if (
        txUser === targetUser ||
        (txUser === "Tú" && targetUser === (perfil?.nombre || session?.user?.email?.split("@")[0]))
      ) {
        fraction = 1;
      } else if (txUser === "Ambos" || txUser === "Todos (Div)") {
        fraction = 1 / (espacioTipo === "vaca" ? Math.max(participantes.length, 1) : 2);
      }
    }

    if (fraction > 0) {
      const montoNominal = tx.monto_original || tx.monto_usd_paralelo || 0;
      const signo = tx.tipo === "ingreso" ? 1 : -1;
      const valorReal = montoNominal * signo * fraction;
      const monedaEstricta = tx.moneda_original || (montoNominal > 1000 ? "bs" : "usd");

      if (monedaEstricta === "bs") bs += valorReal;
      else if (monedaEstricta === "cash") cash += valorReal;
      else usdt += valorReal;
    }
  });

  return { bs, usdt, cash };
};

export const getPatrimonioNeto = (
  transactions: Transaccion[],
  rates: ExchangeRates,
  saldos: Saldos
) => {
  const balanceLiquido =
    saldos.usdt +
    saldos.cash +
    (rates.usdt > 0 ? saldos.bs / rates.usdt : 0);

  const balanceLiquidoBcv =
    saldos.usdt +
    saldos.cash +
    (rates.bcv > 0 ? saldos.bs / rates.bcv : 0);

  const ahorradoPotes = transactions
    .filter((tx) => tx.categoria.startsWith("pote_"))
    .reduce((acc, tx) =>
      tx.tipo === "ingreso"
        ? acc + (tx.monto_usd_paralelo || 0)
        : acc - (tx.monto_usd_paralelo || 0),
      0
    );

  const ahorradoEmergencia = transactions
    .filter((tx) => tx.categoria === "emergencia")
    .reduce((acc, tx) =>
      tx.tipo === "ingreso"
        ? acc + (tx.monto_usd_paralelo || 0)
        : acc - (tx.monto_usd_paralelo || 0),
      0
    );

  return {
    paralelo: balanceLiquido + ahorradoPotes + ahorradoEmergencia,
    bcv: balanceLiquidoBcv + ahorradoPotes + ahorradoEmergencia,
  };
};

export const getPoteAhorrado = (
  poteId: string,
  transactions: Transaccion[],
  monto_objetivo?: number,
  saldos?: Saldos,
  rates?: ExchangeRates,
  espacioTipo?: string
) => {
  if (espacioTipo === "vaca" && saldos && rates) {
    return saldos.usdt + saldos.cash + (rates.usdt > 0 ? saldos.bs / rates.usdt : 0);
  }

  return transactions
    .filter((tx) => tx.categoria === `pote_${poteId}`)
    .reduce((acc, tx) =>
      tx.tipo === "ingreso"
        ? acc + (tx.monto_usd_paralelo || 0)
        : acc - (tx.monto_usd_paralelo || 0),
      0
    );
};
