-- Distingue suscripciones PRO pagadas de accesos PRO de prueba/cortesía.
-- Copia y ejecuta esto en el SQL Editor de Supabase (no se aplica solo, este repo no
-- tiene acceso directo a tu proyecto de Supabase).

alter table perfiles
  add column if not exists es_prueba boolean not null default false;
