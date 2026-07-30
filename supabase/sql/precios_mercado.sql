-- Esquema para el "Consultor de precios" (referencia de precios de gamaenlinea.com).
-- Copia y ejecuta esto en el SQL Editor de Supabase (no se aplica solo, este repo no
-- tiene acceso directo a tu proyecto de Supabase).
--
-- Es data de referencia COMPARTIDA entre todos los usuarios (no pertenece a un espacio_id
-- puntual), por eso el modelo de RLS es distinto al resto de tablas: cualquier usuario
-- autenticado puede leer, pero solo el server (con la service role key) puede escribir.

-- Catálogo local de productos de Gama, sincronizado desde su sitemap público
-- (gamaenlinea.com/sitemap.xml). Nos sirve de "buscador" propio ya que el buscador
-- real de Gama (products/search) devuelve error 500 en su backend.
create table if not exists precios_mercado_catalogo (
  id uuid primary key default gen_random_uuid(),
  codigo_producto text not null unique,
  nombre_producto text not null,
  slug text not null,
  url_producto text not null,
  categoria_code text,
  categoria_nombre text,
  synced_at timestamptz not null default now()
);

create index if not exists idx_precios_catalogo_categoria on precios_mercado_catalogo (categoria_nombre);
create index if not exists idx_precios_catalogo_nombre on precios_mercado_catalogo using gin (to_tsvector('spanish', nombre_producto));

-- Snapshots de precio por producto. Guardamos histórico (no upsert) para que la
-- lectura de caché ("¿hay uno de este código con menos de 24h?") sea una consulta simple.
create table if not exists precios_mercado (
  id uuid primary key default gen_random_uuid(),
  codigo_producto text not null references precios_mercado_catalogo(codigo_producto) on delete cascade,
  nombre_producto text not null,
  precio_ref numeric not null,
  iva_ref numeric not null,
  precio_total numeric not null,
  tasa_bcv numeric not null,
  categoria_code text,
  categoria_nombre text,
  fuente text not null default 'gamaenlinea.com',
  url_producto text not null,
  scraped_at timestamptz not null default now()
);

create index if not exists idx_precios_mercado_codigo_scraped on precios_mercado (codigo_producto, scraped_at desc);

alter table precios_mercado_catalogo enable row level security;
alter table precios_mercado enable row level security;

-- Lectura: cualquier usuario autenticado (incluye invitados con sesión) puede ver la
-- referencia de precios. Sin política de insert/update/delete para authenticated/anon,
-- así que esas operaciones quedan bloqueadas por RLS salvo con la service role key
-- (que siempre pasa por encima de RLS) desde el server.
drop policy if exists "precios_catalogo_select_auth" on precios_mercado_catalogo;
create policy "precios_catalogo_select_auth" on precios_mercado_catalogo
for select using (auth.role() = 'authenticated');

drop policy if exists "precios_mercado_select_auth" on precios_mercado;
create policy "precios_mercado_select_auth" on precios_mercado
for select using (auth.role() = 'authenticated');
