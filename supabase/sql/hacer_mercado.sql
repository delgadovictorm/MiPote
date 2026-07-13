-- Esquema para la función "Hacer Mercado".
-- Copia y ejecuta esto en el SQL Editor de Supabase (no se aplica solo, este repo no
-- tiene acceso directo a tu proyecto de Supabase).

create table if not exists sesiones_mercado (
  id uuid primary key default gen_random_uuid(),
  espacio_id uuid not null references espacios(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  presupuesto_usd numeric,
  total_estimado_usd numeric not null default 0,
  total_real_usd numeric,
  estado text not null default 'activa' check (estado in ('activa', 'cerrada')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists items_mercado (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references sesiones_mercado(id) on delete cascade,
  -- Denormalizado a propósito: permite buscar el historial de precios por espacio
  -- (autocompletar) sin tener que hacer join contra sesiones_mercado en cada búsqueda.
  espacio_id uuid not null references espacios(id) on delete cascade,
  nombre_producto text not null,
  precio numeric not null,
  moneda text not null check (moneda in ('usd', 'bs')),
  precio_usd_normalizado numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_items_mercado_espacio_nombre on items_mercado (espacio_id, nombre_producto);
create index if not exists idx_sesiones_mercado_espacio_estado on sesiones_mercado (espacio_id, estado);

alter table sesiones_mercado enable row level security;
alter table items_mercado enable row level security;

-- Cualquier miembro del espacio puede ver/crear/editar sesiones e items del mismo espacio,
-- igual que el resto de tablas compartidas (espacio_miembros como fuente de verdad).
drop policy if exists "sesiones_mercado_members" on sesiones_mercado;
create policy "sesiones_mercado_members" on sesiones_mercado
for all using (
  exists (
    select 1 from espacio_miembros
    where espacio_miembros.espacio_id = sesiones_mercado.espacio_id
      and espacio_miembros.usuario_id = auth.uid()
  )
);

drop policy if exists "items_mercado_members" on items_mercado;
create policy "items_mercado_members" on items_mercado
for all using (
  exists (
    select 1 from espacio_miembros
    where espacio_miembros.espacio_id = items_mercado.espacio_id
      and espacio_miembros.usuario_id = auth.uid()
  )
);
