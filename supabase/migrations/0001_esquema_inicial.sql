-- Esquema inicial de La Escuelita de Emilia.
-- Principio: el niño NO tiene datos personales; solo alias, avatar y rango de edad.

create table organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  plan text not null default 'jardin' check (plan in ('jardin', 'colegio')),
  creada_en timestamptz not null default now()
);

create table adultos (
  id uuid primary key references auth.users (id) on delete cascade,
  rol text not null default 'familia' check (rol in ('familia', 'educador')),
  organizacion_id uuid references organizaciones (id) on delete set null,
  plan text not null default 'gratis' check (plan in ('gratis', 'familia', 'institucional')),
  creado_en timestamptz not null default now()
);

create table perfiles (
  id uuid primary key default gen_random_uuid(),
  adulto_id uuid not null references adultos (id) on delete cascade,
  alias text not null check (char_length(alias) between 1 and 20),
  avatar text not null,
  rango_edad text not null check (rango_edad in ('3-4', '4-5', '5-6')),
  creado_en timestamptz not null default now()
);

create table intentos (
  id bigint generated always as identity primary key,
  perfil_id uuid not null references perfiles (id) on delete cascade,
  modulo text not null check (modulo in ('pintar', 'letras', 'numeros', 'animales', 'juegos')),
  actividad text not null,
  item text not null,
  acierto boolean not null,
  duracion_ms integer not null check (duracion_ms >= 0),
  fecha timestamptz not null
);
create index intentos_perfil_fecha on intentos (perfil_id, fecha desc);

create table progreso (
  perfil_id uuid not null references perfiles (id) on delete cascade,
  actividad text not null,
  nivel smallint not null default 1 check (nivel between 1 and 3),
  estrellas integer not null default 0,
  dominio real not null default 0 check (dominio between 0 and 1),
  actualizado_en timestamptz not null default now(),
  primary key (perfil_id, actividad)
);

create table dibujos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles (id) on delete cascade,
  ruta_storage text not null,
  creado_en timestamptz not null default now()
);

-- Row Level Security: cada adulto solo accede a lo suyo.
alter table adultos enable row level security;
alter table perfiles enable row level security;
alter table intentos enable row level security;
alter table progreso enable row level security;
alter table dibujos enable row level security;

create policy "adulto se ve a sí mismo" on adultos
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "adulto gestiona sus perfiles" on perfiles
  for all using (adulto_id = auth.uid()) with check (adulto_id = auth.uid());

create policy "intentos de mis perfiles" on intentos
  for all using (perfil_id in (select id from perfiles where adulto_id = auth.uid()))
  with check (perfil_id in (select id from perfiles where adulto_id = auth.uid()));

create policy "progreso de mis perfiles" on progreso
  for all using (perfil_id in (select id from perfiles where adulto_id = auth.uid()))
  with check (perfil_id in (select id from perfiles where adulto_id = auth.uid()));

create policy "dibujos de mis perfiles" on dibujos
  for all using (perfil_id in (select id from perfiles where adulto_id = auth.uid()))
  with check (perfil_id in (select id from perfiles where adulto_id = auth.uid()));
