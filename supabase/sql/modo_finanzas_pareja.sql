-- Modos de organización financiera para Potes en pareja (Fondo común / 50-50 / Proporcional / Híbrido).
-- Copia y ejecuta esto en el SQL Editor de Supabase (no se aplica solo, este repo no
-- tiene acceso directo a tu proyecto de Supabase).

-- Un pote SIN fila aquí (o creado antes de este cambio) sigue comportándose exactamente
-- igual que hoy: split 50/50 en "Ambos", sin deuda. No rompe nada existente.
create table if not exists pote_configuracion (
  espacio_id uuid primary key references espacios(id) on delete cascade,
  modo text not null check (modo in ('fondo_comun', 'divide_50_50', 'proporcional', 'hibrido')),
  -- proporcional: { "<participante_id>": 70, "<participante_id>": 30 } (porcentajes que suman 100)
  -- hibrido:      { "<participante_id>": 100 } (aporte fijo mensual sugerido, en USD)
  aportes jsonb not null default '{}'::jsonb,
  -- Solo modo 'hibrido': la meta especial (tabla metas) que representa el fondo común.
  fondo_comun_meta_id uuid references metas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pote_configuracion enable row level security;

drop policy if exists "pote_configuracion_members" on pote_configuracion;
create policy "pote_configuracion_members" on pote_configuracion
for all using (
  exists (
    select 1 from espacio_miembros
    where espacio_miembros.espacio_id = pote_configuracion.espacio_id
      and espacio_miembros.usuario_id = auth.uid()
  )
);

-- Quién puso físicamente la plata en un movimiento marcado "Ambos": necesario para
-- calcular quién le debe a quién en los modos 'divide_50_50' y 'proporcional'.
-- Las transacciones históricas quedan con NULL y simplemente no participan en la deuda.
alter table transacciones_saas add column if not exists pagado_por text;
